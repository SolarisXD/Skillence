import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import { Mail, MapPin, Phone, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
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
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          
          {/* Hero Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              background: 'rgba(37, 99, 235, 0.1)',
              borderRadius: '50px',
              marginBottom: '24px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'var(--accent-color)'
            }}>
              <Clock size={16} />
              We typically respond within 24 hours
            </div>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '24px'
            }}>
              Get in Touch
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Have questions or feedback? Our team is here to help you succeed.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            marginBottom: '60px'
          }}>
            
            {/* Contact Information */}
            <div>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '32px'
              }}>
                Contact Information
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {[
                  {
                    icon: <Mail size={24} />,
                    title: 'Email',
                    value: 'support@aiskillence.com',
                    link: 'mailto:support@aiskillence.com'
                  },
                  {
                    icon: <Phone size={24} />,
                    title: 'Phone',
                    value: '+91 98765 43210',
                    link: 'tel:+919876543210'
                  },
                  {
                    icon: <MapPin size={24} />,
                    title: 'Office',
                    value: 'India',
                    link: null
                  }
                ].map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    gap: '20px',
                    padding: '24px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{
                      color: 'var(--accent-color)',
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '4px'
                      }}>
                        {item.title}
                      </h3>
                      {item.link ? (
                        <a 
                          href={item.link}
                          style={{
                            fontSize: '1rem',
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            transition: 'color 0.3s ease'
                          }}
                          onMouseOver={(e) => e.target.style.color = 'var(--accent-color)'}
                          onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
                        >
                          {item.value}
                        </a>
                      ) : (
                        <span style={{
                          fontSize: '1rem',
                          color: 'var(--text-secondary)'
                        }}>
                          {item.value}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Business Hours */}
              <div style={{
                marginTop: '32px',
                padding: '24px',
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '16px'
                }}>
                  Business Hours (IST)
                </h3>
                <div style={{
                  fontSize: '1rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.8'
                }}>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '40px',
              borderRadius: '16px',
              border: '1px solid var(--border-color)'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '32px'
              }}>
                Send us a Message
              </h2>

              {isSubmitted && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 20px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '2px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  marginBottom: '24px'
                }}>
                  <CheckCircle size={20} color="#10b981" />
                  <span style={{ color: '#10b981', fontWeight: '600', fontSize: '0.95rem' }}>
                    Message sent successfully! We'll get back to you within 24 hours.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '10px'
                  }}>
                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      fontSize: '1rem',
                      background: 'var(--bg-primary)',
                      border: `2px solid ${errors.name ? '#ef4444' : 'var(--border-color)'}`,
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => !errors.name && (e.target.style.borderColor = 'var(--accent-color)')}
                    onBlur={(e) => !errors.name && (e.target.style.borderColor = 'var(--border-color)')}
                  />
                  {errors.name && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '8px',
                      color: '#ef4444',
                      fontSize: '0.85rem'
                    }}>
                      <AlertCircle size={14} />
                      {errors.name}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '10px'
                  }}>
                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      fontSize: '1rem',
                      background: 'var(--bg-primary)',
                      border: `2px solid ${errors.email ? '#ef4444' : 'var(--border-color)'}`,
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => !errors.email && (e.target.style.borderColor = 'var(--accent-color)')}
                    onBlur={(e) => !errors.email && (e.target.style.borderColor = 'var(--border-color)')}
                  />
                  {errors.email && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '8px',
                      color: '#ef4444',
                      fontSize: '0.85rem'
                    }}>
                      <AlertCircle size={14} />
                      {errors.email}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '10px'
                  }}>
                    Subject <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      fontSize: '1rem',
                      background: 'var(--bg-primary)',
                      border: `2px solid ${errors.subject ? '#ef4444' : 'var(--border-color)'}`,
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => !errors.subject && (e.target.style.borderColor = 'var(--accent-color)')}
                    onBlur={(e) => !errors.subject && (e.target.style.borderColor = 'var(--border-color)')}
                  />
                  {errors.subject && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '8px',
                      color: '#ef4444',
                      fontSize: '0.85rem'
                    }}>
                      <AlertCircle size={14} />
                      {errors.subject}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '10px'
                  }}>
                    Message <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      fontSize: '1rem',
                      background: 'var(--bg-primary)',
                      border: `2px solid ${errors.message ? '#ef4444' : 'var(--border-color)'}`,
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      minHeight: '120px'
                    }}
                    onFocus={(e) => !errors.message && (e.target.style.borderColor = 'var(--accent-color)')}
                    onBlur={(e) => !errors.message && (e.target.style.borderColor = 'var(--border-color)')}
                  />
                  {errors.message && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '8px',
                      color: '#ef4444',
                      fontSize: '0.85rem'
                    }}>
                      <AlertCircle size={14} />
                      {errors.message}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '16px 32px',
                    fontSize: '1.05rem',
                    fontWeight: '600',
                    background: isSubmitting ? 'var(--text-secondary)' : 'var(--accent-gradient)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: isSubmitting ? 0.7 : 1,
                    boxShadow: isSubmitting ? 'none' : '0 4px 20px rgba(37, 99, 235, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    if (!isSubmitting) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 30px rgba(37, 99, 235, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSubmitting) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 20px rgba(37, 99, 235, 0.3)';
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        border: '3px solid rgba(255,255,255,0.3)',
                        borderTop: '3px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default Contact;
