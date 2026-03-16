import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import { Search, Book, MessageSquare, FileText, HelpCircle, ChevronDown, ChevronUp, X, CheckCircle2 } from 'lucide-react';

const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      question: 'How do I get started with AI Skillence?',
      answer: 'Getting started is simple! Create your free account, complete your profile with relevant information, and start exploring. Upload your resume for instant analysis, check out career path recommendations, or ask our AI chatbot for personalized career guidance.'
    },
    {
      question: 'What features are included in the free plan?',
      answer: 'Our free plan includes resume analysis and scoring, basic career path recommendations, job trend insights and market data, AI chatbot for career guidance, and profile creation with skill tracking. Premium features offer advanced analytics and unlimited access to all tools.'
    },
    {
      question: 'How accurate are the AI career recommendations?',
      answer: 'Our AI models are trained on millions of career data points from verified sources and use advanced machine learning algorithms. We maintain 99.9% accuracy in our predictions, continuously updating our models with real-time market data to provide highly personalized recommendations tailored to your unique profile and goals.'
    },
    {
      question: 'Can I export my career analysis reports?',
      answer: 'Yes! Premium users can export comprehensive analysis reports, career roadmaps, skill assessments, and salary insights in PDF, CSV, or JSON formats directly from their dashboard. Free users have access to basic summary exports.'
    },
    {
      question: 'How often is the job market data updated?',
      answer: 'Our job market trends, salary data, and skills demand information are updated daily using real-time data from major job boards, company postings, and verified industry sources. This ensures you always have access to the most current and accurate market intelligence.'
    },
    {
      question: 'Is my personal data secure and private?',
      answer: 'Absolutely. We employ enterprise-grade encryption (AES-256) and security measures to protect all your data. We\'re SOC 2 Type II certified and fully GDPR compliant. Your personal information is never shared with third parties without explicit consent, and you maintain full control over your data.'
    },
    {
      question: 'How do I upgrade to a premium plan?',
      answer: 'Navigate to your account settings and select "Upgrade Plan." Choose the subscription tier that fits your needs, enter your payment details, and your upgrade will be activated immediately with full access to premium features.'
    },
    {
      question: 'What types of career paths can AI Skillence help with?',
      answer: 'AI Skillence supports all career fields including technology, healthcare, finance, marketing, engineering, creative industries, and more. Our AI adapts recommendations based on your specific industry, experience level, and career aspirations.'
    }
  ];

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim()) {
      const results = faqs.filter(faq => 
        faq.question.toLowerCase().includes(value.toLowerCase()) ||
        faq.answer.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const helpCategories = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Learn the basics and set up your account',
      articles: 8,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: FileText,
      title: 'Resume Analysis',
      description: 'Understanding your resume insights',
      articles: 12,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      icon: MessageSquare,
      title: 'Career Chatbot',
      description: 'Using the AI assistant effectively',
      articles: 6,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: HelpCircle,
      title: 'Account & Billing',
      description: 'Managing your subscription and settings',
      articles: 10,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ];

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
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '24px'
            }}>
              Help Center
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto 40px'
            }}>
              Find answers and get the most out of AI Skillence
            </p>

            {/* Search Bar */}
            <div style={{
              maxWidth: '600px',
              margin: '0 auto',
              position: 'relative'
            }}>
              <Search 
                size={20} 
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)',
                  zIndex: 2
                }}
              />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 48px 16px 50px',
                  fontSize: '1rem',
                  background: 'var(--bg-secondary)',
                  border: '2px solid var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent-color)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSearchResults([]);
                  }}
                  style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '5px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--bg-primary)';
                    e.target.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'none';
                    e.target.style.color = 'var(--text-muted)';
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div style={{
                maxWidth: '600px',
                margin: '20px auto 0',
                background: 'var(--bg-secondary)',
                border: '2px solid var(--accent-color)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <CheckCircle2 size={20} style={{ color: 'var(--accent-color)' }} />
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    margin: 0
                  }}>
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </h3>
                </div>
                {searchResults.map((result, index) => (
                  <div 
                    key={index}
                    onClick={() => setExpandedFaq(faqs.indexOf(result))}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'var(--bg-primary)',
                      marginBottom: searchResults.length - 1 === index ? 0 : '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: '1px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-color)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <p style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      margin: 0
                    }}>
                      {result.question}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {searchTerm && searchResults.length === 0 && (
              <div style={{
                maxWidth: '600px',
                margin: '20px auto 0',
                padding: '20px',
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}>
                No results found for "{searchTerm}"
              </div>
            )}
          </div>

          {/* Help Categories */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2rem',
            marginBottom: '80px'
          }}>
            {helpCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} style={{
                  background: 'var(--bg-secondary)',
                  padding: '32px 24px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                  e.currentTarget.style.borderColor = 'var(--accent-color)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
                className="help-category-card">
                  {/* Gradient Background */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: category.gradient
                  }} />
                  
                  {/* Icon with gradient background */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: category.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}>
                    <Icon size={28} style={{ color: '#fff' }} />
                  </div>
                  
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '8px'
                  }}>
                    {category.title}
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '16px',
                    lineHeight: '1.6'
                  }}>
                    {category.description}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      fontSize: '0.9rem',
                      color: 'var(--accent-color)',
                      fontWeight: '600'
                    }}>
                      {category.articles} articles
                    </span>
                    <span style={{
                      fontSize: '1.2rem',
                      color: 'var(--accent-color)',
                      fontWeight: '600'
                    }}>
                      →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div style={{
            maxWidth: '900px',
            margin: '0 auto'
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
                Frequently Asked Questions
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: 'var(--text-secondary)',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Find quick answers to common questions about AI Skillence
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {faqs.map((faq, index) => (
                <div key={index} style={{
                  background: 'var(--bg-secondary)',
                  border: expandedFaq === index ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  boxShadow: expandedFaq === index ? '0 4px 20px rgba(59, 130, 246, 0.15)' : 'none'
                }}>
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    style={{
                      width: '100%',
                      padding: '24px 28px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: expandedFaq === index ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (expandedFaq !== index) {
                        e.currentTarget.style.background = 'var(--bg-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (expandedFaq !== index) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: expandedFaq === index ? 'var(--accent-color)' : 'var(--bg-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.3s ease'
                      }}>
                        <span style={{
                          color: expandedFaq === index ? '#fff' : 'var(--accent-color)',
                          fontWeight: '700',
                          fontSize: '1rem'
                        }}>
                          {index + 1}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        lineHeight: '1.5'
                      }}>
                        {faq.question}
                      </span>
                    </div>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: expandedFaq === index ? 'var(--accent-color)' : 'var(--bg-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      flexShrink: 0,
                      marginLeft: '12px'
                    }}>
                      {expandedFaq === index ? 
                        <ChevronUp size={20} style={{ color: '#fff' }} /> : 
                        <ChevronDown size={20} style={{ color: 'var(--text-secondary)' }} />
                      }
                    </div>
                  </button>
                  {expandedFaq === index && (
                    <div style={{
                      padding: '0 28px 28px 72px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.8',
                      fontSize: '1rem',
                      animation: 'fadeInDown 0.3s ease'
                    }}>
                      <div style={{
                        borderLeft: '3px solid var(--accent-color)',
                        paddingLeft: '20px'
                      }}>
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support CTA */}
          <div style={{
            textAlign: 'center',
            marginTop: '80px',
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
              background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              pointerEvents: 'none'
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <MessageSquare size={40} style={{ color: '#fff' }} />
              </div>
              
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#fff',
                marginBottom: '16px',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}>
                Still need help?
              </h2>
              <p style={{
                fontSize: '1.15rem',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '32px',
                maxWidth: '500px',
                margin: '0 auto 32px'
              }}>
                Our support team is available 24/7 to assist you with any questions
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
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default HelpCenter;
