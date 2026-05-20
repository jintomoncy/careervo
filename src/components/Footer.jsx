import { Link } from 'react-router-dom';
import { Sparkles, Globe, MessageCircle, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './Footer.css';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <Sparkles className="logo-icon" size={24} />
            <span>Careervo</span>
          </Link>
          <p className="footer-tagline">{t('footer.tagline')}</p>
          <p className="footer-desc">
            {t('footer.desc')}
          </p>
          <div className="social-links">
            <a href="#" className="social-icon"><Globe size={20} /></a>
            <a href="#" className="social-icon"><MessageCircle size={20} /></a>
            <a href="#" className="social-icon"><Mail size={20} /></a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4>{t('footer.platform')}</h4>
          <Link to="/#how-it-works">{t('footer.howItWorks')}</Link>
          <Link to="/#trending">{t('footer.trending')}</Link>
          <Link to="/#colleges">{t('footer.colleges')}</Link>
          <Link to="/login">{t('footer.start')}</Link>
        </div>

        <div className="footer-links-group">
          <h4>{t('footer.company')}</h4>
          <Link to="/about">{t('footer.about')}</Link>
          <Link to="/careers">{t('footer.careers')}</Link>
          <Link to="/contact">{t('footer.contact')}</Link>
        </div>

        <div className="footer-links-group">
          <h4>{t('footer.legal')}</h4>
          <Link to="/privacy">{t('footer.privacy')}</Link>
          <Link to="/terms">{t('footer.terms')}</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Careervo. {t('footer.copyright')}</p>
      </div>
    </footer>
  );
};

export default Footer;
