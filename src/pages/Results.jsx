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
import './Results.css';

const Results = () => {
  const { t } = useLanguage();
  const { userProfile, updateProfile } = useUser();
  const [parentMode, setParentMode] = useState(false);
  const [showAllColleges, setShowAllColleges] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [aiData, setAiData] = useState(userProfile.aiResult || null);
  const [isGenerating, setIsGenerating] = useState(!userProfile.aiResult);

  const pdfRef = useRef(null);

  useEffect(() => {
    const generateAnalysis = async () => {
      if (aiData || !userProfile.conversationHistory) {
        setIsGenerating(false);
        return;
      }
      
      try {
        const prompt = `
        You are Careervo AI. Analyze the following student profile and conversation history to provide comprehensive career and college recommendations.

        Student Stream: ${userProfile.stream || 'Unknown'}
        Interests: ${userProfile.interests?.join(", ") || 'Unknown'}
        Conversation History:
        ${JSON.stringify(userProfile.conversationHistory)}

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
              "title": "Career Title 1",
              "match": 95,
              "salary": "₹8L - ₹20L / year",
              "aiRisk": "Low",
              "demand": "Very High",
              "remote": "High",
              "stability": "High",
              "why": "Detailed reason why it fits the student's personality.",
              "parentWhy": "Reason tailored for parents (focus on stability, respect, high salary)."
            }
          ],
          "colleges": [
            {
              "name": "College Name",
              "location": "City, State",
              "type": "Government / Private",
              "fees": "Estimated Fees",
              "placement": "Placement %",
              "maxPackage": "Highest Package",
              "link": "https://website.com"
            }
          ]
        }
        
        Ensure you give exactly 4 traits, exactly 3 careers, and exactly 6 relevant real-world Indian colleges based on the recommended careers. Include a mix of top national institutes and regional options.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const parsedData = JSON.parse(cleanJson);
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
            {aiData.careers?.map(career => (
              <div key={career.title} className="career-match-card glass-panel">
                <div className="career-header flex-between">
                  <div className="career-title-group">
                    <TrendingUp className="text-accent" />
                    <h3>{career.title}</h3>
                  </div>
                  <div className="match-badge">{t('results.matchBadge', { score: career.match })}</div>
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
                    <span className="stat-label">{t('results.demand')}</span>
                    <span className="stat-val text-success">{career.demand}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">{t('results.aiRisk')}</span>
                    <span className="stat-val text-success">{career.aiRisk}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Remote Work</span>
                    <span className="stat-val">{career.remote}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Industry Stability</span>
                    <span className="stat-val text-success">{career.stability}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="section-title mt-8">Recommended Colleges</h2>
          <div className="colleges-grid animate-fade-in delay-300">
            {(showAllColleges ? aiData.colleges : aiData.colleges?.slice(0, 4))?.map((college, idx) => (
              <div key={idx} className="college-card glass-panel">
                <div className="college-info">
                  <h4>{college.name}</h4>
                  <div className="college-meta">
                    <span><MapPin size={14} /> {college.location}</span>
                    <span><Building size={14} /> {college.type} | {t('results.fees')}: {college.fees}</span>
                  </div>
                </div>
                <div className="college-stats">
                  <div className="stat"><span>{t('results.placements')}</span><strong>{college.placement}</strong></div>
                  <div className="stat"><span>{t('results.highest')}</span><strong>{college.maxPackage}</strong></div>
                </div>
                <a href={college.link} target="_blank" rel="noreferrer" className="btn-secondary w-full mt-4 flex-center" style={{ padding: '8px', fontSize: '0.85rem' }}>
                  Visit Website <ExternalLink size={14} style={{ marginLeft: '6px' }} />
                </a>
              </div>
            ))}
          </div>
          {aiData.colleges?.length > 4 && (
            <div className="text-center mt-4 mb-8">
              <button className="see-more-btn" onClick={() => setShowAllColleges(!showAllColleges)}>
                {showAllColleges ? 'See Less' : 'See More Colleges'} <ChevronDown size={16} style={{ transform: showAllColleges ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
