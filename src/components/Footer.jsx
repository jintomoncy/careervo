import { Link } from 'react-router-dom';
import { Sparkles, Globe, MessageCircle, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <Sparkles className="logo-icon" size={24} />
            <span>Careervo</span>
          </Link>
          <p className="footer-tagline">“Your Future. Clearly.”</p>
          <p className="footer-desc">
            AI Career Intelligence Platform for Students. Discover the best career path based on your personality, interests, and future goals.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon"><Globe size={20} /></a>
            <a href="#" className="social-icon"><MessageCircle size={20} /></a>
            <a href="#" className="social-icon"><Mail size={20} /></a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4>Platform</h4>
          <Link to="/#how-it-works">How it Works</Link>
          <Link to="/#trending">Trending Careers</Link>
          <Link to="/#colleges">College Recommendations</Link>
          <Link to="/login">Start Analysis</Link>
        </div>

        <div className="footer-links-group">
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/careers">Careers</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-links-group">
          <h4>Legal</h4>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Careervo. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
