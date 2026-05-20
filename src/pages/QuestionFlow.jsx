import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Check, ChevronRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { selectQuestionsForStudent } from '../lib/careerDatabase';
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
      if (selectedInterests.length < 3) {
        setSelectedInterests([...selectedInterests, interest]);
      }
    }
  };

  const startQuestions = () => {
    if (selectedInterests.length === 3) {
      updateProfile({ interests: selectedInterests });
      const selectedQs = selectQuestionsForStudent(userProfile.stream || 'Science', selectedInterests, 10);
      setQuestions(selectedQs);
      setConversationHistory([]);
      setCurrentIndex(0);
      setPhase('questions');
    }
  };

  const handleAnswer = (selectedOptionText, originalOptionText) => {
    const currentQ = questions[currentIndex];
    const updatedHistory = [
      ...conversationHistory,
      {
        questionId: currentQ.id,
        category: currentQ.category,
        question: currentQ.question, // Store English for AI reference consistency
        answer: originalOptionText,  // Store English for consistency
        answerMl: lang === 'ml' ? selectedOptionText : undefined
      }
    ];

    setConversationHistory(updatedHistory);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      updateProfile({ conversationHistory: updatedHistory });
      setPhase('analyzing');
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
              {selectedInterests.length} / 3 {t('questions.selected')}
            </div>
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
              disabled={selectedInterests.length !== 3}
            >
              {t('questions.nextStep')}
              <ChevronRight />
            </button>
          </div>
        </div>
      )}

      {phase === 'questions' && (
        <div className="question-flow animate-fade-in">
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="fill" 
                style={{ width: `${((currentIndex) / questions.length) * 100}%`, transition: 'width 0.4s ease' }}
              ></div>
            </div>
            <div className="progress-text">
              {t('questions.questionOf', { curr: currentIndex + 1, total: questions.length })}
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
                {getQuestionOptions(currentQuestionData).map((opt, idx) => (
                  <button 
                    key={idx} 
                    className="option-btn"
                    onClick={() => handleAnswer(opt, currentQuestionData.options[idx])}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                    {opt}
                  </button>
                ))}
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
