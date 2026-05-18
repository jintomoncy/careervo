import { Link } from 'react-router-dom';
import { Sparkles, BrainCircuit, Target, Lightbulb, Compass, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './Home.css';

const Home = () => {
  const { t, setLang } = useLanguage();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="gradient-sphere sphere-1"></div>
          <div className="gradient-sphere sphere-2"></div>
        </div>
        
        <div className="container hero-container">
          <div className="hero-content">
            <div className="ai-badge animate-fade-in delay-100">
              <Sparkles size={16} className="text-accent" />
              <span>{t('home.heroBadge')}</span>
            </div>
            
            <h1 className="hero-title animate-fade-in delay-200">
              {t('home.heroTitle')} <br />
              <span className="text-gradient">{t('home.heroTitleSpan')}</span>
            </h1>
            
            <p className="hero-subtitle animate-fade-in delay-300">
              {t('home.heroSubtitle')}
            </p>
            
            <div className="hero-cta animate-fade-in delay-300">
              <Link to="/login" className="btn-primary btn-large">
                {t('home.startBtn')}
                <ArrowRight size={20} />
              </Link>
              <button className="btn-secondary btn-large" onClick={() => setLang(prev => prev === 'en' ? 'ml' : 'en')}>
                {t('home.malayalamBtn')}
              </button>
            </div>
          </div>
          
          <div className="hero-visual animate-fade-in delay-200">
            <div className="glass-panel dashboard-preview">
              <div className="preview-header">
                <div className="dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="title">{t('home.reportTitle')}</div>
              </div>
              <div className="preview-body">
                <div className="skeleton-line w-3/4"></div>
                <div className="skeleton-line w-full"></div>
                <div className="skeleton-line w-5/6"></div>
                
                <div className="match-card">
                  <div className="match-icon"><BrainCircuit /></div>
                  <div className="match-info">
                    <h4>{t('home.topMatch')}: Data Science</h4>
                    <div className="progress-bar"><div className="fill" style={{width: '94%'}}></div></div>
                  </div>
                  <div className="match-score">94%</div>
                </div>
                <div className="match-card">
                  <div className="match-icon"><Lightbulb /></div>
                  <div className="match-info">
                    <h4>UI/UX Design</h4>
                    <div className="progress-bar"><div className="fill" style={{width: '88%'}}></div></div>
                  </div>
                  <div className="match-score">88%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid glass-panel">
            <div className="stat-item">
              <h3 className="stat-number">10,000+</h3>
              <p className="stat-label">Students Guided</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">500+</h3>
              <p className="stat-label">Career Paths</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">200+</h3>
              <p className="stat-label">Colleges Analyzed</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">98%</h3>
              <p className="stat-label">Personalized AI Reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="how-it-works section-padding">
        <div className="container">
          <div className="section-header text-center">
            <h2>How Careervo Works</h2>
            <p>Your journey to a clear future in 4 simple steps.</p>
          </div>
          
          <div className="steps-grid">
            <div className="step-card glass-panel">
              <div className="step-number">1</div>
              <Compass className="step-icon" size={40} />
              <h3>Choose Your Interests</h3>
              <p>Select fields you are passionate about, from tech to arts.</p>
            </div>
            <div className="step-card glass-panel">
              <div className="step-number">2</div>
              <BrainCircuit className="step-icon" size={40} />
              <h3>Answer AI Questions</h3>
              <p>Dynamic, conversational questions tailored just for you.</p>
            </div>
            <div className="step-card glass-panel">
              <div className="step-number">3</div>
              <Target className="step-icon" size={40} />
              <h3>Get Intelligence Report</h3>
              <p>Receive a personalized career report with deep insights.</p>
            </div>
            <div className="step-card glass-panel">
              <div className="step-number">4</div>
              <Lightbulb className="step-icon" size={40} />
              <h3>Explore Opportunities</h3>
              <p>Discover top colleges, real salaries, and future demand.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Careers */}
      <section id="trending" className="trending section-padding bg-tertiary">
        <div className="container">
          <div className="section-header">
            <h2>Trending Future Careers</h2>
            <p>Discover high-growth careers that are shaping the next decade.</p>
          </div>
          
          <div className="careers-grid">
            {['AI & Data Science', 'Digital Marketing', 'UI/UX Design', 'Business Analytics', 'Cybersecurity', 'Finance', 'Healthcare', 'Entrepreneurship'].map((career, i) => (
              <div key={i} className="career-pill glass-panel">
                <span>{career}</span>
                <ArrowRight size={16} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Trust Us */}
      <section className="why-trust section-padding">
        <div className="container flex-center flex-column">
          <div className="section-header text-center">
            <h2>Why Students Trust Careervo</h2>
            <p>We combine human psychology with advanced AI intelligence.</p>
          </div>
          <div className="features-grid">
            <div className="feature-item"><CheckCircle2 className="text-accent" /> Personalized AI analysis</div>
            <div className="feature-item"><CheckCircle2 className="text-accent" /> Real-world career insights</div>
            <div className="feature-item"><CheckCircle2 className="text-accent" /> Industry trends</div>
            <div className="feature-item"><CheckCircle2 className="text-accent" /> Future demand analysis</div>
            <div className="feature-item"><CheckCircle2 className="text-accent" /> Parent-friendly explanations</div>
            <div className="feature-item"><CheckCircle2 className="text-accent" /> Career roadmap generation</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
