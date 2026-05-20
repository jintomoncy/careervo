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
import { useNavigate } from 'react-router-dom';
import './Results.css';

const Results = () => {
  const { t, lang } = useLanguage();
  const { userProfile, updateProfile } = useUser();
  const navigate = useNavigate();
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

  const [loadingStep, setLoadingStep] = useState(1);

  const getTraitLabel = (traitName) => {
    if (!traitName) return "";
    const key = traitName.toLowerCase().replace(/[\s-]+/g, '_');
    const localized = t(`results.traits.${key}`);
    if (localized === `results.traits.${key}`) {
      return traitName.split(/[\s-_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }
    return localized;
  };

  const getCourseDetails = (career) => {
    let duration = lang === 'ml' ? '3 വർഷം' : '3 Years';
    const tTitle = career.title || "";
    if (tTitle.startsWith("BTech") || tTitle.startsWith("B.Arch") || tTitle.startsWith("BDes") || tTitle.startsWith("Integrated") || tTitle.includes("Engineering") || tTitle.includes("Architecture")) {
      if (tTitle.startsWith("B.Arch") || tTitle.startsWith("Integrated")) {
        duration = lang === 'ml' ? '5 വർഷം' : '5 Years';
      } else {
        duration = lang === 'ml' ? '4 വർഷം' : '4 Years';
      }
    } else if (tTitle.startsWith("MBBS")) {
      duration = lang === 'ml' ? '5.5 വർഷം' : '5.5 Years';
    } else if (tTitle.startsWith("MTech") || tTitle.startsWith("MBA") || tTitle.startsWith("MSc") || tTitle.startsWith("MA")) {
      duration = lang === 'ml' ? '2 വർഷം' : '2 Years';
    }
    
    const skills = (career.personalityMatch || []).map(s => {
      const key = s.toLowerCase().replace(/[\s-]+/g, '_');
      const val = t(`results.traits.${key}`);
      return val === `results.traits.${key}` ? s : val;
    }).slice(0, 3).join(", ");

    return {
      duration: duration,
      skills: skills || (lang === 'ml' ? 'വിശകലന ശേഷി, ശ്രദ്ധ' : 'Analytical thinking, focus'),
      demand: career.futureScope || 'High'
    };
  };

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < 3 ? prev + 1 : 1));
    }, 1500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    const generateAnalysis = async () => {
      if (aiData && aiData.generatedLang === lang) {
        setIsGenerating(false);
        return;
      }
      
      setIsGenerating(true);
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
        
        const finalData = {
          ...parsedData,
          generatedLang: lang
        };
        
        setAiData(finalData);
        updateProfile({ aiResult: finalData });
      } catch (error) {
        console.error("Failed to generate results, using local database fallback...", error);
        try {
          const fallbackData = getFallbackAnalysis(userProfile, lang);
          const finalData = {
            ...fallbackData,
            generatedLang: lang
          };
          setAiData(finalData);
          updateProfile({ aiResult: finalData });
        } catch (fallbackError) {
          console.error("Critical: Fallback also failed", fallbackError);
        }
      } finally {
        setIsGenerating(false);
      }
    };

    generateAnalysis();
  }, [aiData, userProfile, updateProfile, lang]);

  const exportPDF = async () => {
    setIsExporting(true);
    setExportType('pdf');
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 1; i <= 6; i++) {
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
      const element = document.getElementById('png-infographic-root');
      if (element) {
        const canvas = await html2canvas(element, { 
          scale: 2.0, 
          useCORS: true,
          logging: false,
          width: 1000,
          height: 1600
        });
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Careervo_AI_Poster_${userProfile.name || 'Student'}.png`;
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
    const loaderTitle = t('questions.analyzingTitle') || "Analyzing your profile...";
    const loaderSub = t('questions.analyzingSub') || "Our AI is matching your personality and interests with optimal career paths.";
    const steps = [
      t('questions.step1') || "Evaluating psychological traits",
      t('questions.step2') || "Cross-referencing industry demands",
      t('questions.step3') || "Generating intelligence report"
    ];
    return (
      <div className="ai-loading-container container flex-center flex-column animate-fade-in">
        <div className="ai-spinner mb-6">
          <BrainCircuit size={72} className="text-accent pulse-anim spin-slow" />
        </div>
        <h2 className="ai-loading-title">{loaderTitle}</h2>
        <p className="ai-loading-sub">{loaderSub}</p>
        
        <div className="loading-steps-indicator">
          {steps.map((stepText, idx) => {
            const stepNum = idx + 1;
            const isActive = loadingStep === stepNum;
            const isCompleted = loadingStep > stepNum;
            
            let statusClass = "pending";
            if (isActive) statusClass = "active";
            else if (isCompleted) statusClass = "completed";

            return (
              <div 
                key={idx} 
                className={`loading-step-row ${statusClass}`}
              >
                <div className={`step-dot flex-center ${isCompleted ? 'completed' : isActive ? 'active' : ''}`}>
                  {stepNum}
                </div>
                <span className="step-text">{stepText}</span>
              </div>
            );
          })}
        </div>
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

  const enrichedCareers = aiData.careers?.map(rc => {
    const dbCareer = careerDatabase.find(c => c.id === rc.id) || {};
    return {
      ...dbCareer,
      ...rc
    };
  }) || [];

  const recommendedCareerIds = enrichedCareers.map(c => c.id);

  // Fallback Matching Algorithm for Exactly 10 Colleges
  const getTop10Colleges = (collegesPool, careerIds) => {
    const matching = collegesPool.filter(college =>
      college.availableCourses.some(courseId => careerIds.includes(courseId))
    );
    matching.sort((a, b) => b.placementScore - a.placementScore);

    const result = [...matching];

    if (result.length < 10) {
      const selectedCategories = (userProfile.interests || []).map(cat => cat.toLowerCase());
      const interestMatching = collegesPool.filter(college => {
        if (result.some(r => r.name === college.name)) return false;
        return college.availableCourses.some(courseId => {
          const dbCourse = careerDatabase.find(c => c.id === courseId);
          return dbCourse && selectedCategories.includes(dbCourse.category.toLowerCase());
        });
      });
      interestMatching.sort((a, b) => b.placementScore - a.placementScore);
      result.push(...interestMatching);
    }

    if (result.length < 10) {
      const remaining = collegesPool.filter(college => !result.some(r => r.name === college.name));
      remaining.sort((a, b) => b.placementScore - a.placementScore);
      result.push(...remaining);
    }

    return result.slice(0, 10);
  };

  const top10Kerala = getTop10Colleges(collegeDatabase.kerala, recommendedCareerIds);
  const top10India = getTop10Colleges(collegeDatabase.india, recommendedCareerIds);

  const displayedKerala = showAllKerala ? top10Kerala : top10Kerala.slice(0, 3);
  const displayedIndia = showAllIndia ? top10India : top10India.slice(0, 3);

  // Calculate highest match percentage for cover page
  const maxMatchScore = enrichedCareers.reduce((max, c) => c.match > max ? c.match : max, 85);

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

      <div className="edit-flow-actions-bar glass-panel animate-fade-in">
        <span className="actions-bar-label">
          <BrainCircuit size={16} className="text-accent" />
          {lang === 'ml' ? 'റിപ്പോർട്ട് ഓപ്ഷനുകൾ:' : 'Report Options:'}
        </span>
        <div className="actions-bar-buttons">
          <button className="btn-action-pill" onClick={() => navigate('/onboarding')}>
            {lang === 'ml' ? 'പ്രൊഫൈൽ തിരുത്തുക' : 'Edit Profile'}
          </button>
          <button className="btn-action-pill" onClick={() => navigate('/analysis')}>
            {lang === 'ml' ? 'താല്പര്യങ്ങൾ തിരുത്തുക' : 'Edit Interests'}
          </button>
          <button className="btn-action-pill" onClick={() => {
            updateProfile({ answers: {} });
            navigate('/analysis');
          }}>
            {lang === 'ml' ? 'വീണ്ടും അനാലിസിസ് ചെയ്യുക' : 'Re-analyze'}
          </button>
        </div>
      </div>

      <div className="dashboard-grid" style={{ background: 'var(--bg-primary)', padding: isExporting ? '20px' : '0' }}>
        {/* Left Column */}
        <div className="grid-left">
          <div className="glass-panel profile-card animate-fade-in delay-100">
            <h3>{t('results.personality') || "Personality Profile"}</h3>
            <div className="traits-list">
              {aiData.traits?.map(tTrait => (
                <div key={tTrait.name} className="trait-item">
                  <div className="trait-header">
                    <span>{getTraitLabel(tTrait.name)}</span>
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
            {displayedKerala.map((college, idx) => {
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
          {top10Kerala.length > 3 && (
            <div className="text-center mt-4 mb-4">
              <button className="see-more-btn" onClick={() => setShowAllKerala(!showAllKerala)}>
                {showAllKerala ? (lang === 'ml' ? 'കുറച്ചു കാണിക്കുക' : 'See Less') : (lang === 'ml' ? 'കൂടുതൽ കേരളത്തിലെ കോളേജുകൾ കാണുക' : 'See More Kerala Colleges')} <ChevronDown size={16} style={{ transform: showAllKerala ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
              </button>
            </div>
          )}

          <h2 className="section-title mt-8">{t('results.collegesIndia') || "Recommended National Colleges (India)"}</h2>
          <div className="colleges-grid animate-fade-in delay-300">
            {displayedIndia.map((college, idx) => {
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
          {top10India.length > 3 && (
            <div className="text-center mt-4 mb-8">
              <button className="see-more-btn" onClick={() => setShowAllIndia(!showAllIndia)}>
                {showAllIndia ? (lang === 'ml' ? 'കുറച്ചു കാണിക്കുക' : 'See Less') : (lang === 'ml' ? 'കൂടുതൽ ഇന്ത്യയിലെ കോളേജുകൾ കാണുക' : 'See More India Colleges')} <ChevronDown size={16} style={{ transform: showAllIndia ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* ─── HIDDEN HIGH-FIDELITY LAYOUTS FOR PDF/PNG EXPORT ─── */}
      <div style={{ position: 'absolute', left: '-9999px', top: '0', pointerEvents: 'none' }}>
        
        {/* PNG Infographic Root */}
        <div id="png-infographic-root" style={{ width: '1000px', height: '1600px', fontFamily: "'Inter', sans-serif" }}>
          <div className="png-header">
            <div className="png-logo">
              <BrainCircuit size={32} style={{ color: '#38bdf8' }} />
              <span>Careervo AI Intelligence Infographic</span>
            </div>
            <div className="png-meta-info">
              <span>{lang === 'ml' ? 'വിദ്യാർത്ഥി' : 'Student'}: <strong>{userProfile.name || 'Student'}</strong></span>
              <span>{lang === 'ml' ? 'ഗ്രൂപ്പ്' : 'Stream'}: <strong>{userProfile.stream || 'Science'}</strong></span>
              <span>{lang === 'ml' ? 'തീയതി' : 'Date'}: <strong>{new Date().toLocaleDateString('en-IN')}</strong></span>
            </div>
          </div>

          <div className="png-body-grid">
            {/* Left Column */}
            <div className="png-column-left">
              {/* Personality Card */}
              <div className="png-card">
                <h3>{t('results.personality') || "Personality Profile"}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {aiData.traits?.slice(0, 5).map(tTrait => (
                    <div key={tTrait.name} className="png-trait-row">
                      <div className="png-trait-meta">
                        <span>{getTraitLabel(tTrait.name)}</span>
                        <span>{tTrait.val}%</span>
                      </div>
                      <div className="png-trait-bar">
                        <div className="png-trait-bar-fill" style={{ width: `${tTrait.val}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Behavior Profile Card */}
              <div className="png-card">
                <h3>{lang === 'ml' ? 'സ്വഭാവ വിശകലനം' : 'Behavior Profile'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="png-behavior-desc">
                    <strong>{t('results.workStyle') || 'Work Style'}: </strong>
                    <span>{aiData.workStyle}</span>
                  </div>
                  <div className="png-behavior-desc" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                    <strong>{t('results.ambition') || 'Ambition Type'}: </strong>
                    <span>{aiData.ambition}</span>
                  </div>
                </div>
              </div>

              {/* Skills Summary Card */}
              <div className="png-card" style={{ flexGrow: 1 }}>
                <h3>{lang === 'ml' ? 'ആവശ്യമായ നൈപുണ്യങ്ങൾ' : 'Skills & Courses Summary'}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                  {Array.from(new Set(
                    enrichedCareers.slice(0, 3).flatMap(c => c.skills || [])
                  )).slice(0, 8).map((skill, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        background: 'rgba(56, 189, 248, 0.08)', 
                        color: '#38bdf8', 
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <h4 style={{ fontSize: '0.9rem', color: '#38bdf8', marginBottom: '10px', fontWeight: '700' }}>
                  {lang === 'ml' ? 'പ്രധാന പഠനവിഷയങ്ങൾ' : 'Top Recommended Courses'}
                </h4>
                <ul style={{ paddingLeft: '16px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                  {enrichedCareers.slice(0, 5).map((c, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>
                      {lang === 'ml' ? (t(`careers.${c.id}`) || c.title) : c.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column */}
            <div className="png-column-right">
              {/* Career Matches Card */}
              <div className="png-card">
                <h3>{t('results.topMatches') || "Top Career Matches"}</h3>
                {enrichedCareers.slice(0, 5).map((career, idx) => (
                  <div key={idx} className="png-career-item">
                    <div className="png-career-header">
                      <span className="png-career-title">{lang === 'ml' ? (t(`careers.${career.id}`) || career.title) : career.title}</span>
                      <span className="png-career-badge">{t('results.matchBadge', { score: career.match || 90 })}</span>
                    </div>
                    <div className="png-career-stats">
                      <div className="png-stat-box">
                        <span className="png-stat-label">{t('results.salary')}</span>
                        <span className="png-stat-val">{career.salary ? career.salary.split('/')[0].trim() : ''}</span>
                      </div>
                      <div className="png-stat-box">
                        <span className="png-stat-label">{t('results.futureScope')}</span>
                        <span className="png-stat-val" style={{ color: '#10b981' }}>{t(`terms.${career.futureScope}`) || career.futureScope}</span>
                      </div>
                      <div className="png-stat-box">
                        <span className="png-stat-label">{t('results.aiRisk')}</span>
                        <span className="png-stat-val" style={{ color: '#ef4444' }}>{t(`terms.${career.aiRisk}`) || career.aiRisk}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Colleges Card */}
              <div className="png-card" style={{ flexGrow: 1 }}>
                <h3>{lang === 'ml' ? 'മികച്ച കോളേജുകൾ (കേരളം & ഇന്ത്യ)' : 'Top Colleges (Kerala & National)'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {lang === 'ml' ? 'കേരളം' : 'Kerala'}
                    </h4>
                    <div className="png-colleges-list">
                      {top10Kerala.slice(0, 5).map((c, idx) => (
                        <div key={idx} className="png-college-row">
                          <span className="png-college-name">{getLocalizedCollege(c).name}</span>
                          <span className="png-college-pkg">{c.avgPackage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {lang === 'ml' ? 'ഇന്ത്യൻ' : 'National'}
                    </h4>
                    <div className="png-colleges-list">
                      {top10India.slice(0, 5).map((c, idx) => (
                        <div key={idx} className="png-college-row">
                          <span className="png-college-name">{getLocalizedCollege(c).name}</span>
                          <span className="png-college-pkg">{c.avgPackage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="png-footer">
            <span>{lang === 'ml' ? 'കരിയർവോ എ.ഐ വഴി തയ്യാറാക്കിയത്' : 'Generated via Careervo AI Intelligence Platform'}</span>
            <span className="png-footer-badge">Careervo Poster Report</span>
          </div>
        </div>

        <div id="pdf-report-root">
          
          {/* Page 1: COVER PAGE */}
          <div className="pdf-page" id="pdf-page-1">
            <div className="pdf-header">
              <div className="pdf-logo">
                <BrainCircuit size={24} style={{ color: '#0f3d8c' }} />
                <span>{t('pdf.brandName') || "Careervo AI Guidance"}</span>
              </div>
              <div className="pdf-date">{new Date().toLocaleDateString('en-IN')}</div>
            </div>
            
            <div className="pdf-body flex-center flex-column" style={{ justifyContent: 'center', height: '100%', gap: '40px' }}>
              <div className="pdf-hero w-full text-center" style={{ padding: '48px 32px', background: 'linear-gradient(135deg, #0f3d8c 0%, #1d4ed8 100%)', borderRadius: '16px' }}>
                <h1 className="pdf-main-title" style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{t('pdf.reportTitle') || "CAREER PATHWAY ANALYSIS"}</h1>
                <p className="pdf-sub-title" style={{ fontSize: '1.2rem', opacity: 0.9 }}>{t('pdf.reportSub') || "Personalized Assessment Report for Students"}</p>
              </div>

              {/* Match Score Circle */}
              <div className="flex-center flex-column" style={{ margin: '20px 0' }}>
                <div style={{ width: '160px', height: '160px', borderRadius: '50%', border: '8px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: '#f8fafc', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI MATCH</span>
                  <span style={{ fontSize: '3.2rem', fontWeight: '800', color: '#0f3d8c', lineHeight: 1 }}>{maxMatchScore}%</span>
                </div>
              </div>
              
              <div className="pdf-meta-grid w-full" style={{ border: '2px solid #e5e7eb', padding: '24px', borderRadius: '12px', background: '#f9fafb' }}>
                <div className="pdf-meta-item">
                  <span className="pdf-meta-label" style={{ fontSize: '0.85rem', color: '#6b7280' }}>{t('pdf.studentName') || "STUDENT NAME"}</span>
                  <span className="pdf-meta-val" style={{ fontSize: '1.1rem', color: '#111827' }}>{userProfile.name || 'Student'}</span>
                </div>
                <div className="pdf-meta-item">
                  <span className="pdf-meta-label" style={{ fontSize: '0.85rem', color: '#6b7280' }}>{t('pdf.academicStream') || "ACADEMIC STREAM"}</span>
                  <span className="pdf-meta-val" style={{ fontSize: '1.1rem', color: '#111827' }}>{userProfile.stream === 'Science' ? (lang === 'ml' ? 'സയൻസ്' : 'Science') : userProfile.stream === 'Commerce' ? (lang === 'ml' ? 'കോമേഴ്‌സ്' : 'Commerce') : (lang === 'ml' ? 'ഹ്യുമാനിറ്റീസ്' : 'Humanities')}</span>
                </div>
                <div className="pdf-meta-item">
                  <span className="pdf-meta-label" style={{ fontSize: '0.85rem', color: '#6b7280' }}>{t('pdf.interestFocus') || "EVALUATION FOCUS"}</span>
                  <span className="pdf-meta-val" style={{ fontSize: '1.1rem', color: '#111827' }}>{userProfile.interests?.map(i => t('industries.' + i.toLowerCase().replace(/\s+/g, '_')) || i).join(", ") || 'General'}</span>
                </div>
              </div>

              {/* Brief Intro */}
              <div style={{ padding: '0 24px', textAlign: 'center', color: '#4b5563', lineHeight: '1.8' }}>
                <p>
                  {lang === 'ml' 
                    ? 'ഈ കരിയർ ഇന്റലിജൻസ് റിപ്പോർട്ട് വിദ്യാർത്ഥിയുടെ വ്യക്തിത്വ സവിശേഷതകൾ, കരിയർ താല്പര്യങ്ങൾ, പരീക്ഷാ ഉത്തരങ്ങൾ എന്നിവ എ.ഐ സാങ്കേതികവിദ്യ ഉപയോഗിച്ച് വിശകലനം ചെയ്ത് തയ്യാറാക്കിയതാണ്. അടുത്ത ഘട്ടങ്ങളിൽ അനുയോജ്യമായ കോഴ്സുകൾ, കരിയർ വഴികൾ, കോളേജുകൾ, 1 വർഷത്തെ പഠനപദ്ധതി എന്നിവ ഉൾക്കൊള്ളുന്നു.'
                    : 'This career intelligence report analyzes the student\'s cognitive strengths, traits, and answers using proprietary algorithms. It contains personalized course pathways, career recommendation cards, recommended institutions, and a 1-year transition roadmap.'
                  }
                </p>
              </div>
            </div>
            
            <div className="pdf-footer">
              <span>© {new Date().getFullYear()} Careervo. All rights reserved.</span>
              <span>{t('pdf.pageOf', { curr: 1, total: 6 })}</span>
            </div>
          </div>
          
          {/* Page 2: PERSONALITY PROFILE & BEHAVIORS */}
          <div className="pdf-page" id="pdf-page-2">
            <div className="pdf-header">
              <div className="pdf-logo">
                <BrainCircuit size={24} style={{ color: '#0f3d8c' }} />
                <span>{t('pdf.brandName') || "Careervo AI Guidance"}</span>
              </div>
              <div className="pdf-date">{new Date().toLocaleDateString('en-IN')}</div>
            </div>
            
            <div className="pdf-body">
              <div className="pdf-section">
                <h2 className="pdf-section-title">{t('pdf.cognitiveProfile') || "Cognitive & Personality Profile"}</h2>
                <div className="pdf-traits-grid" style={{ gap: '24px 32px' }}>
                  {aiData.traits?.map(tTrait => (
                    <div key={tTrait.name} className="pdf-trait-card">
                      <div className="pdf-trait-header">
                        <span className="pdf-trait-name" style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{getTraitLabel(tTrait.name)}</span>
                        <span className="pdf-trait-score" style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{tTrait.val}%</span>
                      </div>
                      <div className="pdf-trait-bar" style={{ height: '10px' }}>
                        <div className="pdf-trait-bar-fill" style={{ width: `${tTrait.val}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pdf-section" style={{ marginTop: '40px' }}>
                <h2 className="pdf-section-title">{t('pdf.behavioralEvaluation') || "Behavioral Evaluation"}</h2>
                <div className="pdf-behavior-box" style={{ padding: '24px', fontSize: '1rem' }}>
                  <p style={{ marginBottom: '16px' }}><strong style={{ color: '#0f3d8c' }}>{t('results.workStyle') || 'Work Style'}: </strong>{aiData.workStyle}</p>
                  <p><strong style={{ color: '#0f3d8c' }}>{t('results.ambition') || 'Ambition Type'}: </strong>{aiData.ambition}</p>
                </div>
              </div>
            </div>
            
            <div className="pdf-footer">
              <span>© {new Date().getFullYear()} Careervo. All rights reserved.</span>
              <span>{t('pdf.pageOf', { curr: 2, total: 6 })}</span>
            </div>
          </div>

          {/* Page 3: CAREER RECOMMENDATIONS */}
          <div className="pdf-page" id="pdf-page-3">
            <div className="pdf-header">
              <div className="pdf-logo">
                <BrainCircuit size={24} style={{ color: '#0f3d8c' }} />
                <span>{t('pdf.brandName') || "Careervo AI Guidance"}</span>
              </div>
              <div className="pdf-date">{new Date().toLocaleDateString('en-IN')}</div>
            </div>
            
            <div className="pdf-body">
              <h2 className="pdf-page-title">{t('pdf.topRecommended') || "Top Recommended Career Paths"}</h2>
              <div className="pdf-careers-container" style={{ gap: '24px' }}>
                {enrichedCareers.slice(0, 3).map((career, index) => (
                  <div key={career.id || index} className="pdf-career-card" style={{ padding: '20px', borderLeftWidth: '6px' }}>
                    <div className="pdf-career-header">
                      <div className="pdf-career-title-group">
                        <span className="pdf-career-rank">#{index + 1}</span>
                        <h3 className="pdf-career-title" style={{ fontSize: '1.2rem' }}>{lang === 'ml' ? (t(`careers.${career.id}`) || career.title) : career.title}</h3>
                      </div>
                      <span className="pdf-career-badge">{t('results.matchBadge', { score: career.match || 90 })}</span>
                    </div>
                    <p className="pdf-career-desc" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                      {parentMode ? career.parentWhy : career.why}
                    </p>
                    <div className="pdf-career-metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', paddingTop: '16px' }}>
                      <div className="pdf-metric-box">
                        <span className="pdf-metric-label">{t('results.salary') || "Salary Range"}</span>
                        <span className="pdf-metric-val" style={{ fontSize: '0.85rem' }}>{career.salary ? career.salary.replace(' / year', ' ' + t('terms.perYear')).replace('total', t('terms.total')) : ''}</span>
                      </div>
                      <div className="pdf-metric-box">
                        <span className="pdf-metric-label">{t('results.futureScope') || "Future Scope"}</span>
                        <span className="pdf-metric-val" style={{ color: '#059669', fontSize: '0.85rem' }}>{t(`terms.${career.futureScope}`) || career.futureScope}</span>
                      </div>
                      <div className="pdf-metric-box">
                        <span className="pdf-metric-label">{t('results.aiRisk') || "AI Risk"}</span>
                        <span className="pdf-metric-val" style={{ color: '#ef4444', fontSize: '0.85rem' }}>{t(`terms.${career.aiRisk}`) || career.aiRisk}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pdf-footer">
              <span>© {new Date().getFullYear()} Careervo. All rights reserved.</span>
              <span>{t('pdf.pageOf', { curr: 3, total: 6 })}</span>
            </div>
          </div>

          {/* Page 4: RECOMMENDED COURSES & ROADMAP */}
          <div className="pdf-page" id="pdf-page-4">
            <div className="pdf-header">
              <div className="pdf-logo">
                <BrainCircuit size={24} style={{ color: '#0f3d8c' }} />
                <span>{t('pdf.brandName') || "Careervo AI Guidance"}</span>
              </div>
              <div className="pdf-date">{new Date().toLocaleDateString('en-IN')}</div>
            </div>
            
            <div className="pdf-body" style={{ gap: '28px' }}>
              <div>
                <h2 className="pdf-section-title">{t('pdf.recommendedCourses') || "Recommended Courses & Duration"}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {enrichedCareers.slice(0, 3).map((career, idx) => {
                    const cDetails = getCourseDetails(career);
                    return (
                      <div key={idx} style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div className="flex-between" style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#0f3d8c', fontSize: '1rem' }}>{lang === 'ml' ? (t(`careers.${career.id}`) || career.title) : career.title}</strong>
                          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px' }}>
                            {t('pdf.courseDuration') || 'Duration'}: {cDetails.duration}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span><strong>{t('pdf.skillsRequired') || 'Skills Required'}:</strong> {cDetails.skills}</span>
                          <span><strong>{t('pdf.futureDemand') || 'Future Demand'}:</strong> {t(`terms.${cDetails.demand}`) || cDetails.demand}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="pdf-section-title">{t('pdf.executionRoadmap') || "Execution Roadmap"}</h2>
                <div className="pdf-roadmap-timeline">
                  {aiData.roadmap?.map((step, idx) => (
                    <div key={idx} className="pdf-roadmap-item" style={{ gap: '16px' }}>
                      <div className="pdf-roadmap-bullet">{idx + 1}</div>
                      <div className="pdf-roadmap-content">
                        <h4 style={{ fontSize: '0.95rem' }}>{step.period}</h4>
                        <p style={{ fontSize: '0.85rem' }}>{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="pdf-footer">
              <span>© {new Date().getFullYear()} Careervo. All rights reserved.</span>
              <span>{t('pdf.pageOf', { curr: 4, total: 6 })}</span>
            </div>
          </div>

          {/* Page 5: TOP KERALA COLLEGES (10 COLLEGES) */}
          <div className="pdf-page" id="pdf-page-5">
            <div className="pdf-header">
              <div className="pdf-logo">
                <BrainCircuit size={24} style={{ color: '#0f3d8c' }} />
                <span>{t('pdf.brandName') || "Careervo AI Guidance"}</span>
              </div>
              <div className="pdf-date">{new Date().toLocaleDateString('en-IN')}</div>
            </div>
            
            <div className="pdf-body">
              <h2 className="pdf-page-title">{t('pdf.keralaTop10') || "Top 10 Institutions in Kerala"}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {top10Kerala.map((college, idx) => {
                  const localizedCol = getLocalizedCollege(college);
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#9ca3af', width: '24px' }}>#{idx + 1}</span>
                        <div>
                          <span className="pdf-college-name" style={{ fontSize: '0.9rem', color: '#1f2937' }}>{localizedCol.name}</span>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                            <span>{localizedCol.location} | {(college.category === "Government" ? (lang === 'ml' ? 'ഗവൺമെന്റ്' : 'Government') : (lang === 'ml' ? 'പ്രൈവറ്റ്' : 'Private'))}</span>
                            <span style={{ marginLeft: '12px' }}>{t('results.fees') || "Fees"}: {college.fees ? college.fees.replace(' / year', ' ' + t('terms.perYear')).replace('total', t('terms.total')) : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#4b5563', lineHeight: '1.4' }}>
                        <div><strong>{lang === 'ml' ? 'ശരാശരി പാക്കേജ്' : 'Avg Pkg'}:</strong> {college.avgPackage}</div>
                        <div><strong>{lang === 'ml' ? 'ഉയർന്ന പാക്കേജ്' : 'Highest'}:</strong> {college.highestPackage}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="pdf-footer">
              <span>© {new Date().getFullYear()} Careervo. All rights reserved.</span>
              <span>{t('pdf.pageOf', { curr: 5, total: 6 })}</span>
            </div>
          </div>

          {/* Page 6: TOP INDIA COLLEGES (10 COLLEGES) & AI SUMMARY */}
          <div className="pdf-page" id="pdf-page-6">
            <div className="pdf-header">
              <div className="pdf-logo">
                <BrainCircuit size={24} style={{ color: '#0f3d8c' }} />
                <span>{t('pdf.brandName') || "Careervo AI Guidance"}</span>
              </div>
              <div className="pdf-date">{new Date().toLocaleDateString('en-IN')}</div>
            </div>
            
            <div className="pdf-body" style={{ justifyContent: 'space-between', gap: '20px' }}>
              <div>
                <h2 className="pdf-page-title" style={{ marginBottom: '14px' }}>{t('pdf.nationalTop10') || "Top 10 National Institutions"}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {top10India.map((college, idx) => {
                    const localizedCol = getLocalizedCollege(college);
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#9ca3af', width: '24px' }}>#{idx + 1}</span>
                          <div>
                            <span className="pdf-college-name" style={{ fontSize: '0.85rem', color: '#1f2937' }}>{localizedCol.name}</span>
                            <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '2px' }}>
                              <span>{localizedCol.location} | {(college.category === "Government" ? (lang === 'ml' ? 'ഗവൺമെന്റ്' : 'Government') : (lang === 'ml' ? 'പ്രൈവറ്റ്' : 'Private'))}</span>
                              <span style={{ marginLeft: '12px' }}>{t('results.fees') || "Fees"}: {college.fees ? college.fees.replace(' / year', ' ' + t('terms.perYear')).replace('total', t('terms.total')) : ''}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.7rem', color: '#4b5563', lineHeight: '1.4' }}>
                          <div><strong>{lang === 'ml' ? 'ശരാശരി' : 'Avg'}:</strong> {college.avgPackage}</div>
                          <div><strong>{lang === 'ml' ? 'ഉയർന്നത്' : 'Highest'}:</strong> {college.highestPackage}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Concluding Executive AI Summary */}
              <div style={{ border: '2px solid #0f3d8c', padding: '16px', borderRadius: '10px', background: '#f0fdf4', borderStyle: 'dashed' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f3d8c', marginBottom: '6px', textTransform: 'uppercase' }}>
                  {t('pdf.finalSummary') || "Executive AI Summary"}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#374151', lineHeight: '1.5', margin: 0 }}>
                  {lang === 'ml' 
                    ? 'ഈ വിശകലന റിപ്പോർട്ടിലെ വിവരങ്ങൾ കരിയർ തിരഞ്ഞെടുപ്പുകൾക്ക് മികച്ച ഒരു അടിത്തറ നൽകുന്നു. നിങ്ങളുടെ വൈദഗ്ധ്യം വർദ്ധിപ്പിക്കുന്നതിനും അനുയോജ്യമായ സർട്ടിഫിക്കേഷനുകൾ നേടുന്നതിനും നൽകിയിട്ടുള്ള 1 വർഷത്തെ ഗൈഡ് ഉപയോഗിക്കുക. കരിയർ മേഖലകളിലെ മാറ്റങ്ങൾക്കനുസരിച്ച് തയ്യാറെടുപ്പുകൾ നടത്താൻ Careervo ആശംസിക്കുന്നു.'
                    : 'The analysis provided in this report forms a strong strategic base for your career transition. Make active use of the 1-year milestones provided in the action roadmap to stack certifications and gain critical internships. Careervo wishes you all the best in your career pursuits.'
                  }
                </p>
              </div>
            </div>
            
            <div className="pdf-footer">
              <span>© {new Date().getFullYear()} Careervo. All rights reserved.</span>
              <span>{t('pdf.pageOf', { curr: 6, total: 6 })}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Results;
