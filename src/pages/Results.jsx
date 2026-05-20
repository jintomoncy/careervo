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
import { careerDatabase, collegeDatabase, getCollegesForCareers, getFallbackAnalysis } from '../lib/careerDatabase';
import { collegesMl } from '../lib/careerDatabase/collegesMl';
import './Results.css';

const Results = () => {
  const { t, lang } = useLanguage();
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

  const getLocalizedCollege = (college) => {
    if (lang !== 'ml') return { name: college.name, location: college.location };
    
    // Find original index in kerala
    const kIdx = collegeDatabase.kerala.findIndex(c => c.name === college.name);
    if (kIdx !== -1) {
      const mlData = collegesMl[`kerala_${kIdx}`];
      return mlData ? { name: mlData.name, location: mlData.location } : { name: college.name, location: college.location };
    }
    
    // Find original index in india
    const iIdx = collegeDatabase.india.findIndex(c => c.name === college.name);
    if (iIdx !== -1) {
      const mlData = collegesMl[`india_${iIdx}`];
      return mlData ? { name: mlData.name, location: mlData.location } : { name: college.name, location: college.location };
    }
    
    return { name: college.name, location: college.location };
  };

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

        const languageInstruction = lang === 'ml'
          ? `IMPORTANT: The user has selected Malayalam language. You MUST generate all explanatory and descriptive text values (specifically: "workStyle", "ambition", "roadmap[].description", "careers[].why", and "careers[].parentWhy") in fluent, warm, professional, natural Malayalam language. Do NOT use literal machine translations. Keep all JSON keys in English.`
          : `IMPORTANT: Write all explanation fields ("workStyle", "ambition", "roadmap[].description", "careers[].why", and "careers[].parentWhy") in English.`;

        const prompt = `
        You are Careervo AI, an expert career counselor. Analyze the following student profile and question responses to select the top 3 recommended careers from our database.

        Student Name: ${userProfile.name || 'Student'}
        Student Stream: ${userProfile.stream || 'Unknown'}
        Selected Interests: ${userProfile.interests?.join(", ") || 'Unknown'}
        
        Question Answers:
        ${JSON.stringify(userProfile.conversationHistory)}

        Choose exactly 3 recommended careers from this matching catalog (match using the ID):
        ${JSON.stringify(compactCareers)}

        ${languageInstruction}

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
          const fallbackData = getFallbackAnalysis(userProfile, lang);
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
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 1; i <= 3; i++) {
        const element = document.getElementById(`pdf-page-${i}`);
        if (!element) continue;

        const canvas = await html2canvas(element, { 
          scale: 2.5, 
          useCORS: true,
          logging: false,
          width: 800,
          height: 1130
        });
        const imgData = canvas.toDataURL('image/png');
        
        if (i > 1) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`Careervo_AI_Report_${userProfile.name || 'Student'}.pdf`);
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
      const element = document.getElementById('pdf-page-1');
      if (element) {
        const canvas = await html2canvas(element, { 
          scale: 2.5, 
          useCORS: true,
          logging: false,
          width: 800,
          height: 1130
        });
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Careervo_Report_Overview_${userProfile.name || 'Student'}.png`;
        link.href = imgData;
        link.click();
      }
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
            {isExporting && exportType === 'png' ? 'Exporting...' : (t('results.exportPng') || 'Export PNG')}
          </button>
          
          <button className="btn-primary" onClick={exportPDF} disabled={isExporting}>
            <DownloadCloud size={18} />
            {isExporting && exportType === 'pdf' ? 'Exporting...' : (t('results.exportPdf') || "Export PDF")}
          </button>

          <div className="share-menu-container">
            <button className="btn-secondary share-btn" onClick={() => setShowShareMenu(!showShareMenu)}>
              <Share2 size={18} />
              {t('results.share') || "Share"}
            </button>
            {showShareMenu && (
              <div className="share-dropdown glass-panel">
                <button onClick={() => handleShare('whatsapp')}>{lang === 'ml' ? 'വാട്സാപ്പ്' : 'WhatsApp'}</button>
                <button onClick={() => handleShare('linkedin')}>{lang === 'ml' ? 'ലിങ്ക്ഡ്ഇൻ' : 'LinkedIn'}</button>
                <button onClick={() => handleShare('twitter')}>{lang === 'ml' ? 'ട്വിറ്റർ / X' : 'Twitter / X'}</button>
                <button onClick={() => handleShare('facebook')}>{lang === 'ml' ? 'ഫേസ്ബുക്ക്' : 'Facebook'}</button>
                <button onClick={() => handleShare('copy')} className="flex-between">
                  {copied ? (lang === 'ml' ? 'കോപ്പി ചെയ്തു!' : 'Copied!') : (lang === 'ml' ? 'ലിങ്ക് കോപ്പി ചെയ്യുക' : 'Copy Link')}
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
            <h3>{t('results.personality') || "Personality Profile"}</h3>
            <div className="traits-list">
              {aiData.traits?.map(tTrait => (
                <div key={tTrait.name} className="trait-item">
                  <div className="trait-header">
                    <span>{t(`results.traits.${tTrait.name.toLowerCase()}`) || tTrait.name}</span>
                    <span>{tTrait.val}%</span>
                  </div>
                  <div className="progress-bar"><div className="fill" style={{ width: `${tTrait.val}%` }}></div></div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel behavior-card animate-fade-in delay-150 mt-6">
            <div className="behavior-section">
              <h4>{t('results.workStyle') || "Work Style"}</h4>
              <p className="text-secondary">{aiData.workStyle}</p>
            </div>
            <div className="behavior-section mt-6">
              <h4>{t('results.ambition') || "Ambition Type"}</h4>
              <p className="text-secondary">{aiData.ambition}</p>
            </div>
          </div>

          <div className="glass-panel roadmap-card animate-fade-in delay-200 mt-6">
            <h3>{t('results.roadmap') || "Your Action Roadmap"}</h3>
            <div className="roadmap-timeline">
              {aiData.roadmap?.map((step, idx) => (
                <div key={idx} className="roadmap-step">
                  <div className="step-num">{idx + 1}</div>
                  <div className="step-content">
                    <h4>{step.period}</h4>
                    <p className="text-secondary">{step.description}</p>
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
                    <h3>{lang === 'ml' ? (t(`careers.${career.id}`) || career.title) : career.title}</h3>
                  </div>
                  <div className="match-badge">{t('results.matchBadge', { score: career.match || 90 })}</div>
                </div>

                <p className="career-why">
                  {parentMode ? career.parentWhy : career.why}
                </p>

                <div className="career-stats-grid">
                  <div className="stat-box">
                    <span className="stat-label">{t('results.salary') || "Salary Range"}</span>
                    <span className="stat-val">{career.salary ? career.salary.replace(' / year', ' ' + t('terms.perYear')).replace('total', t('terms.total')) : ''}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">{t('results.futureScope') || "Future Scope"}</span>
                    <span className="stat-val text-success">{t(`terms.${career.futureScope}`) || career.futureScope}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">{t('results.aiRisk') || "AI Replacement Risk"}</span>
                    <span className="stat-val text-accent">{t(`terms.${career.aiRisk}`) || career.aiRisk}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">{t('results.globalDemand') || "Global Demand"}</span>
                    <span className="stat-val">{t(`terms.${career.globalDemand}`) || career.globalDemand}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">{t('results.workLifeBalance') || "Work-Life Balance"}</span>
                    <span className="stat-val">{t(`terms.${career.workLifeBalance}`) || career.workLifeBalance}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">{t('results.startupPotential') || "Startup Potential"}</span>
                    <span className="stat-val text-success">{t(`terms.${career.startupPotential}`) || career.startupPotential}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Colleges Sections */}
          <h2 className="section-title mt-8">{t('results.collegesKerala') || "Recommended Kerala Colleges"}</h2>
          <div className="colleges-grid animate-fade-in delay-300">
            {(showAllKerala ? matchedColleges.kerala : matchedColleges.kerala.slice(0, 3))?.map((college, idx) => {
              const localizedCol = getLocalizedCollege(college);
              return (
                <div key={idx} className="college-card glass-panel">
                  <div className="college-info">
                    <h4>{localizedCol.name}</h4>
                    <div className="college-meta">
                      <span><MapPin size={14} /> {localizedCol.location}</span>
                      <span><Building size={14} /> {(college.category === "Government" ? (lang === 'ml' ? 'ഗവൺമെന്റ്' : 'Government') : (lang === 'ml' ? 'പ്രൈവറ്റ്' : 'Private'))} | {t('results.fees') || "Fees"}: {college.fees ? college.fees.replace(' / year', ' ' + t('terms.perYear')).replace('total', t('terms.total')) : ''}</span>
                    </div>
                  </div>
                  <div className="college-stats">
                    <div className="stat"><span>{lang === 'ml' ? 'ശരാശരി പാക്കേജ്' : 'Average Package'}</span><strong>{college.avgPackage}</strong></div>
                    <div className="stat"><span>{lang === 'ml' ? 'ഉയർന്ന പാക്കേജ്' : 'Highest Package'}</span><strong>{college.highestPackage}</strong></div>
                  </div>
                  <a href={college.website} target="_blank" rel="noreferrer" className="btn-secondary w-full mt-4 flex-center" style={{ padding: '8px', fontSize: '0.85rem' }}>
                    {lang === 'ml' ? 'വെബ്സൈറ്റ് സന്ദർശിക്കുക' : 'Visit Website'} <ExternalLink size={14} style={{ marginLeft: '6px' }} />
                  </a>
                </div>
              );
            })}
          </div>
          {matchedColleges.kerala.length > 3 && (
            <div className="text-center mt-4 mb-4">
              <button className="see-more-btn" onClick={() => setShowAllKerala(!showAllKerala)}>
                {showAllKerala ? (lang === 'ml' ? 'കുറച്ചു കാണിക്കുക' : 'See Less') : (lang === 'ml' ? 'കൂടുതൽ കേരളത്തിലെ കോളേജുകൾ കാണുക' : 'See More Kerala Colleges')} <ChevronDown size={16} style={{ transform: showAllKerala ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
              </button>
            </div>
          )}

          <h2 className="section-title mt-8">{t('results.collegesIndia') || "Recommended National Colleges (India)"}</h2>
          <div className="colleges-grid animate-fade-in delay-300">
            {(showAllIndia ? matchedColleges.india : matchedColleges.india.slice(0, 3))?.map((college, idx) => {
              const localizedCol = getLocalizedCollege(college);
              return (
                <div key={idx} className="college-card glass-panel">
                  <div className="college-info">
                    <h4>{localizedCol.name}</h4>
                    <div className="college-meta">
                      <span><MapPin size={14} /> {localizedCol.location}</span>
                      <span><Building size={14} /> {(college.category === "Government" ? (lang === 'ml' ? 'ഗവൺമെന്റ്' : 'Government') : (lang === 'ml' ? 'പ്രൈവറ്റ്' : 'Private'))} | {t('results.fees') || "Fees"}: {college.fees ? college.fees.replace(' / year', ' ' + t('terms.perYear')).replace('total', t('terms.total')) : ''}</span>
                    </div>
                  </div>
                  <div className="college-stats">
                    <div className="stat"><span>{lang === 'ml' ? 'ശരാശരി പാക്കേജ്' : 'Average Package'}</span><strong>{college.avgPackage}</strong></div>
                    <div className="stat"><span>{lang === 'ml' ? 'ഉയർന്ന പാക്കേജ്' : 'Highest Package'}</span><strong>{college.highestPackage}</strong></div>
                  </div>
                  <a href={college.website} target="_blank" rel="noreferrer" className="btn-secondary w-full mt-4 flex-center" style={{ padding: '8px', fontSize: '0.85rem' }}>
                    {lang === 'ml' ? 'വെബ്സൈറ്റ് സന്ദർശിക്കുക' : 'Visit Website'} <ExternalLink size={14} style={{ marginLeft: '6px' }} />
                  </a>
                </div>
              );
            })}
          </div>
          {matchedColleges.india.length > 3 && (
            <div className="text-center mt-4 mb-8">
              <button className="see-more-btn" onClick={() => setShowAllIndia(!showAllIndia)}>
                {showAllIndia ? (lang === 'ml' ? 'കുറച്ചു കാണിക്കുക' : 'See Less') : (lang === 'ml' ? 'കൂടുതൽ ഇന്ത്യയിലെ കോളേജുകൾ കാണുക' : 'See More India Colleges')} <ChevronDown size={16} style={{ transform: showAllIndia ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
              </button>
            </div>
          )}
      </div>
    </div>
      
      {/* Hidden high-fidelity A4 layout for PDF/PNG exports */}
      <div style={{ position: 'absolute', left: '-9999px', top: '0', width: '800px', pointerEvents: 'none' }}>
        <div id="pdf-report-root">
          {/* Page 1 */}
          <div className="pdf-page" id="pdf-page-1">
            <div className="pdf-header">
              <div className="pdf-logo">
                <BrainCircuit size={24} className="text-accent" />
                <span>{t('pdf.brandName') || "Careervo AI Guidance"}</span>
              </div>
              <div className="pdf-date">{new Date().toLocaleDateString('en-IN')}</div>
            </div>
            
            <div className="pdf-body">
              <div className="pdf-hero">
                <h1 className="pdf-main-title">{t('pdf.reportTitle') || "CAREER PATHWAY ANALYSIS"}</h1>
                <p className="pdf-sub-title">{t('pdf.reportSub') || "Personalized Assessment Report for Students"}</p>
              </div>
              
              <div className="pdf-section pdf-meta-grid">
                <div className="pdf-meta-item">
                  <span className="pdf-meta-label">{t('pdf.studentName') || "STUDENT NAME"}</span>
                  <span className="pdf-meta-val">{userProfile.name || 'Student'}</span>
                </div>
                <div className="pdf-meta-item">
                  <span className="pdf-meta-label">{t('pdf.academicStream') || "ACADEMIC STREAM"}</span>
                  <span className="pdf-meta-val">{userProfile.stream === 'Science' ? (lang === 'ml' ? 'സയൻസ്' : 'Science') : userProfile.stream === 'Commerce' ? (lang === 'ml' ? 'കോമേഴ്‌സ്' : 'Commerce') : (lang === 'ml' ? 'ഹ്യുമാനിറ്റീസ്' : 'Humanities')}</span>
                </div>
                <div className="pdf-meta-item">
                  <span className="pdf-meta-label">{t('pdf.interestFocus') || "EVALUATION FOCUS"}</span>
                  <span className="pdf-meta-val">{userProfile.interests?.map(i => t('industries.' + i.toLowerCase().replace(/\s+/g, '_')) || i).join(", ") || 'General'}</span>
                </div>
              </div>

              <div className="pdf-section" style={{ marginTop: '24px' }}>
                <h2 className="pdf-section-title">{t('pdf.cognitiveProfile') || "Cognitive & Personality Profile"}</h2>
                <div className="pdf-traits-grid">
                  {aiData.traits?.map(tTrait => (
                    <div key={tTrait.name} className="pdf-trait-card">
                      <div className="pdf-trait-header">
                        <span className="pdf-trait-name">{t(`results.traits.${tTrait.name.toLowerCase()}`) || tTrait.name}</span>
                        <span className="pdf-trait-score">{tTrait.val}%</span>
                      </div>
                      <div className="pdf-trait-bar">
                        <div className="pdf-trait-bar-fill" style={{ width: `${tTrait.val}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pdf-section" style={{ marginTop: '24px' }}>
                <h2 className="pdf-section-title">{t('pdf.behavioralEvaluation') || "Behavioral Evaluation"}</h2>
                <div className="pdf-behavior-box">
                  <p><strong>{lang === 'ml' ? 'ജോലി രീതി' : 'Work Style'}: </strong>{aiData.workStyle}</p>
                  <p style={{ marginTop: '12px' }}><strong>{lang === 'ml' ? 'ലക്ഷ്യം & യോജിപ്പ്' : 'Ambition & Alignment'}: </strong>{aiData.ambition}</p>
                </div>
              </div>
            </div>
            
            <div className="pdf-footer">
              <span>© {new Date().getFullYear()} Careervo. All rights reserved.</span>
              <span>{t('pdf.pageOf', { curr: 1, total: 3 })}</span>
            </div>
          </div>

          {/* Page 2 */}
          <div className="pdf-page" id="pdf-page-2">
            <div className="pdf-header">
              <div className="pdf-logo">
                <BrainCircuit size={24} className="text-accent" />
                <span>{t('pdf.brandName') || "Careervo AI Guidance"}</span>
              </div>
              <div className="pdf-date">{new Date().toLocaleDateString('en-IN')}</div>
            </div>
            
            <div className="pdf-body">
              <h2 className="pdf-page-title">{t('pdf.topRecommended') || "Top Recommended Career Paths"}</h2>
              <div className="pdf-careers-container">
                {enrichedCareers.slice(0, 3).map((career, index) => (
                  <div key={career.id || index} className="pdf-career-card">
                    <div className="pdf-career-header">
                      <div className="pdf-career-title-group">
                        <span className="pdf-career-rank">#{index + 1}</span>
                        <h3 className="pdf-career-title">{lang === 'ml' ? (t(`careers.${career.id}`) || career.title) : career.title}</h3>
                      </div>
                      <span className="pdf-career-badge">{t('results.matchBadge', { score: career.match || 90 })}</span>
                    </div>
                    <p className="pdf-career-desc">
                      {parentMode ? career.parentWhy : career.why}
                    </p>
                    <div className="pdf-career-metrics">
                      <div className="pdf-metric-box">
                        <span className="pdf-metric-label">{t('results.salary') || "Salary Range"}</span>
                        <span className="pdf-metric-val" style={{ fontSize: '0.75rem' }}>{career.salary ? career.salary.replace(' / year', ' ' + t('terms.perYear')).replace('total', t('terms.total')) : ''}</span>
                      </div>
                      <div className="pdf-metric-box">
                        <span className="pdf-metric-label">{t('results.futureScope') || "Future Scope"}</span>
                        <span className="pdf-metric-val" style={{ color: '#059669', fontSize: '0.75rem' }}>{t(`terms.${career.futureScope}`) || career.futureScope}</span>
                      </div>
                      <div className="pdf-metric-box">
                        <span className="pdf-metric-label">{t('results.aiRisk') || "AI Risk"}</span>
                        <span className="pdf-metric-val" style={{ color: '#ef4444', fontSize: '0.75rem' }}>{t(`terms.${career.aiRisk}`) || career.aiRisk}</span>
                      </div>
                      <div className="pdf-metric-box">
                        <span className="pdf-metric-label">{t('results.globalDemand') || "Global Demand"}</span>
                        <span className="pdf-metric-val" style={{ fontSize: '0.75rem' }}>{t(`terms.${career.globalDemand}`) || career.globalDemand}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pdf-footer">
              <span>© {new Date().getFullYear()} Careervo. All rights reserved.</span>
              <span>{t('pdf.pageOf', { curr: 2, total: 3 })}</span>
            </div>
          </div>

          {/* Page 3 */}
          <div className="pdf-page" id="pdf-page-3">
            <div className="pdf-header">
              <div className="pdf-logo">
                <BrainCircuit size={24} className="text-accent" />
                <span>{t('pdf.brandName') || "Careervo AI Guidance"}</span>
              </div>
              <div className="pdf-date">{new Date().toLocaleDateString('en-IN')}</div>
            </div>
            
            <div className="pdf-body pdf-split-body">
              <div className="pdf-body-left">
                <h2 className="pdf-section-title">{t('pdf.executionRoadmap') || "Execution Roadmap"}</h2>
                <div className="pdf-roadmap-timeline">
                  {aiData.roadmap?.map((step, idx) => (
                    <div key={idx} className="pdf-roadmap-item">
                      <div className="pdf-roadmap-bullet">{idx + 1}</div>
                      <div className="pdf-roadmap-content">
                        <h4>{step.period}</h4>
                        <p>{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pdf-body-right">
                <h2 className="pdf-section-title">{t('pdf.recommendedColleges') || "Recommended Institutions"}</h2>
                
                <h3 className="pdf-sub-section-title">{t('pdf.keralaColleges') || "Kerala Colleges"}</h3>
                <div className="pdf-colleges-list">
                  {matchedColleges.kerala.slice(0, 3).map((college, idx) => {
                    const localizedCol = getLocalizedCollege(college);
                    return (
                      <div key={idx} className="pdf-college-row">
                        <span className="pdf-college-name">{localizedCol.name}</span>
                        <span className="pdf-college-details">{localizedCol.location} | {lang === 'ml' ? 'ശരാശരി പാക്കേജ്' : 'Avg Pkg'}: {college.avgPackage}</span>
                      </div>
                    );
                  })}
                </div>
                
                <h3 className="pdf-sub-section-title" style={{ marginTop: '16px' }}>{t('pdf.nationalColleges') || "National Colleges"}</h3>
                <div className="pdf-colleges-list">
                  {matchedColleges.india.slice(0, 3).map((college, idx) => {
                    const localizedCol = getLocalizedCollege(college);
                    return (
                      <div key={idx} className="pdf-college-row">
                        <span className="pdf-college-name">{localizedCol.name}</span>
                        <span className="pdf-college-details">{localizedCol.location} | {lang === 'ml' ? 'ശരാശരി പാക്കേജ്' : 'Avg Pkg'}: {college.avgPackage}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="pdf-footer">
              <span>© {new Date().getFullYear()} Careervo. All rights reserved.</span>
              <span>{t('pdf.pageOf', { curr: 3, total: 3 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
