import { useState, useEffect, useRef } from 'react';
import {
  DownloadCloud, Users, TrendingUp, MapPin, Building,
  CheckCircle2, Award, Briefcase, ChevronDown, ExternalLink, BrainCircuit
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { model } from '../lib/gemini';
import { careerDatabase, getCollegesForCareers } from '../lib/careerDatabase';
import './Results.css';

const Results = () => {
  const { t } = useLanguage();
  const { userProfile, updateProfile } = useUser();
  const [parentMode, setParentMode] = useState(false);
  
  const [showAllKerala, setShowAllKerala] = useState(false);
  const [showAllIndia, setShowAllIndia] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
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
          tags: c.tags,
          streams: c.streams
        }));

        const prompt = `
        You are Careervo AI. Analyze the following student profile and conversation history to select the top 3 recommended careers from our database.

        Student Stream: ${userProfile.stream || 'Unknown'}
        Interests: ${userProfile.interests?.join(", ") || 'Unknown'}
        Conversation History:
        ${JSON.stringify(userProfile.conversationHistory)}

        Select exactly 3 careers from this list:
        ${JSON.stringify(compactCareers)}

        Provide the response strictly as a JSON object with this exact structure (no markdown wrappers):
        {
          "traits": [
            { "name": "Creativity", "val": 85 },
            { "name": "Leadership", "val": 70 },
            { "name": "Analytical", "val": 90 },
            { "name": "Communication", "val": 80 }
          ],
          "workStyle": "Brief work style description",
          "ambition": "Brief ambition description",
          "roadmap": [
            { "period": "Phase 1: Fundamentals", "description": "Actionable step 1" },
            { "period": "Phase 2: Upskilling", "description": "Actionable step 2" },
            { "period": "Phase 3: Experience", "description": "Actionable step 3" }
          ],
          "careers": [
            {
              "id": "matched-career-id-from-list",
              "match": 95,
              "why": "Detailed reason why it fits the student's personality.",
              "parentWhy": "Reason tailored for parents (focus on stability, respect, high salary)."
            }
          ]
        }
        `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        
        // Clean up markdown block if present
        responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        const parsedData = JSON.parse(responseText);
        
        setAiData(parsedData);
        updateProfile({ aiResult: parsedData });
      } catch (error) {
        console.error("Failed to generate results", error);
      } finally {
        setIsGenerating(false);
      }
    };

    generateAnalysis();
  }, [aiData, userProfile, updateProfile]);

  const exportPDF = async () => {
    setIsExporting(true);
    const element = pdfRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Careervo_Report_${userProfile.name || 'Student'}.pdf`);
    setIsExporting(false);
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
          <h1>{t('results.title')}</h1>
          <p>{t('results.subtitle', { name: userProfile.name || 'Student' })}</p>
        </div>
        <div className="header-actions">
          <button
            className={`btn-secondary ${parentMode ? 'parent-mode-active' : ''}`}
            onClick={() => setParentMode(!parentMode)}
          >
            <Users size={18} />
            {parentMode ? t('results.exitParents') : t('results.explainParents')}
          </button>
          <button className="btn-primary" onClick={exportPDF} disabled={isExporting}>
            <DownloadCloud size={18} />
            {isExporting ? 'Exporting...' : t('results.exportPdf')}
          </button>
        </div>
      </div>

      <div className="dashboard-grid" ref={pdfRef} style={{ background: 'var(--bg-primary)', padding: isExporting ? '20px' : '0' }}>
        {/* Left Column */}
        <div className="grid-left">
          <div className="glass-panel profile-card animate-fade-in delay-100">
            <h3>{t('results.personality')}</h3>
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
            <div className="profile-summary">
              <strong>{t('results.workStyle')}:</strong> {aiData.workStyle}<br />
              <strong>{t('results.ambition')}:</strong> {aiData.ambition}
            </div>
          </div>

          <div className="glass-panel roadmap-card animate-fade-in delay-300">
            <h3>{t('results.roadmap')}</h3>
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
          <h2 className="section-title">{t('results.topMatches')}</h2>
          <div className="careers-list animate-fade-in delay-200">
            {enrichedCareers.map(career => (
              <div key={career.title || career.id} className="career-match-card glass-panel animate-fade-in">
                <div className="career-header flex-between">
                  <div className="career-title-group">
                    <TrendingUp className="text-accent" />
                    <h3>{career.title}</h3>
                  </div>
                  <div className="match-badge">{t('results.matchBadge', { score: career.match || 90 })}</div>
                </div>

                <p className="career-why">
                  {parentMode ? career.parentWhy : career.why}
                </p>

                <div className="career-stats-grid">
                  <div className="stat-box">
                    <span className="stat-label">{t('results.salary')}</span>
                    <span className="stat-val">{career.salary}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Future Scope</span>
                    <span className="stat-val text-success">{career.futureScope}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">{t('results.aiRisk')}</span>
                    <span className="stat-val text-success">{career.aiRisk}</span>
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
                    <span className="stat-label">Remote Work</span>
                    <span className="stat-val">{career.remoteWork}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Startup Potential</span>
                    <span className="stat-val">{career.startupOpportunities}</span>
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
                    <span><Building size={14} /> {college.category} | {t('results.fees')}: {college.fees}</span>
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
                    <span><Building size={14} /> {college.category} | {t('results.fees')}: {college.fees}</span>
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
