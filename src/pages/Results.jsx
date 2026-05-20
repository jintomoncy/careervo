import { useState, useEffect, useRef } from 'react';
import {
  DownloadCloud, Users, TrendingUp, MapPin, Building,
  CheckCircle2, Award, Briefcase, ChevronDown, ExternalLink, BrainCircuit,
  Share2, Link, Image, Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { model } from '../lib/gemini';
import { careerDatabase, getCollegesForCareers, getFallbackAnalysis } from '../lib/careerDatabase';
import './Results.css';

const Results = () => {
  const { t } = useLanguage();
  const { userProfile, updateProfile } = useUser();
  const [parentMode, setParentMode] = useState(false);
  
  const [showAllKerala, setShowAllKerala] = useState(false);
  const [showAllIndia, setShowAllIndia] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(''); // 'pdf' | 'png' | ''
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [aiData, setAiData] = useState(userProfile.aiResult || null);
  const [isGenerating, setIsGenerating] = useState(!userProfile.aiResult);

  const pdfRef = useRef(null);

  useEffect(() => {
    const generateAnalysis = async () => {
      if (aiData || !userProfile.conversationHistory || userProfile.conversationHistory.length === 0) {
        setIsGenerating(false);
        return;
      }
      
      try {
        const compactCareers = careerDatabase.map(c => ({
          id: c.id,
          title: c.title,
          category: c.category,
          personalityMatch: c.personalityMatch,
          streams: c.streams
        }));

        const prompt = `
        You are Careervo AI, an expert career counselor. Analyze the following student profile and question responses to select the top 3 recommended careers from our database.

        Student Name: ${userProfile.name || 'Student'}
        Student Stream: ${userProfile.stream || 'Unknown'}
        Selected Interests: ${userProfile.interests?.join(", ") || 'Unknown'}
        
        Question Answers:
        ${JSON.stringify(userProfile.conversationHistory)}

        Choose exactly 3 recommended careers from this matching catalog (match using the ID):
        ${JSON.stringify(compactCareers)}

        Provide the response strictly as a JSON object with this exact structure (no markdown codeblock wrappers, no backticks):
        {
          "traits": [
            { "name": "Creativity", "val": 85 },
            { "name": "Leadership", "val": 70 },
            { "name": "Analytical", "val": 90 },
            { "name": "Communication", "val": 80 }
          ],
          "workStyle": "A short summary of their work style based on answers",
          "ambition": "A summary of their ambition and drive",
          "roadmap": [
            { "period": "Phase 1: Foundation", "description": "Specific action steps" },
            { "period": "Phase 2: Execution", "description": "Specific action steps" },
            { "period": "Phase 3: Launch", "description": "Specific action steps" }
          ],
          "careers": [
            {
              "id": "matched-id-from-catalog",
              "match": 95,
              "why": "Detailed personalized reason why this career matches their responses",
              "parentWhy": "Reason focusing on safety, parent perspective, stability, and growth"
            }
          ]
        }
        `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        
        // Clean up markdown block if present
        responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        const parsedData = JSON.parse(responseText);
        
        // Validate keys exist
        if (!parsedData.careers || parsedData.careers.length === 0) {
          throw new Error("Invalid output format: Missing careers");
        }
        
        setAiData(parsedData);
        updateProfile({ aiResult: parsedData });
      } catch (error) {
        console.error("Failed to generate results, using local database fallback...", error);
        try {
          const fallbackData = getFallbackAnalysis(userProfile);
          setAiData(fallbackData);
          updateProfile({ aiResult: fallbackData });
        } catch (fallbackError) {
          console.error("Critical: Fallback also failed", fallbackError);
        }
      } finally {
        setIsGenerating(false);
      }
    };

    generateAnalysis();
  }, [aiData, userProfile, updateProfile]);

  const exportPDF = async () => {
    setIsExporting(true);
    setExportType('pdf');
    try {
      const element = pdfRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Careervo_Report_${userProfile.name || 'Student'}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
    setIsExporting(false);
    setExportType('');
  };

  const exportPNG = async () => {
    setIsExporting(true);
    setExportType('png');
    try {
      const element = pdfRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Careervo_Report_${userProfile.name || 'Student'}.png`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error("PNG generation failed:", err);
    }
    setIsExporting(false);
    setExportType('');
  };

  const handleShare = (platform) => {
    const shareUrl = window.location.origin;
    const shareText = `Hey! I just completed my personalized career analysis on Careervo and found my top matches! Check it out:`;
    
    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl + '/results');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      default:
        break;
    }
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isGenerating) {
    return (
      <div className="results-dashboard container flex-center flex-column" style={{ minHeight: '60vh' }}>
        <div className="ai-spinner mb-4">
          <BrainCircuit size={64} className="text-accent pulse-anim" />
        </div>
        <h2>Generating Your Personalized Career Analysis...</h2>
        <p className="text-secondary mt-2">Careervo AI is processing your profile and conversation.</p>
      </div>
    );
  }

  if (!aiData) {
    return (
      <div className="results-dashboard container flex-center flex-column" style={{ minHeight: '60vh' }}>
        <h2>Analysis Failed</h2>
        <p className="text-secondary mt-2">Could not generate the career report. Please check your connection and try again.</p>
      </div>
    );
  }

  // Enrich matched careers with full database info
  const enrichedCareers = aiData.careers?.map(rc => {
    const dbCareer = careerDatabase.find(c => c.id === rc.id) || {};
    return {
      ...dbCareer,
      ...rc
    };
  }) || [];

  // Query matched colleges based on top recommended career IDs
  const recommendedCareerIds = enrichedCareers.map(c => c.id);
  const matchedColleges = getCollegesForCareers(recommendedCareerIds);

  return (
    <div className="results-dashboard container">
      <div className="dashboard-header flex-between animate-fade-in">
        <div>
          <h1>{t('results.title') || "Your Career Report"}</h1>
          <p>{t('results.subtitle', { name: userProfile.name || 'Student' }) || `Personalized matches for ${userProfile.name}`}</p>
        </div>
        <div className="header-actions flex-wrap gap-2 animate-fade-in">
          <button
            className={`btn-secondary ${parentMode ? 'parent-mode-active' : ''}`}
            onClick={() => setParentMode(!parentMode)}
          >
            <Users size={18} />
            {parentMode ? (t('results.exitParents') || "Exit Parent Mode") : (t('results.explainParents') || "Explain for Parents")}
          </button>
          
          <button className="btn-secondary" onClick={exportPNG} disabled={isExporting}>
            <Image size={18} />
            {isExporting && exportType === 'png' ? 'Exporting...' : 'Export PNG'}
          </button>
          
          <button className="btn-primary" onClick={exportPDF} disabled={isExporting}>
            <DownloadCloud size={18} />
            {isExporting && exportType === 'pdf' ? 'Exporting...' : (t('results.exportPdf') || "Export PDF")}
          </button>

          <div className="share-menu-container">
            <button className="btn-secondary share-btn" onClick={() => setShowShareMenu(!showShareMenu)}>
              <Share2 size={18} />
              Share
            </button>
            {showShareMenu && (
              <div className="share-dropdown glass-panel">
                <button onClick={() => handleShare('whatsapp')}>WhatsApp</button>
                <button onClick={() => handleShare('linkedin')}>LinkedIn</button>
                <button onClick={() => handleShare('twitter')}>Twitter / X</button>
                <button onClick={() => handleShare('facebook')}>Facebook</button>
                <button onClick={() => handleShare('copy')} className="flex-between">
                  {copied ? 'Copied!' : 'Copy Link'}
                  {copied ? <Check size={14} className="text-success" /> : <Link size={14} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid" ref={pdfRef} style={{ background: 'var(--bg-primary)', padding: isExporting ? '20px' : '0' }}>
        {/* Left Column */}
        <div className="grid-left">
          <div className="glass-panel profile-card animate-fade-in delay-100">
            <h3>{t('results.personality') || "Personality Insights"}</h3>
            <div className="traits-list">
              {aiData.traits?.map(t => (
                <div key={t.name} className="trait-item">
                  <div className="trait-header">
                    <span>{t.name}</span>
                    <span>{t.val}%</span>
                  </div>
                  <div className="progress-bar"><div className="fill" style={{ width: `${t.val}%` }}></div></div>
                </div>
              ))}
            </div>
            <div className="profile-summary mt-4">
              <p className="mb-2"><strong>{t('results.workStyle') || "Work Style"}:</strong> {aiData.workStyle}</p>
              <p><strong>{t('results.ambition') || "Ambition"}:</strong> {aiData.ambition}</p>
            </div>
          </div>

          <div className="glass-panel roadmap-card animate-fade-in delay-300">
            <h3>{t('results.roadmap') || "Actionable Career Roadmap"}</h3>
            <div className="timeline">
              {aiData.roadmap?.map((step, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-icon">
                    {idx === 0 ? <CheckCircle2 size={16} /> : idx === 1 ? <Award size={16} /> : <Briefcase size={16} />}
                  </div>
                  <div className="timeline-content">
                    <h4>{step.period}</h4>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="grid-right">
          <h2 className="section-title">{t('results.topMatches') || "Top Recommended Career Paths"}</h2>
          <div className="careers-list animate-fade-in delay-200">
            {enrichedCareers.map(career => (
              <div key={career.title || career.id} className="career-match-card glass-panel animate-fade-in">
                <div className="career-header flex-between">
                  <div className="career-title-group">
                    <TrendingUp className="text-accent" />
                    <h3>{career.title}</h3>
                  </div>
                  <div className="match-badge">{t('results.matchBadge', { score: career.match || 90 }) || `${career.match || 90}% Match`}</div>
                </div>

                <p className="career-why">
                  {parentMode ? career.parentWhy : career.why}
                </p>

                <div className="career-stats-grid">
                  <div className="stat-box">
                    <span className="stat-label">{t('results.salary') || "Salary Range"}</span>
                    <span className="stat-val">{career.salary}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Future Scope</span>
                    <span className="stat-val text-success">{career.futureScope}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">{t('results.aiRisk') || "AI Replacement Risk"}</span>
                    <span className="stat-val text-accent">{career.aiRisk}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Global Demand</span>
                    <span className="stat-val">{career.globalDemand}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Work-Life Balance</span>
                    <span className="stat-val">{career.workLifeBalance}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Startup Potential</span>
                    <span className="stat-val text-success">{career.startupPotential}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Colleges Sections */}
          <h2 className="section-title mt-8">Recommended Kerala Colleges</h2>
          <div className="colleges-grid animate-fade-in delay-300">
            {(showAllKerala ? matchedColleges.kerala : matchedColleges.kerala.slice(0, 3))?.map((college, idx) => (
              <div key={idx} className="college-card glass-panel">
                <div className="college-info">
                  <h4>{college.name}</h4>
                  <div className="college-meta">
                    <span><MapPin size={14} /> {college.location}</span>
                    <span><Building size={14} /> {college.category} | {t('results.fees') || "Fees"}: {college.fees}</span>
                  </div>
                </div>
                <div className="college-stats">
                  <div className="stat"><span>Average Package</span><strong>{college.avgPackage}</strong></div>
                  <div className="stat"><span>Highest Package</span><strong>{college.highestPackage}</strong></div>
                </div>
                <a href={college.website} target="_blank" rel="noreferrer" className="btn-secondary w-full mt-4 flex-center" style={{ padding: '8px', fontSize: '0.85rem' }}>
                  Visit Website <ExternalLink size={14} style={{ marginLeft: '6px' }} />
                </a>
              </div>
            ))}
          </div>
          {matchedColleges.kerala.length > 3 && (
            <div className="text-center mt-4 mb-4">
              <button className="see-more-btn" onClick={() => setShowAllKerala(!showAllKerala)}>
                {showAllKerala ? 'See Less' : 'See More Kerala Colleges'} <ChevronDown size={16} style={{ transform: showAllKerala ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
              </button>
            </div>
          )}

          <h2 className="section-title mt-8">Recommended National Colleges (India)</h2>
          <div className="colleges-grid animate-fade-in delay-300">
            {(showAllIndia ? matchedColleges.india : matchedColleges.india.slice(0, 3))?.map((college, idx) => (
              <div key={idx} className="college-card glass-panel">
                <div className="college-info">
                  <h4>{college.name}</h4>
                  <div className="college-meta">
                    <span><MapPin size={14} /> {college.location}</span>
                    <span><Building size={14} /> {college.category} | {t('results.fees') || "Fees"}: {college.fees}</span>
                  </div>
                </div>
                <div className="college-stats">
                  <div className="stat"><span>Average Package</span><strong>{college.avgPackage}</strong></div>
                  <div className="stat"><span>Highest Package</span><strong>{college.highestPackage}</strong></div>
                </div>
                <a href={college.website} target="_blank" rel="noreferrer" className="btn-secondary w-full mt-4 flex-center" style={{ padding: '8px', fontSize: '0.85rem' }}>
                  Visit Website <ExternalLink size={14} style={{ marginLeft: '6px' }} />
                </a>
              </div>
            ))}
          </div>
          {matchedColleges.india.length > 3 && (
            <div className="text-center mt-4 mb-8">
              <button className="see-more-btn" onClick={() => setShowAllIndia(!showAllIndia)}>
                {showAllIndia ? 'See Less' : 'See More India Colleges'} <ChevronDown size={16} style={{ transform: showAllIndia ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
