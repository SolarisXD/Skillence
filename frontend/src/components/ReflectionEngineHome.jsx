import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import Icons from "./Icons/ReflectionEngineIcons.jsx";

export default function ReflectionEngineHome() {
  const navigate = useNavigate();

  const handleStartJourney = () => {
    navigate('/reflection-engine/diagnostic');
  };

  return (
    <>
      <Navbar />
      <div className="hero-container">
        {/* Custom Reflection Engine Background Animation */}
        <div className="reflection-bg">
          {/* Animated Floating Shapes */}
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
          <div className="floating-shape shape-5"></div>
          
          {/* Animated Gradient Beams */}
          <div className="gradient-beam beam-1"></div>
          <div className="gradient-beam beam-2"></div>
          <div className="gradient-beam beam-3"></div>
          
          {/* Particle Effects */}
          <div className="particle-field">
            {Array.from({ length: 15 }, (_, i) => (
              <div key={i} className={`particle particle-${i + 1}`}></div>
            ))}
          </div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            Interview intelligence that matters,{' '}
            <span style={{
              background: 'var(--accent-gradient)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              crafted by people who care.
            </span>
          </h1>
          <p className="main-hero-subtitle">
            Only mistakes can truly improve a person. Every failure teaches us what success cannot. 
            Reflection Engine transforms your interview setbacks into stepping stones, because growth 
            happens in the loop of learning from what went wrong.
          </p>
          <div className="hero-buttons">
            <button className="cta-button primary" onClick={handleStartJourney}>
              Get Started
            </button>
          </div>
          
          {/* Process Flow - positioned below main content */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '20px',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '80px',
            flexWrap: 'wrap',
            opacity: '0.9'
          }}>
            {[
              { step: 'Mistake', iconType: 'error' },
              { step: 'Detection', iconType: 'search' },
              { step: 'Feedback', iconType: 'lightbulb' },
              { step: 'Action', iconType: 'sparkles' },
              { step: 'Review', iconType: 'chart' },
              { step: 'Repeat if unfixed', iconType: 'cycle' }
            ].map((item, index) => {
              const getIcon = (type) => {
                switch(type) {
                  case 'error': return <Icons.X size={16} />;
                  case 'search': return <Icons.Search size={16} />;
                  case 'lightbulb': return <Icons.Lightbulb size={16} />;
                  case 'sparkles': return <Icons.Sparkles size={16} />;
                  case 'chart': return <Icons.Chart size={16} />;
                  case 'cycle': return <span style={{fontSize: '16px', fontWeight: 'bold'}}>↻</span>;
                  default: return null;
                }
              };
              
              return (
                <div
                  key={item.step}
                  style={{
                    padding: '12px 16px',
                    background: 'var(--card-gradient)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'var(--shadow)',
                    transition: 'var(--transition-base)',
                    cursor: 'default'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{getIcon(item.iconType)}</span>
                  <span>{item.step}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">How Reflection Engine Works</h2>
          <p className="section-subtitle">
            Our AI-powered platform turns your interview experiences into actionable insights for career growth.
          </p>
          <div className="features-grid">
            {[
              {
                iconComponent: <Icons.Target size={32} />,
                title: 'Track Interview Patterns',
                description: 'Log your interview experiences, questions, and outcomes to identify recurring challenges and improvement areas.'
              },
              {
                iconComponent: <Icons.Brain size={32} />,
                title: 'AI-Powered Analysis',
                description: 'Our intelligent system analyzes your patterns, provides personalized feedback, and suggests targeted improvements.'
              },
              {
                iconComponent: <Icons.Chart size={32} />,
                title: 'Measure Your Growth',
                description: 'Track your progress over time with detailed analytics and celebrate your interview success milestones.'
              }
            ].map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.iconComponent}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section style={{
        padding: '60px 20px',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '60px',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div>
              <div style={{
                display: 'inline-block',
                padding: '8px 16px',
                background: 'var(--accent-gradient)',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '24px'
              }}>
                Why Choose Us
              </div>
              <h2 style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: '800',
                color: 'var(--text-primary)',
                marginBottom: '24px',
                lineHeight: '1.1'
              }}>
                Why Reflection Engine is{' '}
                <span style={{
                  background: 'var(--accent-gradient)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Different
                </span>
              </h2>
              <p style={{
                fontSize: '18px',
                color: 'var(--text-secondary)',
                lineHeight: '1.7',
                marginBottom: '40px'
              }}>
                While others focus on what you did right, we believe growth comes from understanding what went wrong. 
                Our AI doesn't just analyze your responses—it diagnoses the underlying patterns that lead to interview 
                challenges and creates personalized improvement pathways.
              </p>
              
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Pattern Recognition', value: '95%' },
                  { label: 'Success Rate', value: '89%' },
                  { label: 'User Growth', value: '78%' }
                ].map((stat, index) => (
                  <div key={stat.label} style={{
                    padding: '20px',
                    background: 'var(--card-gradient)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    backdropFilter: 'blur(10px)',
                    minWidth: '120px'
                  }}>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: '800',
                      color: 'var(--accent-color)',
                      marginBottom: '8px'
                    }}>
                      {stat.value}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      fontWeight: '500'
                    }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Chat Preview */}
            <div style={{
              position: 'relative',
              height: '450px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '100%',
                maxWidth: '400px',
                height: '400px',
                background: 'var(--card-gradient)',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                backdropFilter: 'blur(20px)',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <div style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  padding: '12px',
                  marginBottom: '20px'
                }}>
                  💬 Reflection Engine AI Coach
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  height: 'calc(100% - 60px)'
                }}>
                  <div style={{
                    alignSelf: 'flex-start',
                    maxWidth: '85%',
                    padding: '12px 16px',
                    background: 'var(--accent-gradient)',
                    borderRadius: '12px 12px 12px 4px',
                    color: '#ffffff',
                    fontSize: '13px',
                    lineHeight: '1.4'
                  }}>
                    Hi! I noticed you mentioned feeling nervous during technical questions. Can you tell me more?
                  </div>
                  
                  <div style={{
                    alignSelf: 'flex-end',
                    maxWidth: '85%',
                    padding: '12px 16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '12px 12px 4px 12px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    lineHeight: '1.4'
                  }}>
                    I struggled with explaining my thought process while coding...
                  </div>
                  
                  <div style={{
                    alignSelf: 'flex-start',
                    maxWidth: '85%',
                    padding: '12px 16px',
                    background: 'var(--accent-gradient)',
                    borderRadius: '12px 12px 12px 4px',
                    color: '#ffffff',
                    fontSize: '13px',
                    lineHeight: '1.4'
                  }}>
                    That's common! Let's work on strategies to verbalize your coding process.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 20px',
        textAlign: 'center',
        background: 'var(--bg-primary)'
      }}>
        <div className="container">
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: '24px'
          }}>
            Ready to Transform Your Interview Success?
          </h2>
          <p style={{
            fontSize: '20px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '48px',
            maxWidth: '600px',
            margin: '0 auto 48px auto'
          }}>
            Join thousands of professionals who have mastered their interview skills and landed their dream jobs.
          </p>
          
          <button className="cta-button primary" onClick={handleStartJourney}>
            Get Started Now →
          </button>
        </div>
      </section>

      {/* Custom Reflection Engine Background Styles */}
      <style jsx>{`
        .reflection-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          z-index: 1;
        }

        /* Floating Geometric Shapes */
        .floating-shape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%);
          backdrop-filter: blur(20px);
          animation: floatAndRotate 20s ease-in-out infinite;
        }

        .shape-1 {
          width: 120px;
          height: 120px;
          top: 15%;
          right: 15%;
          animation-duration: 25s;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 80px;
          height: 80px;
          top: 60%;
          left: 10%;
          animation-duration: 30s;
          animation-delay: 5s;
          border-radius: 20%;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%);
        }

        .shape-3 {
          width: 200px;
          height: 200px;
          bottom: 20%;
          right: 20%;
          animation-duration: 35s;
          animation-delay: 10s;
          opacity: 0.6;
        }

        .shape-4 {
          width: 60px;
          height: 60px;
          top: 35%;
          left: 25%;
          animation-duration: 22s;
          animation-delay: 8s;
          border-radius: 30%;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
        }

        .shape-5 {
          width: 160px;
          height: 160px;
          top: 70%;
          right: 45%;
          animation-duration: 28s;
          animation-delay: 15s;
          border-radius: 40%;
        }

        /* Animated Gradient Beams */
        .gradient-beam {
          position: absolute;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
          animation: slideBeam 15s ease-in-out infinite;
        }

        .beam-1 {
          width: 2px;
          height: 100%;
          left: 20%;
          animation-duration: 18s;
          animation-delay: 0s;
        }

        .beam-2 {
          width: 100%;
          height: 1px;
          top: 30%;
          animation-duration: 22s;
          animation-delay: 7s;
          background: linear-gradient(0deg, transparent, rgba(99, 102, 241, 0.25), transparent);
        }

        .beam-3 {
          width: 1px;
          height: 100%;
          right: 35%;
          animation-duration: 20s;
          animation-delay: 12s;
        }

        /* Particle Field */
        .particle-field {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: rgba(59, 130, 246, 0.8);
          border-radius: 50%;
          animation: particleFloat 25s ease-in-out infinite;
        }

        .particle-1 { top: 10%; left: 15%; animation-delay: 0s; }
        .particle-2 { top: 25%; left: 85%; animation-delay: 3s; }
        .particle-3 { top: 45%; left: 25%; animation-delay: 6s; }
        .particle-4 { top: 65%; left: 75%; animation-delay: 9s; }
        .particle-5 { top: 80%; left: 15%; animation-delay: 12s; }
        .particle-6 { top: 15%; left: 60%; animation-delay: 15s; }
        .particle-7 { top: 35%; left: 45%; animation-delay: 18s; }
        .particle-8 { top: 55%; left: 80%; animation-delay: 21s; }
        .particle-9 { top: 75%; left: 35%; animation-delay: 24s; }
        .particle-10 { top: 20%; left: 40%; animation-delay: 27s; }
        .particle-11 { top: 40%; left: 15%; animation-delay: 30s; }
        .particle-12 { top: 60%; left: 65%; animation-delay: 33s; }
        .particle-13 { top: 85%; left: 55%; animation-delay: 36s; }
        .particle-14 { top: 30%; left: 70%; animation-delay: 39s; }
        .particle-15 { top: 50%; left: 50%; animation-delay: 42s; }

        /* Animations */
        @keyframes floatAndRotate {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(-30px) translateX(20px) rotate(90deg) scale(1.1);
          }
          50% {
            transform: translateY(-50px) translateX(-15px) rotate(180deg) scale(0.9);
          }
          75% {
            transform: translateY(-20px) translateX(-30px) rotate(270deg) scale(1.05);
          }
        }

        @keyframes slideBeam {
          0%, 100% {
            opacity: 0;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes particleFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.3;
          }
          33% {
            transform: translateY(-40px) scale(1.5);
            opacity: 0.8;
          }
          66% {
            transform: translateY(-20px) scale(0.8);
            opacity: 0.5;
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .floating-shape {
            display: none;
          }
          .gradient-beam {
            opacity: 0.5;
          }
          .particle {
            width: 2px;
            height: 2px;
          }
        }
      `}</style>
    </>
  );
}