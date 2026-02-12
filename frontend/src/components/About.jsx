import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import { Award, TrendingUp, Zap, Shield, Users, Github } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  // Manual contributors list (since repository is private)
  const contributors = [
    {
      name: 'Namit Rustagi',
      login: 'Karma121221',
      avatar_url: 'https://github.com/Karma121221.png',
      html_url: 'https://github.com/Karma121221',
      role: 'Lead Developer'
    },
    {
      name: 'Rahul Gehlot',
      login: 'SolarisXD',
      avatar_url: 'https://github.com/SolarisXD.png',
      html_url: 'https://github.com/SolarisXD',
      role: 'Full Stack Developer'
    },
    {
      name: 'Manan',
      login: 'Manan-S85',
      avatar_url: 'https://github.com/Manan-S85.png',
      html_url: 'https://github.com/Manan-S85',
      role: 'Backend Developer'
    },
    {
      name: 'Rajeev Ranjan Pratap Singh',
      login: 'RAJEEVRANJAN0001',
      avatar_url: 'https://github.com/RAJEEVRANJAN0001.png',
      html_url: 'https://github.com/RAJEEVRANJAN0001',
      role: 'Frontend Developer'
    },
    {
      name: 'Kshitiz Srivastava',
      login: 'KshitizCodeHub',
      avatar_url: 'https://github.com/KshitizCodeHub.png',
      html_url: 'https://github.com/KshitizCodeHub',
      role: 'UI/UX Developer'
    }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        paddingTop: '100px',
        paddingBottom: '80px'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          {/* Hero Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '80px'
          }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '24px',
              lineHeight: '1.1'
            }}>
              AI-Powered Career Intelligence
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: 'var(--text-secondary)',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.8'
            }}>
              Transforming career development through cutting-edge artificial intelligence, 
              data-driven insights, and personalized recommendations.
            </p>
          </div>

          {/* Mission Section */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '24px',
            padding: '60px 40px',
            marginBottom: '60px',
            border: '1px solid var(--border-color)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: 'var(--accent-gradient)',
              opacity: '0.1',
              borderRadius: '50%',
              filter: 'blur(40px)'
            }} />
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '24px',
              textAlign: 'center',
              position: 'relative',
              zIndex: 1
            }}>
              Our Mission
            </h2>
            <p style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.8',
              textAlign: 'center',
              maxWidth: '900px',
              margin: '0 auto',
              position: 'relative',
              zIndex: 1
            }}>
              We empower professionals worldwide to make confident, data-driven career decisions 
              through cutting-edge AI technology. By combining machine learning, real-time market 
              insights, and personalized recommendations, we help individuals unlock their full 
              potential and achieve sustainable career growth in an ever-evolving job landscape.
            </p>
          </div>

          {/* Values Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginBottom: '80px'
          }}>
            {[
              {
                icon: <Zap size={40} />,
                title: 'Innovation First',
                description: 'Pioneering the latest AI and ML technologies to deliver cutting-edge career intelligence and predictive insights.'
              },
              {
                icon: <Users size={40} />,
                title: 'User-Centric Design',
                description: 'Every feature is crafted with user success in mind, ensuring intuitive experiences and actionable outcomes.'
              },
              {
                icon: <Shield size={40} />,
                title: 'Data Privacy',
                description: 'Enterprise-grade security protecting your personal information with industry-leading encryption standards.'
              },
              {
                icon: <TrendingUp size={40} />,
                title: 'Continuous Growth',
                description: 'Helping professionals adapt, learn, and advance through personalized pathways and real-time market intelligence.'
              }
            ].map((value, index) => (
              <div key={index} style={{
                background: 'var(--bg-secondary)',
                padding: '40px 30px',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                transition: 'all 0.3s ease',
                cursor: 'default',
                position: 'relative'
              }}
              className="value-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '16px',
                  background: 'rgba(37, 99, 235, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-color)',
                  marginBottom: '24px'
                }}>
                  {value.icon}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '12px'
                }}>
                  {value.title}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6'
                }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>

          {/* Team Section */}
          <div style={{
            marginBottom: '80px'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '48px'
            }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '12px'
              }}>
                Our Team
              </h2>
              <p style={{
                fontSize: '1.15rem',
                color: 'var(--text-secondary)',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Meet the talented contributors building AI Skillence
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem'
            }}>
              {contributors.map((contributor, index) => (
                <a
                  key={index}
                  href={contributor.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'var(--bg-secondary)',
                    padding: '28px 20px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.borderColor = 'var(--accent-color)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <img
                    src={contributor.avatar_url}
                    alt={contributor.login}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      border: '3px solid var(--border-color)'
                    }}
                  />
                  <div>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '4px'
                    }}>
                      {contributor.name || contributor.login}
                    </h3>
                    {contributor.name && (
                      <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        marginBottom: '6px'
                      }}>
                        @{contributor.login}
                      </p>
                    )}
                    {contributor.role && (
                      <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--accent-color)',
                        marginBottom: '12px',
                        fontWeight: '600'
                      }}>
                        {contributor.role}
                      </p>
                    )}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      color: 'var(--accent-color)',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      <Github size={14} />
                      View Profile
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%)',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '600px',
              height: '600px',
              background: 'var(--accent-gradient)',
              opacity: '0.05',
              borderRadius: '50%',
              filter: 'blur(80px)'
            }} />
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '24px',
              color: 'var(--text-primary)',
              position: 'relative',
              zIndex: 1
            }}>
              Ready to Transform Your Career?
            </h2>
            <p style={{
              fontSize: '1.15rem',
              marginBottom: '32px',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto 32px',
              position: 'relative',
              zIndex: 1
            }}>
              Join over 100,000 professionals leveraging AI-powered insights to accelerate their career growth.
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '16px 48px',
                fontSize: '1.1rem',
                fontWeight: '600',
                background: 'var(--accent-gradient)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)',
                position: 'relative',
                zIndex: 1
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 30px rgba(37, 99, 235, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 20px rgba(37, 99, 235, 0.3)';
              }}
            >
              Get Started Free →
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .value-card:hover,
        .stat-card:hover {
          transform: translateY(-4px);
        }
      `}</style>
    </>
  );
};

export default About;
