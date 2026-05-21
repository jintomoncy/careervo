import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Check, ChevronRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { selectQuestionsForStudent, selectNextQuestion } from '../lib/careerDatabase';
import { questionsMl } from '../lib/careerDatabase/questionsMl';
import './QuestionFlow.css';

const industries = [
  "Business", "Technology", "AI", "Design", "Finance", 
  "Marketing", "Agriculture", "Sports", "Healthcare", 
  "Psychology", "Media", "Law", "Fashion", 
  "Entrepreneurship", "Government Jobs", "Education", 
  "Hospitality", "Aviation"
];

const QuestionFlow = () => {
  const { t, lang } = useLanguage();
  const { userProfile, updateProfile } = useUser();
  const navigate = useNavigate();
  
  const [phase, setPhase] = useState('interests'); // 'interests' | 'questions' | 'analyzing'
  const [selectedInterests, setSelectedInterests] = useState(userProfile.interests || []);
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [conversationHistory, setConversationHistory] = useState([]);

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      if (selectedInterests.length < 5) {
        setSelectedInterests([...selectedInterests, interest]);
      }
    }
  };

  const startQuestions = () => {
    if (selectedInterests.length > 0) {
      updateProfile({ interests: selectedInterests });
      const firstQ = selectNextQuestion(userProfile.stream || 'Science', selectedInterests, [], new Set());
      setQuestions([firstQ]);
      setConversationHistory([]);
      setCurrentIndex(0);
      setPhase('questions');
    }
  };

  const handleAnswer = (selectedOptionText, originalOptionText) => {
    const currentQ = questions[currentIndex];
    const newAnswer = {
      questionId: currentQ.id,
      category: currentQ.category,
      question: currentQ.question, // Store English for AI reference consistency
      answer: originalOptionText,  // Store English for consistency
      answerMl: lang === 'ml' ? selectedOptionText : undefined,
      scoringLogic: currentQ.scoringLogic,
      tags: currentQ.tags
    };

    const updatedHistory = [...conversationHistory];
    updatedHistory[currentIndex] = newAnswer;
    updatedHistory.splice(currentIndex + 1); // Discard later answers if they changed a previous choice

    setConversationHistory(updatedHistory);

    if (currentIndex + 1 < 10) {
      const alreadySelectedIds = new Set(questions.slice(0, currentIndex + 1).map(q => q.id));
      const nextQ = selectNextQuestion(
        userProfile.stream || 'Science',
        selectedInterests,
        updatedHistory,
        alreadySelectedIds
      );
      const updatedQuestions = [...questions.slice(0, currentIndex + 1), nextQ];
      setQuestions(updatedQuestions);
      setCurrentIndex(currentIndex + 1);
    } else {
      updateProfile({ conversationHistory: updatedHistory });
      setPhase('analyzing');
    }
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      setPhase('interests');
    } else {
      setCurrentIndex(currentIndex - 1);
    }
  };

  useEffect(() => {
    if (phase === 'analyzing') {
      const timer = setTimeout(() => {
        navigate('/results');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, navigate]);

  const currentQuestionData = questions[currentIndex];

  const getIndustryName = (ind) => {
    const key = ind.toLowerCase().replace(/\s+/g, '_');
    return t(`industries.${key}`) || ind;
  };

  const getQuestionText = (qData) => {
    if (!qData) return '';
    return lang === 'ml' && questionsMl[qData.id] ? questionsMl[qData.id].question : qData.question;
  };

  const getQuestionOptions = (qData) => {
    if (!qData) return [];
    return lang === 'ml' && questionsMl[qData.id] ? questionsMl[qData.id].options : qData.options;
  };

  return (
    <div className="flow-container container">
      {phase === 'interests' && (
        <div className="interest-selection animate-fade-in">
          <div className="flow-header text-center">
            <h2>{t('questions.interestsTitle')}</h2>
            <p>{t('questions.interestsSub')}</p>
            <div className="selection-count">
              {selectedInterests.length} / 5 {t('questions.selected')}
            </div>
            {selectedInterests.length > 0 && (
              <div>
                <button className="reset-interests-btn" onClick={() => setSelectedInterests([])}>
                  {lang === 'ml' ? 'റീസെറ്റ് ചെയ്യുക' : 'Reset Selection'}
                </button>
              </div>
            )}
          </div>
          
          <div className="interests-grid">
            {industries.map(industry => (
              <div 
                key={industry} 
                className={`interest-card glass-panel ${selectedInterests.includes(industry) ? 'selected' : ''}`}
                onClick={() => toggleInterest(industry)}
              >
                {getIndustryName(industry)}
                {selectedInterests.includes(industry) && <Check size={16} className="check-icon" />}
              </div>
            ))}
          </div>
          
          <div className="flow-footer">
            <button 
              className="btn-primary btn-large" 
              onClick={startQuestions}
              disabled={selectedInterests.length === 0}
            >
              {t('questions.nextStep')}
              <ChevronRight />
            </button>
          </div>
        </div>
      )}

      {phase === 'questions' && (
        <div className="question-flow animate-fade-in">
          <div className="interests-summary-bar glass-panel flex-between">
            <div className="interests-summary-text">
              <strong>{lang === 'ml' ? 'തിരഞ്ഞെടുത്തവ:' : 'Selected:'} </strong>
              <span>{selectedInterests.map(i => getIndustryName(i)).join(" • ")}</span>
            </div>
            <button className="edit-interests-btn" onClick={() => setPhase('interests')}>
              {lang === 'ml' ? 'മാറ്റുക' : 'Edit Interests'}
            </button>
          </div>

          <div className="flow-navigation">
            <button className="back-btn flex-center" onClick={handleBack}>
              <span>← {lang === 'ml' ? 'മുൻപത്തെ ഘട്ടത്തിലേക്ക്' : 'Back to Previous Step'}</span>
            </button>
          </div>

          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="fill" 
                style={{ width: `${((currentIndex) / 10) * 100}%`, transition: 'width 0.4s ease' }}
              ></div>
            </div>
            <div className="progress-text">
              {t('questions.questionOf', { curr: currentIndex + 1, total: 10 })}
            </div>
          </div>

          {!currentQuestionData ? (
            <div className="question-card glass-panel flex-center flex-column" style={{ minHeight: '300px' }}>
              <Loader2 size={40} className="text-accent spinner-anim" style={{ animation: 'spin 1s linear infinite' }} />
              <p className="mt-4 text-secondary">{lang === 'ml' ? 'കരിയർവോ എ.ഐ ചോദ്യങ്ങൾ ലോഡ് ചെയ്യുന്നു...' : 'Careervo AI is loading your questions...'}</p>
            </div>
          ) : (
            <div className="question-card glass-panel animate-fade-in">
              <h2 className="question-text">{getQuestionText(currentQuestionData)}</h2>
              <div className="options-list">
                {getQuestionOptions(currentQuestionData).map((opt, idx) => {
                  const origOpt = currentQuestionData.options[idx];
                  const optText = typeof opt === 'string' ? opt : opt.text;
                  const origText = typeof origOpt === 'string' ? origOpt : origOpt.text;
                  
                  const prevAns = conversationHistory[currentIndex];
                  const isSelected = prevAns && prevAns.answer === origText;
                  
                  return (
                    <button 
                      key={idx} 
                      className={`option-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleAnswer(optText, origText)}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                      {optText}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {phase === 'analyzing' && (
        <div className="analyzing-state flex-center flex-column animate-fade-in">
          <div className="ai-spinner">
            <BrainCircuit size={64} className="text-accent pulse-anim" />
          </div>
          <h2>{t('questions.analyzingTitle')}</h2>
          <p className="text-secondary">{t('questions.analyzingSub')}</p>
          <div className="analyzing-steps">
            <div className="step-item animate-fade-in delay-100"><Check size={16} className="text-accent"/> {t('questions.step1')}</div>
            <div className="step-item animate-fade-in delay-200"><Check size={16} className="text-accent"/> {t('questions.step2')}</div>
            <div className="step-item animate-fade-in delay-300"><Check size={16} className="text-accent"/> {t('questions.step3')}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionFlow;
