import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import { CheckCircle, AlertTriangle, Activity, Clock, TrendingUp, Zap, Shield } from 'lucide-react';

const Status = () => {
  const navigate = useNavigate();
  const [hoveredService, setHoveredService] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // System metrics
  const metrics = [
    {
      icon: TrendingUp,
      label: 'Uptime',
      value: '99.98%',
      subtext: 'Last 30 days',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: Zap,
      label: 'Avg Response',
      value: '234ms',
      subtext: 'All services',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: Shield,
      label: 'Incidents',
      value: '0',
      subtext: 'Last 7 days',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ];

  // Current status - would come from an API in production
  const systemStatus = {
    overall: 'operational', // operational, degraded, outage
    lastUpdated: new Date().toLocaleString()
  };

  const services = [
    {
      name: 'Resume Analysis',
      status: 'operational',
      uptime: '99.98%',
      responseTime: '145ms'
    },
    {
      name: 'Career Path Recommendations',
      status: 'operational',
      uptime: '99.95%',
      responseTime: '287ms'
    },
    {
      name: 'Job Trend Analytics',
      status: 'operational',
      uptime: '99.99%',
      responseTime: '98ms'
    },
    {
      name: 'AI Chatbot',
      status: 'operational',
      uptime: '99.97%',
      responseTime: '523ms'
    },
    {
      name: 'Job Offer Evaluator',
      status: 'operational',
      uptime: '99.96%',
      responseTime: '234ms'
    },
    {
      name: 'Authentication System',
      status: 'operational',
      uptime: '100.00%',
      responseTime: '67ms'
    }
  ];

  const incidents = [
    {
      date: 'Feb 10, 2026',
      title: 'Scheduled Maintenance',
      description: 'System upgrade completed successfully with no downtime.',
      status: 'resolved',
      duration: '30 minutes'
    },
    {
      date: 'Feb 5, 2026',
      title: 'API Response Time Degradation',
      description: 'Brief slowdown in career recommendations API. Resolved by deploying additional resources.',
      status: 'resolved',
      duration: '15 minutes'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircle size={20} color="#10b981" />;
      case 'degraded':
        return <AlertTriangle size={20} color="#f59e0b" />;
      case 'outage':
        return <Activity size={20} color="#ef4444" />;
      default:
        return <CheckCircle size={20} color="#10b981" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return '#10b981';
      case 'degraded':
        return '#f59e0b';
      case 'outage':
        return '#ef4444';
      default:
        return '#10b981';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'operational':
        return 'rgba(16, 185, 129, 0.1)';
      case 'degraded':
        return 'rgba(245, 158, 11, 0.1)';
      case 'outage':
        return 'rgba(239, 68, 68, 0.1)';
      default:
        return 'rgba(16, 185, 129, 0.1)';
    }
  };

  return (
    <>
      <Navbar />
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        paddingTop: '100px',
        paddingBottom: '80px'
      }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
          
          {/* Hero Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '24px'
            }}>
              System Status
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Real-time status and performance of AI Skillence services
            </p>
          </div>

          {/* Overall Status Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '20px',
            padding: '48px 40px',
            marginBottom: '48px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
          }}>
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              pointerEvents: 'none'
            }} />
            
            <div style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle size={36} style={{ color: '#fff' }} />
              </div>
              
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#fff',
                margin: 0,
                textShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                All Systems Operational
              </h2>
              
              <p style={{
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.9)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Clock size={16} />
                Last updated: {systemStatus.lastUpdated}
              </p>
            </div>
          </div>

          {/* Metrics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginBottom: '60px'
          }}>
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '16px',
                  padding: '28px 24px',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}>
                  {/* Gradient top border */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: metric.gradient,
                    borderRadius: '16px 16px 0 0'
                  }} />
                  
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: metric.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}>
                    <Icon size={24} style={{ color: '#fff' }} />
                  </div>
                  
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '4px'
                  }}>
                    {metric.value}
                  </div>
                  
                  <div style={{
                    fontSize: '1.05rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '4px'
                  }}>
                    {metric.label}
                  </div>
                  
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)'
                  }}>
                    {metric.subtext}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Services Status */}
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              Service Status
            </h2>
            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              marginBottom: '28px'
            }}>
              Real-time performance monitoring of all services
            </p>

            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: '16px',
                padding: '20px 24px',
                background: 'var(--bg-primary)',
                borderBottom: '2px solid var(--border-color)'
              }}>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Service
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textAlign: 'center'
                }}>
                  Uptime
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textAlign: 'center'
                }}>
                  Response
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textAlign: 'center'
                }}>
                  Status
                </div>
              </div>

              {/* Service Rows */}
              {services.map((service, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredService(index)}
                  onMouseLeave={() => setHoveredService(null)}
                  style={{
                    padding: '20px 24px',
                    borderBottom: index < services.length - 1 ? '1px solid var(--border-color)' : 'none',
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    gap: '16px',
                    alignItems: 'center',
                    background: hoveredService === index ? 'var(--bg-primary)' : 'transparent',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: getStatusBg(service.status),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getStatusIcon(service.status)}
                    </div>
                    <span style={{
                      fontSize: '1.05rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)'
                    }}>
                      {service.name}
                    </span>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#10b981'
                    }}>
                      {service.uptime}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: 'var(--text-primary)'
                    }}>
                      {service.responseTime}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      padding: '6px 16px',
                      background: getStatusBg(service.status),
                      color: getStatusColor(service.status),
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {service.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Incidents */}
          <div>
            <div style={{
              marginBottom: '28px'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                Recent Incidents
              </h2>
              <p style={{
                fontSize: '1.05rem',
                color: 'var(--text-secondary)'
              }}>
                Historical overview of system events and resolutions
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {incidents.map((incident, index) => (
                <div
                  key={index}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '28px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-color)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Left accent border */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    background: '#10b981'
                  }} />
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '8px'
                      }}>
                        {incident.title}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{
                          fontSize: '0.9rem',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <Clock size={14} />
                          {incident.date}
                        </span>
                        <span style={{
                          padding: '4px 12px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          borderRadius: '16px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {incident.status}
                        </span>
                        <span style={{
                          fontSize: '0.9rem',
                          color: 'var(--text-muted)'
                        }}>
                          Duration: {incident.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p style={{
                    fontSize: '1rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.7',
                    margin: 0
                  }}>
                    {incident.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Subscribe to Updates */}
          <div style={{
            marginTop: '60px',
            textAlign: 'center',
            padding: '60px 40px',
            background: 'linear-gradient(135deg, var(--accent-color) 0%, #1e3a8a 100%)',
            borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)'
          }}>
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              pointerEvents: 'none'
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '18px',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <Activity size={36} style={{ color: '#fff' }} />
              </div>
              
              <h3 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#fff',
                marginBottom: '12px',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}>
                Stay Updated
              </h3>
              <p style={{
                fontSize: '1.15rem',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '32px',
                maxWidth: '500px',
                margin: '0 auto 32px',
                lineHeight: '1.6'
              }}>
                Subscribe to receive real-time notifications about system status changes and scheduled maintenance
              </p>
              <button
                onClick={() => navigate('/contact')}
                style={{
                  padding: '16px 48px',
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  background: '#fff',
                  color: 'var(--accent-color)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1.02)';
                  e.target.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                }}
              >
                Subscribe to Updates
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Status;
