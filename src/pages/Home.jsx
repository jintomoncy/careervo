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
              <p className="stat-label">{t('home.studentsGuided')}</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">500+</h3>
              <p className="stat-label">{t('home.careerPaths')}</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">200+</h3>
              <p className="stat-label">{t('home.collegesAnalyzed')}</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">98%</h3>
              <p className="stat-label">{t('home.personalizedAiReports')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="how-it-works section-padding">
        <div className="container">
          <div className="section-header text-center">
            <h2>{t('home.howItWorksTitle')}</h2>
            <p>{t('home.howItWorksSub')}</p>
          </div>
          
          <div className="steps-grid">
            <div className="step-card glass-panel">
              <div className="step-number">1</div>
              <Compass className="step-icon" size={40} />
              <h3>{t('home.step1Title')}</h3>
              <p>{t('home.step1Desc')}</p>
            </div>
            <div className="step-card glass-panel">
              <div className="step-number">2</div>
              <BrainCircuit className="step-icon" size={40} />
              <h3>{t('home.step2Title')}</h3>
              <p>{t('home.step2Desc')}</p>
            </div>
            <div className="step-card glass-panel">
              <div className="step-number">3</div>
              <Target className="step-icon" size={40} />
              <h3>{t('home.step3Title')}</h3>
              <p>{t('home.step3Desc')}</p>
            </div>
            <div className="step-card glass-panel">
              <div className="step-number">4</div>
              <Lightbulb className="step-icon" size={40} />
              <h3>{t('home.step4Title')}</h3>
              <p>{t('home.step4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Careers */}
      <section id="trending" className="trending section-padding bg-tertiary">
        <div className="container">
          <div className="section-header">
            <h2>{t('home.trendingTitle')}</h2>
            <p>{t('home.trendingSub')}</p>
          </div>
          
          <div className="careers-grid">
            {[
              { label: 'AI & Data Science', key: 'ai_data_scientist' },
              { label: 'Digital Marketing', key: 'digital_marketer' },
              { label: 'UI/UX Design', key: 'uiux_designer' },
              { label: 'Business Analytics', key: 'business_analyst' },
              { label: 'Cybersecurity', key: 'cybersecurity_analyst' },
              { label: 'Finance', key: 'financial_analyst' },
              { label: 'Healthcare', key: 'healthcare_administrator' },
              { label: 'Entrepreneurship', key: 'entrepreneur' }
            ].map((career, i) => (
              <div key={i} className="career-pill glass-panel">
                <span>{t(`careers.${career.key}`) || career.label}</span>
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
            <h2>{t('home.whyTrustTitle')}</h2>
            <p>{t('home.whyTrustSub')}</p>
          </div>
          <div className="features-grid">
            <div className="feature-item"><CheckCircle2 className="text-accent" /> {t('home.feature1')}</div>
            <div className="feature-item"><CheckCircle2 className="text-accent" /> {t('home.feature2')}</div>
            <div className="feature-item"><CheckCircle2 className="text-accent" /> {t('home.feature3')}</div>
            <div className="feature-item"><CheckCircle2 className="text-accent" /> {t('home.feature4')}</div>
            <div className="feature-item"><CheckCircle2 className="text-accent" /> {t('home.feature5')}</div>
            <div className="feature-item"><CheckCircle2 className="text-accent" /> {t('home.feature6')}</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
