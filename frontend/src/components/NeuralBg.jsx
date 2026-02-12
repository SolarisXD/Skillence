import React, { useRef, useEffect, useState } from 'react';
import { Renderer, Camera, Transform, Program, Mesh, Plane } from 'ogl';
// Note: using inline styles (not Tailwind) to avoid layout issues

const NeuralBg = ({ 
  hue = null, // Will be auto-determined by theme if null
  saturation = 0.8, 
  chroma = 0.6, 
  className = '' 
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const meshRef = useRef(null);
  const cameraRef = useRef(null);
  const [currentTheme, setCurrentTheme] = useState('light');

  const pointerRef = useRef({
    x: 0,
    y: 0,
    tX: 0,
    tY: 0,
  });

  // Detect theme changes
  useEffect(() => {
    const detectTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme') || 'light';
      setCurrentTheme(theme);
    };

    detectTheme();

    // Watch for theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  // Get theme-appropriate hue
  const getThemeHue = () => {
    if (hue !== null) return hue;
    
    // Use blue (200°) for both themes - only background color changes
    return 200;
  };

  // Get theme-appropriate colors
  const getThemeColors = () => {
    const themeHue = getThemeHue();
    
    if (currentTheme === 'dark') {
      return {
        hue: themeHue,
        saturation: saturation,
        chroma: chroma,
        backgroundColor: [0.051, 0.067, 0.09] // #0d1117 - Slate dark background
      };
    } else {
      return {
        hue: themeHue,
        saturation: saturation,
        chroma: chroma,
        backgroundColor: [1.0, 1.0, 1.0] // White background for light mode
      };
    }
  };

  const vertexShader = `
    precision mediump float;

    attribute vec2 position;
    attribute vec2 uv;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShader = `
    precision mediump float;

    varying vec2 vUv;
    uniform float u_time;
    uniform float u_ratio;
    uniform vec2 u_pointer_position;
    uniform float u_scroll_progress;
    uniform float u_hue;
    uniform float u_saturation;
    uniform float u_chroma;
    uniform vec3 u_background_color;

    vec2 rotate(vec2 uv, float th) {
        return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
    }

    float neuro_shape(vec2 uv, float t, float p) {
        vec2 sine_acc = vec2(0.);
        vec2 res = vec2(0.);
        float scale = 8.;

        for (int j = 0; j < 15; j++) {
            uv = rotate(uv, 1.);
            sine_acc = rotate(sine_acc, 1.);
            vec2 layer = uv * scale + float(j) + sine_acc - t;
            sine_acc += sin(layer) + 2.4 * p;
            res += (.5 + .5 * cos(layer)) / scale;
            scale *= (1.2);
        }
        return res.x + res.y;
    }

    // HSL to RGB conversion
    vec3 hsl2rgb(vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
        return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
    }

    void main() {
        vec2 uv = .5 * vUv;
        uv.x *= u_ratio;

        vec2 pointer = vUv - u_pointer_position;
        pointer.x *= u_ratio;
        float p = clamp(length(pointer), 0., 1.);
        p = .5 * pow(1. - p, 2.);

        float t = .001 * u_time;

        float noise = neuro_shape(uv, t, p);

        noise = 1.2 * pow(noise, 3.);
        noise += pow(noise, 10.);
        noise = max(.0, noise - .5);
        noise *= (1. - length(vUv - .5));

        // Convert hue from degrees to 0-1 range
        float normalizedHue = u_hue / 360.0;
        
        // Create HSL color with animation
        vec3 hsl = vec3(
            normalizedHue + 0.1 * sin(3.0 * u_scroll_progress + 1.5),
            u_saturation,
            u_chroma * 0.5 + 0.2 * sin(2.0 * u_scroll_progress)
        );

        // Convert to RGB
        vec3 neuralColor = hsl2rgb(hsl);
        
        // Always show background, with neural color overlaid based on noise intensity
        vec3 finalColor = mix(u_background_color, neuralColor, noise * 0.8);

        gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  const initOGL = () => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    try {
      const renderer = new Renderer({
        canvas,
        width: canvas.clientWidth,
        height: canvas.clientHeight,
        dpr: Math.min(window.devicePixelRatio, 2),
      });

      const themeColors = getThemeColors();
      
      // Set WebGL clear color based on theme
      renderer.gl.clearColor(
        themeColors.backgroundColor[0], 
        themeColors.backgroundColor[1], 
        themeColors.backgroundColor[2], 
        1.0
      );

      const camera = new Camera(renderer.gl);
      const scene = new Transform();

      const geometry = new Plane(renderer.gl, {
        width: 2,
        height: 2,
      });

      const program = new Program(renderer.gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          u_time: { value: 0 },
          u_ratio: { value: window.innerWidth / window.innerHeight },
          u_pointer_position: { value: [0, 0] },
          u_scroll_progress: { value: 0 },
          u_hue: { value: themeColors.hue },
          u_saturation: { value: themeColors.saturation },
          u_chroma: { value: themeColors.chroma },
          u_background_color: { value: themeColors.backgroundColor },
        },
      });

      const mesh = new Mesh(renderer.gl, {
        geometry,
        program,
      });

      mesh.setParent(scene);

      rendererRef.current = renderer;
      cameraRef.current = camera;
      sceneRef.current = scene;
      meshRef.current = mesh;

      return true;
    } catch (error) {
      console.error("Error initializing OGL:", error);
      return false;
    }
  };

  const resizeCanvas = () => {
    const renderer = rendererRef.current;
    const mesh = meshRef.current;
    const canvas = canvasRef.current;

    if (!canvas || !renderer || !mesh) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    renderer.setSize(width, height);

    // Update ratio uniform
    if (mesh.program && mesh.program.uniforms.u_ratio) {
      mesh.program.uniforms.u_ratio.value = width / height;
    }
  };

  const render = () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const mesh = meshRef.current;
    const pointer = pointerRef.current;

    if (!renderer || !scene || !camera || !mesh) return;

    const currentTime = performance.now();

    // Smooth pointer interpolation
    pointer.x += (pointer.tX - pointer.x) * 0.2;
    pointer.y += (pointer.tY - pointer.y) * 0.2;

    // Update uniforms
    if (mesh.program && mesh.program.uniforms) {
      const uniforms = mesh.program.uniforms;

      if (uniforms.u_time) uniforms.u_time.value = currentTime;
      if (uniforms.u_pointer_position) {
        uniforms.u_pointer_position.value = [
          pointer.x / window.innerWidth,
          1 - pointer.y / window.innerHeight,
        ];
      }
      if (uniforms.u_scroll_progress) {
        uniforms.u_scroll_progress.value = window.pageYOffset / (2 * window.innerHeight);
      }
    }

    // Clear canvas with background color before rendering
    renderer.gl.clear(renderer.gl.COLOR_BUFFER_BIT);
    renderer.render({ scene, camera });
    animationRef.current = requestAnimationFrame(render);
  };

  const updateMousePosition = (x, y) => {
    pointerRef.current.tX = x;
    pointerRef.current.tY = y;
  };

  const handlePointerMove = (e) => {
    updateMousePosition(e.clientX, e.clientY);
  };

  const handleTouchMove = (e) => {
    updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleClick = (e) => {
    updateMousePosition(e.clientX, e.clientY);
  };

  // Update uniforms when theme changes
  useEffect(() => {
    const mesh = meshRef.current;
    const renderer = rendererRef.current;
    
    if (mesh && mesh.program && mesh.program.uniforms) {
      const themeColors = getThemeColors();
      
      if (mesh.program.uniforms.u_hue) {
        mesh.program.uniforms.u_hue.value = themeColors.hue;
      }
      if (mesh.program.uniforms.u_saturation) {
        mesh.program.uniforms.u_saturation.value = themeColors.saturation;
      }
      if (mesh.program.uniforms.u_chroma) {
        mesh.program.uniforms.u_chroma.value = themeColors.chroma;
      }
      if (mesh.program.uniforms.u_background_color) {
        mesh.program.uniforms.u_background_color.value = themeColors.backgroundColor;
      }
      
      // Update WebGL clear color when theme changes
      if (renderer && renderer.gl) {
        renderer.gl.clearColor(
          themeColors.backgroundColor[0], 
          themeColors.backgroundColor[1], 
          themeColors.backgroundColor[2], 
          1.0
        );
      }
    }
  }, [currentTheme, hue, saturation, chroma]);

  useEffect(() => {
    if (initOGL()) {
      resizeCanvas();
      render();

      window.addEventListener("resize", resizeCanvas);
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("click", handleClick);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("click", handleClick);

      // Clean up OGL resources
      if (rendererRef.current) {
        rendererRef.current = null;
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      // Fill the parent (hero-container) and stay out of layout flow
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.95,
        zIndex: 1,
        ...((className && typeof className === 'object') ? className : {}),
      }}
    />
  );
};

export default NeuralBg;
