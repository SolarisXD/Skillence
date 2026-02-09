import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import NeuralBg from "./NeuralBg";
import Icons from "./Icons/ReflectionEngineIcons.jsx";

export default function ReflectionEngineHome() {
  const navigate = useNavigate();

  const handleStartJourney = () => {
    navigate('/reflection-engine/diagnostic');
  };

  return (
    <>
      <Navbar />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a37 100%)',
        color: '#ffffff',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
      {/* Background Blur Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '500px',
        height: '500px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        animation: 'float 20s ease-in-out infinite',
        zIndex: 1
      }}></div>

      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '-15%',
        width: '600px',
        height: '600px',
        background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'float 25s ease-in-out infinite reverse',
        zIndex: 1
      }}></div>

      {/* Flowing curve elements */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none'
        }}
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="curve1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: 'rgba(102, 126, 234, 0.3)', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: 'rgba(118, 75, 162, 0.1)', stopOpacity: 1}} />
          </linearGradient>
          <linearGradient id="curve2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: 'rgba(255, 107, 107, 0.2)', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: 'rgba(255, 142, 83, 0.1)', stopOpacity: 1}} />
          </linearGradient>
        </defs>
        <path
          d="M1200,0 C1400,200 1600,400 1920,300 L1920,0 Z"
          fill="url(#curve1)"
          style={{ animation: 'morphing 15s ease-in-out infinite' }}
        />
        <path
          d="M800,1080 C1000,800 1200,600 1920,700 L1920,1080 Z"
          fill="url(#curve2)"
          style={{ animation: 'morphing 20s ease-in-out infinite reverse' }}
        />
      </svg>

      {/* Hero Section */}
      <section id="home" style={{
        padding: '120px 64px 40px 64px',
        position: 'relative',
        zIndex: 5,
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '80px',
          alignItems: 'center'
        }}>
          <div style={{ maxWidth: '800px' }}>
            <h1 style={{
              fontSize: 'clamp(48px, 6vw, 84px)',
              fontWeight: '800',
              lineHeight: '0.95',
              marginBottom: '40px',
              color: '#ffffff',
              letterSpacing: '-2px',
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Interview intelligence that matters,{' '}
              <span style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                crafted by people who care.
              </span>
            </h1>

            <p style={{
              fontSize: '22px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '1.6',
              marginBottom: '60px',
              fontWeight: '400',
              maxWidth: '600px'
            }}>
              Only mistakes can truly improve a person. Every failure teaches us what success cannot. Reflection Engine transforms your interview setbacks into stepping stones, because growth happens in the loop of learning from what went wrong.
            </p>

            <button
              onClick={handleStartJourney}
              style={{
                padding: '20px 48px',
                borderRadius: '50px',
                border: 'none',
                background: 'linear-gradient(135deg, #4169E1 0%, #87CEEB 100%)',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 8px 32px 0 rgba(65, 105, 225, 0.4)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 12px 48px 0 rgba(65, 105, 225, 0.6)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0px)';
                e.target.style.boxShadow = '0 8px 32px 0 rgba(65, 105, 225, 0.4)';
              }}
            >
              Start Your Journey →
            </button>
          </div>

          {/* Process Flow */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            alignItems: 'flex-end',
            opacity: '0.8'
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
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.9)',
                  animation: `fadeInUp 0.6s ease-out ${index * 0.15}s both`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease',
                  cursor: 'default'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateX(-8px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateX(0px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
              >
                <span style={{ fontSize: '18px' }}>{getIcon(item.iconType)}</span>
                <span>{item.step}</span>
              </div>
            );
          })}
          </div>
        </div>
      </section>

      {/* Why Reflection Engine is Different */}
      <section style={{
        padding: '60px 64px',
        position: 'relative',
        zIndex: 5,
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '32px',
              lineHeight: '1.1',
              letterSpacing: '-1px'
            }}>
              Why Reflection Engine is{' '}
              <span style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Different
              </span>
            </h2>
            
            <p style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: '1.7',
              marginBottom: '40px'
            }}>
              While others focus on what you did right, we believe growth comes from understanding what went wrong. Our AI doesn't just analyze your responses—it diagnoses the underlying patterns that lead to interview challenges and creates personalized improvement pathways.
            </p>
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {[
                { label: 'Pattern Recognition', value: '95%' },
                { label: 'Success Rate', value: '89%' },
                { label: 'User Growth', value: '78%' }
              ].map((stat, index) => (
                <div key={stat.label} style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  minWidth: '120px'
                }}>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '800',
                    color: '#667eea',
                    marginBottom: '8px'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.6)',
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
            height: '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '400px',
              height: '450px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              padding: '32px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                right: '20px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: '600'
              }}>
                💬 Reflection Engine AI Coach
              </div>
              
              <div style={{
                marginTop: '60px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                height: 'calc(100% - 80px)',
                overflowY: 'hidden'
              }}>
                <div style={{
                  alignSelf: 'flex-start',
                  maxWidth: '80%',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px 12px 12px 4px',
                  color: '#ffffff',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>
                  Hi! I noticed you mentioned feeling nervous during technical questions. Can you tell me more about what specifically made you feel that way?
                </div>
                
                <div style={{
                  alignSelf: 'flex-end',
                  maxWidth: '80%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px 12px 4px 12px',
                  color: '#ffffff',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>
                  I think I struggled with explaining my thought process while coding...
                </div>
                
                <div style={{
                  alignSelf: 'flex-start',
                  maxWidth: '80%',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px 12px 12px 4px',
                  color: '#ffffff',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>
                  That's a common challenge! Let's work on strategies to verbalize your coding process. Have you tried the "rubber duck" method before?
                </div>
                
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  right: '20px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '16px',
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  Type your response...
                  <div style={{
                    marginLeft: 'auto',
                    marginRight: '16px',
                    width: '8px',
                    height: '8px',
                    background: '#667eea',
                    borderRadius: '50%',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '60px 64px',
        position: 'relative',
        zIndex: 5,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          textAlign: 'center',
          marginBottom: '80px'
        }}>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 56px)',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '24px',
            letterSpacing: '-1px'
          }}>
            How Reflection Engine Works
          </h2>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.6)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Our AI-powered platform turns your interview experiences into actionable insights for career growth.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '40px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {[
            {
              iconComponent: <Icons.Target size={32} />,
              title: 'Track Interview Patterns',
              description: 'Log your interview experiences, questions, and outcomes to identify recurring challenges and improvement areas.',
              gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            {
              iconComponent: <Icons.Brain size={32} />,
              title: 'AI-Powered Analysis',
              description: 'Our intelligent system analyzes your patterns, provides personalized feedback, and suggests targeted improvements.',
              gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            },
            {
              iconComponent: <Icons.Chart size={32} />,
              title: 'Measure Your Growth',
              description: 'Track your progress over time with detailed analytics and celebrate your interview success milestones.',
              gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
            }
          ].map((feature, index) => (
            <div
              key={index}
              style={{
                padding: '40px 32px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(20px)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                fontSize: '48px',
                marginBottom: '24px',
                display: 'inline-block'
              }}>
                {feature.iconComponent}
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: '1.6',
                margin: 0
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" style={{
        padding: '40px 64px 40px 64px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 5
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '24px',
            letterSpacing: '-1px'
          }}>
            Ready to Transform Your Interview Success?
          </h2>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.6)',
            lineHeight: '1.6',
            marginBottom: '48px',
            maxWidth: '600px',
            margin: '0 auto 48px auto'
          }}>
            Join thousands of professionals who have mastered their interview skills and landed their dream jobs.
          </p>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleStartJourney}
              style={{
                padding: '20px 48px',
                borderRadius: '50px',
                border: 'none',
                background: 'linear-gradient(135deg, #4169E1 0%, #87CEEB 100%)',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 8px 32px 0 rgba(65, 105, 225, 0.4)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 12px 48px 0 rgba(65, 105, 225, 0.6)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0px)';
                e.target.style.boxShadow = '0 8px 32px 0 rgba(65, 105, 225, 0.4)';
              }}
            >
              Get Started Now →
            </button>
          </div>
        </div>
      </section>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          transition: all 0.2s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
          box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
        }
        
        /* Firefox Scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: #667eea rgba(0, 0, 0, 0.2);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        
        @keyframes morphing {
          0%, 100% { d: path("M1200,0 C1400,200 1600,400 1920,300 L1920,0 Z"); }
          50% { d: path("M1000,0 C1300,150 1500,350 1920,250 L1920,0 Z"); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
    </>
  );
}
