import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Check, ChevronRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { model } from '../lib/gemini';
import './QuestionFlow.css';

const industries = [
  "Business", "Technology", "AI", "Design", "Finance", 
  "Marketing", "Agriculture", "Sports", "Healthcare", 
  "Psychology", "Media", "Law", "Fashion", 
  "Entrepreneurship", "Government Jobs", "Education", 
  "Hospitality", "Aviation"
];

const QuestionFlow = () => {
  const { t } = useLanguage();
  const { userProfile, updateProfile } = useUser();
  const navigate = useNavigate();
  
  const [phase, setPhase] = useState('interests'); // 'interests' | 'questions' | 'analyzing'
  const [selectedInterests, setSelectedInterests] = useState(userProfile.interests || []);
  
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentQuestionData, setCurrentQuestionData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      if (selectedInterests.length < 3) {
        setSelectedInterests([...selectedInterests, interest]);
      }
    }
  };

  const generateNextQuestion = async (history = conversationHistory) => {
    setIsGenerating(true);
    try {
      const prompt = `
      You are Careervo AI, an expert career counselor.

      Student Stream:
      ${userProfile.stream || "Not specified"}

      Student Interests:
      ${selectedInterests.join(", ")}

      Previous Conversation History (MANDATORY TO READ):
      ${JSON.stringify(history, null, 2)}

      Your task is to ask the NEXT consecutive career guidance question.

      CRITICAL ANTI-REPETITION RULES:
      - NEVER ask a question that is already in the Previous Conversation History.
      - DO NOT repeat previous questions or use similar wording.
      - Ask a completely NEW and UNIQUE question every time.
      - Analyze the previous answers before generating the next question. Each new question MUST depend on previous answers.
      - Progressively explore different topics: personality, goals, strengths, work style, leadership, creativity, communication, analytical thinking, entrepreneurship, risk tolerance.

      General Rules:
      - Ask exactly ONE question.
      - Give exactly 4 multiple-choice options.
      - Keep language simple and conversational.
      - You MUST ask at least 10 questions. You have currently asked ${history.length} questions.
      - If you have asked AT LEAST 10 questions AND have enough information to make a solid career recommendation, return EXACTLY the string "FINAL_RESULT" and nothing else.
      
      If asking a question, your response MUST be a valid JSON object in this exact format without markdown code blocks:
      {
        "question": "Question here",
        "options": [
          "Option 1",
          "Option 2",
          "Option 3",
          "Option 4"
        ]
      }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();

      if (responseText.includes("FINAL_RESULT")) {
        updateProfile({ conversationHistory: history });
        setPhase('analyzing');
        return;
      }

      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const nextQuestion = JSON.parse(cleanJson);
      
      setCurrentQuestionData(nextQuestion);
    } catch (error) {
      console.error("AI Generation Error:", error);
      setCurrentQuestionData({
        question: "What type of work environment do you prefer?",
        options: [
          "Fast-paced & dynamic",
          "Structured & predictable",
          "Creative & flexible",
          "Independent & quiet"
        ]
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startQuestions = () => {
    if (selectedInterests.length > 0) {
      updateProfile({ interests: selectedInterests });
      setPhase('questions');
      generateNextQuestion([]);
    }
  };

  const handleAnswer = (selectedOptionText) => {
    if (!currentQuestionData || isGenerating) return;

    const updatedHistory = [
      ...conversationHistory,
      {
        question: currentQuestionData.question,
        answer: selectedOptionText
      }
    ];

    setConversationHistory(updatedHistory);
    generateNextQuestion(updatedHistory);
  };

  useEffect(() => {
    if (phase === 'analyzing') {
      const timer = setTimeout(() => {
        navigate('/results');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, navigate]);

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
                {industry}
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
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="fill" 
                style={{ width: `${Math.min((conversationHistory.length / 10) * 100, 100)}%`, transition: 'width 0.4s ease' }}
              ></div>
            </div>
            <div className="progress-text">
              Question {conversationHistory.length + 1}
            </div>
          </div>

          {!currentQuestionData || isGenerating ? (
            <div className="question-card glass-panel flex-center flex-column" style={{ minHeight: '300px' }}>
              <Loader2 size={40} className="text-accent spinner-anim" style={{ animation: 'spin 1s linear infinite' }} />
              <p className="mt-4 text-secondary">Careervo AI is generating your next question...</p>
            </div>
          ) : (
            <div className="question-card glass-panel animate-fade-in">
              <h2 className="question-text">{currentQuestionData.question}</h2>
              <div className="options-list">
                {currentQuestionData.options.map((opt, idx) => (
                  <button 
                    key={idx} 
                    className="option-btn"
                    onClick={() => handleAnswer(opt)}
                    disabled={isGenerating}
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
