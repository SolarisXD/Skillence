import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import { Calendar, User, Clock, ArrowRight, BookOpen, TrendingUp, Brain, Briefcase, Target, Award, Code } from 'lucide-react';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = ['all', 'Career Tips', 'AI Insights', 'Industry Trends', 'Success Stories'];

  const blogPosts = [
    {
      id: 1,
      title: '10 AI-Powered Strategies to Accelerate Your Career Growth in 2026',
      excerpt: 'Discover how artificial intelligence is reshaping career development and learn actionable strategies to leverage AI tools for your professional advancement.',
      category: 'Career Tips',
      author: 'Sarah Johnson',
      date: 'Feb 12, 2026',
      readTime: '8 min read',
      icon: <TrendingUp size={32} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 2,
      title: 'The Future of Work: How Machine Learning is Transforming Hiring',
      excerpt: 'Explore the latest trends in AI-driven recruitment and understand what skills will be most valuable in the job market of tomorrow.',
      category: 'AI Insights',
      author: 'Michael Chen',
      date: 'Feb 10, 2026',
      readTime: '6 min read',
      icon: <Brain size={32} />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 3,
      title: 'From Resume to Offer: A Data Scientist\'s Journey with AI Skillence',
      excerpt: 'Read how Jane transformed her career using AI-powered insights and landed her dream role at a Fortune 500 company.',
      category: 'Success Stories',
      author: 'Jane Martinez',
      date: 'Feb 8, 2026',
      readTime: '10 min read',
      icon: <Award size={32} />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      id: 4,
      title: 'Tech Industry Salary Trends: What to Expect in 2026',
      excerpt: 'Comprehensive analysis of salary trends across different tech roles, locations, and experience levels based on real market data.',
      category: 'Industry Trends',
      author: 'Robert Williams',
      date: 'Feb 5, 2026',
      readTime: '12 min read',
      icon: <Briefcase size={32} />,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      id: 5,
      title: 'Mastering the Art of Career Transitions with AI Guidance',
      excerpt: 'Learn how to successfully navigate career changes using data-driven insights and personalized AI recommendations.',
      category: 'Career Tips',
      author: 'Emily Davis',
      date: 'Feb 3, 2026',
      readTime: '7 min read',
      icon: <Target size={32} />,
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    {
      id: 6,
      title: 'Understanding AI Ethics in Career Development',
      excerpt: 'A deep dive into the ethical considerations of using AI for career planning and how we ensure fairness and transparency.',
      category: 'AI Insights',
      author: 'David Thompson',
      date: 'Feb 1, 2026',
      readTime: '9 min read',
      icon: <Code size={32} />,
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    }
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPost = blogPosts[0];

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
              Blog & Insights
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: 'var(--text-secondary)',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              Expert insights on career development, AI technology, and industry trends
            </p>
          </div>

          {/* Featured Post */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '20px',
            overflow: 'hidden',
            marginBottom: '60px',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          className="featured-post"
          onClick={() => console.log('Navigate to post:', featuredPost.id)}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 0,
              alignItems: 'center'
            }}>
              <div style={{
                height: '400px',
                background: featuredPost.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  Featured Article
                </div>
                <div style={{
                  fontSize: '120px',
                  opacity: 0.9
                }}>
                  {featuredPost.icon}
                </div>
              </div>
              <div style={{
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  background: 'var(--accent-gradient)',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  marginBottom: '20px',
                  width: 'fit-content'
                }}>
                  {featuredPost.category}
                </div>
                <h2 style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                  lineHeight: '1.3'
                }}>
                  {featuredPost.title}
                </h2>
                <p style={{
                  fontSize: '1.05rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  marginBottom: '24px'
                }}>
                  {featuredPost.excerpt}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  flexWrap: 'wrap',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={16} />
                    {featuredPost.author}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} />
                    {featuredPost.date}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} />
                    {featuredPost.readTime}
                  </div>
                </div>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: 'var(--accent-gradient)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: 'fit-content',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateX(4px)';
                  e.target.style.boxShadow = '0 6px 25px rgba(37, 99, 235, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateX(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(37, 99, 235, 0.3)';
                }}>
                  Read Full Article
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '40px',
            overflowX: 'auto',
            paddingBottom: '8px',
            flexWrap: 'wrap'
          }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '10px 20px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  background: selectedCategory === category ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
                  color: selectedCategory === category ? 'white' : 'var(--text-primary)',
                  border: selectedCategory === category ? 'none' : '1px solid var(--border-color)',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  textTransform: 'capitalize'
                }}
                onMouseOver={(e) => {
                  if (selectedCategory !== category) {
                    e.target.style.background = 'var(--accent-color)';
                    e.target.style.color = 'white';
                    e.target.style.borderColor = 'var(--accent-color)';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedCategory !== category) {
                    e.target.style.background = 'var(--bg-secondary)';
                    e.target.style.color = 'var(--text-primary)';
                    e.target.style.borderColor = 'var(--border-color)';
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Blog Posts Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {filteredPosts.slice(1).map((post) => (
              <div
                key={post.id}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                className="blog-post-card"
                onClick={() => console.log('Navigate to post:', post.id)}
              >
                <div style={{
                  height: '220px',
                  background: post.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  position: 'relative'
                }}>
                  <div style={{ fontSize: '64px', opacity: 0.9 }}>
                    {post.icon}
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: 'var(--accent-color)',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    marginBottom: '12px'
                  }}>
                    {post.category}
                  </div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '12px',
                    lineHeight: '1.4'
                  }}>
                    {post.title}
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                    marginBottom: '16px'
                  }}>
                    {post.excerpt}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} />
                      {post.author}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} />
                      {post.readTime}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Newsletter Subscription */}
          <div style={{
            marginTop: '80px',
            textAlign: 'center',
            padding: '60px 40px',
            background: 'var(--accent-gradient)',
            borderRadius: '24px',
            color: 'white'
          }}>
            <BookOpen size={48} style={{ marginBottom: '20px' }} />
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '16px'
            }}>
              Subscribe to Our Newsletter
            </h2>
            <p style={{
              fontSize: '1.15rem',
              marginBottom: '32px',
              opacity: 0.9,
              maxWidth: '600px',
              margin: '0 auto 32px'
            }}>
              Get the latest career insights, AI trends, and success stories delivered to your inbox
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              maxWidth: '500px',
              margin: '0 auto',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  flex: 1,
                  minWidth: '250px',
                  padding: '14px 20px',
                  fontSize: '1rem',
                  border: 'none',
                  borderRadius: '10px',
                  outline: 'none'
                }}
              />
              <button style={{
                padding: '14px 32px',
                fontSize: '1rem',
                fontWeight: '600',
                background: 'white',
                color: 'var(--accent-color)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}>
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .featured-post:hover,
        .blog-post-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }
      `}</style>
    </>
  );
};

export default Blog;
