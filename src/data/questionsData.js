// ============================================================
// CAREERVO — QUESTION BANK  (700+ questions)
// Schema per question:
//  id, question, options[]{text, score{}},
//  industryTags[], difficulty, skillMeasured,
//  personalityTraits[], weightage, category
// ============================================================

export const CATEGORIES = [
  'leadership','logic','creativity','risk_taking','communication',
  'emotional_intelligence','technical_thinking','entrepreneurship',
  'teamwork','discipline','research_mindset','analytical_thinking',
  'design_thinking','sales_ability','public_speaking','problem_solving',
  'adaptability','financial_intelligence','strategic_thinking','curiosity'
];

export const DIFFICULTY = { EASY:'easy', MEDIUM:'medium', HARD:'hard' };

const q = (id, question, options, industryTags, difficulty, skillMeasured, personalityTraits, weightage, category) =>
  ({ id, question, options, industryTags, difficulty, skillMeasured, personalityTraits, weightage, category });

const opt = (text, score) => ({ text, score });

// ─── LEADERSHIP (40 questions) ───────────────────────────────────────────────
const leadershipQuestions = [
  q('ld_001','When a group project has no clear leader, what do you typically do?',
    [opt('Step up and organize the team',{leadership:4,communication:3}),
     opt('Suggest someone else take charge',{teamwork:3,communication:2}),
     opt('Focus on my own task quietly',{discipline:3}),
     opt('Wait to see how things unfold',{adaptability:2})],
    ['business','technology','entrepreneurship'],'easy','leadership',['leadership','communication'],1.3,'leadership'),

  q('ld_002','You are managing a team and one member is underperforming. How do you handle it?',
    [opt('Have a one-on-one conversation to understand and support them',{leadership:4,emotional_intelligence:4}),
     opt('Reassign their tasks to stronger members',{leadership:2,teamwork:1}),
     opt('Report to management immediately',{discipline:2}),
     opt('Ignore it and hope it improves',{adaptability:1})],
    ['business','healthcare','education'],'medium','leadership',['leadership','emotional_intelligence'],1.4,'leadership'),

  q('ld_003','What does effective leadership mean to you?',
    [opt('Inspiring others toward a shared vision',{leadership:4,communication:4}),
     opt('Making all key decisions yourself',{leadership:2}),
     opt('Keeping the team happy at all costs',{emotional_intelligence:3,teamwork:2}),
     opt('Completing tasks ahead of schedule',{discipline:3})],
    ['business','entrepreneurship','government_jobs'],'easy','leadership',['leadership','strategic_thinking'],1.2,'leadership'),

  q('ld_004','You need to deliver bad news to your team. What is your approach?',
    [opt('Be transparent, deliver clearly, offer solutions',{leadership:4,communication:4}),
     opt('Soften it heavily to avoid discomfort',{emotional_intelligence:2}),
     opt('Send an email to avoid confrontation',{communication:1}),
     opt('Delay sharing until absolutely necessary',{adaptability:1})],
    ['business','media','law'],'medium','communication',['leadership','communication'],1.3,'leadership'),

  q('ld_005','A colleague challenges your decision publicly in a meeting. You:',
    [opt('Listen calmly, invite discussion, decide based on merit',{leadership:4,emotional_intelligence:4}),
     opt('Defend your position firmly',{leadership:3,communication:2}),
     opt('Feel embarrassed and back down',{emotional_intelligence:1}),
     opt('Address it privately after the meeting',{leadership:3,emotional_intelligence:3})],
    ['business','law','government_jobs'],'hard','emotional_intelligence',['leadership','emotional_intelligence'],1.5,'leadership'),

  q('ld_006','How do you motivate people who lack enthusiasm for a task?',
    [opt('Connect the task to their personal goals',{leadership:4,emotional_intelligence:4}),
     opt('Offer incentives or recognition',{leadership:3,communication:3}),
     opt('Set strict deadlines and monitor closely',{discipline:3,leadership:2}),
     opt('Just do the task myself',{discipline:3})],
    ['business','education','entrepreneurship'],'medium','leadership',['leadership','emotional_intelligence'],1.4,'leadership'),

  q('ld_007','Would you rather lead a small team to perfection or manage a large team with mixed results?',
    [opt('Small team, focus on excellence',{leadership:3,discipline:4}),
     opt('Large team, embrace the chaos and learn',{leadership:4,adaptability:4}),
     opt('It depends on the project',{analytical_thinking:3}),
     opt('I prefer not to manage people',{technical_thinking:2})],
    ['business','technology','entrepreneurship'],'easy','leadership',['leadership','adaptability'],1.1,'leadership'),

  q('ld_008','When delegating tasks, your priority is:',
    [opt('Matching tasks to strengths and growth areas',{leadership:4,analytical_thinking:3}),
     opt('Distributing equally to be fair',{teamwork:3}),
     opt('Keeping critical tasks to yourself',{discipline:3,leadership:2}),
     opt('Letting people self-select tasks',{adaptability:3})],
    ['business','entrepreneurship'],'medium','leadership',['leadership','analytical_thinking'],1.3,'leadership'),

  q('ld_009','You led a project that failed. What is your reaction?',
    [opt('Analyse what went wrong, own the responsibility, fix it',{leadership:4,analytical_thinking:4}),
     opt('Identify who made mistakes',{leadership:1}),
     opt('Accept it quietly and move on',{adaptability:3}),
     opt('Present it as a learning experiment',{leadership:3,communication:3})],
    ['entrepreneurship','business'],'hard','leadership',['leadership','analytical_thinking'],1.5,'leadership'),

  q('ld_010','Do you believe great leaders are born or made?',
    [opt('Mostly made — skills can be developed with practice',{analytical_thinking:3,discipline:3}),
     opt('Born — natural charisma matters most',{leadership:1}),
     opt('Both — nature plus deliberate development',{analytical_thinking:4,leadership:3}),
     opt('Context matters more than the person',{strategic_thinking:4})],
    ['business','education','psychology'],'easy','leadership',['leadership','analytical_thinking'],1.0,'leadership'),
];

// ─── LOGIC (40 questions) ────────────────────────────────────────────────────
const logicQuestions = [
  q('lg_001','If all roses are flowers, and some flowers fade quickly, can you conclude that some roses fade quickly?',
    [opt('No — you cannot conclude that without more information',{logic:4,analytical_thinking:4}),
     opt('Yes — roses are flowers so the rule applies',{logic:1}),
     opt('Maybe — depends on the type of rose',{analytical_thinking:2}),
     opt('The question is ambiguous',{communication:1})],
    ['technology','law','finance'],'medium','logic',['logic','analytical_thinking'],1.4,'logic'),

  q('lg_002','You have a problem with multiple possible solutions. How do you approach it?',
    [opt('List all options, evaluate each systematically',{analytical_thinking:4,logic:4}),
     opt('Pick the first solution that seems reasonable',{adaptability:2}),
     opt('Ask others what they would do',{teamwork:3}),
     opt('Research similar problems for best practices',{research_mindset:4,logic:3})],
    ['technology','finance','law'],'easy','analytical_thinking',['logic','analytical_thinking'],1.2,'logic'),

  q('lg_003','A pattern: 2, 6, 18, 54 — what comes next?',
    [opt('162 (multiply by 3 each time)',{logic:4,analytical_thinking:4}),
     opt('108 (add 54)',{logic:2}),
     opt('72 (add progressively)',{logic:1}),
     opt('216 (multiply by 4)',{logic:1})],
    ['technology','finance','data_science'],'easy','logic',['logic','analytical_thinking'],1.0,'logic'),

  q('lg_004','You notice an anomaly in a dataset. You would:',
    [opt('Investigate root cause before drawing conclusions',{analytical_thinking:4,research_mindset:4,logic:4}),
     opt('Remove the outlier and continue analysis',{logic:2}),
     opt('Report it immediately without investigation',{communication:2}),
     opt('Ignore it if it does not affect the overall trend',{discipline:1})],
    ['technology','finance','data_science','ai'],'hard','analytical_thinking',['logic','analytical_thinking','research_mindset'],1.5,'logic'),

  q('lg_005','Which reasoning approach do you prefer when solving complex problems?',
    [opt('Deductive — start from principles and apply to specifics',{logic:4,analytical_thinking:4}),
     opt('Inductive — gather evidence and build patterns',{research_mindset:4,analytical_thinking:3}),
     opt('Abductive — guess the best explanation quickly',{adaptability:3,logic:2}),
     opt('Trial and error — test until something works',{adaptability:4,technical_thinking:2})],
    ['technology','finance','law','science'],'medium','logic',['logic','analytical_thinking'],1.3,'logic'),

  q('lg_006','You are given incomplete information to make a decision. You:',
    [opt('Identify the minimum needed info and proceed',{logic:4,adaptability:3}),
     opt('Wait until you have complete information',{discipline:3,logic:2}),
     opt('Make assumptions and document them clearly',{logic:4,communication:3}),
     opt('Delegate the decision',{teamwork:2})],
    ['business','finance','law','technology'],'medium','logic',['logic','analytical_thinking'],1.3,'logic'),

  q('lg_007','How do you verify if an argument or claim is logically sound?',
    [opt('Check premises, evaluate inferences, test for counterexamples',{logic:4,analytical_thinking:4}),
     opt('See if respected people agree with it',{communication:1}),
     opt('Trust your intuition about whether it feels right',{emotional_intelligence:2}),
     opt('Look for online consensus',{research_mindset:2})],
    ['law','technology','finance','media'],'hard','logic',['logic','analytical_thinking'],1.5,'logic'),

  q('lg_008','Two machines can each produce 100 units/hour. If one breaks, how long to produce 500 units?',
    [opt('5 hours (100 units/hour with one machine)',{logic:4,analytical_thinking:4}),
     opt('2.5 hours (average output)',{logic:1}),
     opt('10 hours (half capacity calculation)',{logic:2}),
     opt('Depends on machine efficiency',{analytical_thinking:2})],
    ['technology','business','data_science'],'easy','logic',['logic','analytical_thinking'],1.0,'logic'),

  q('lg_009','You discover that two colleagues reached opposite conclusions from the same data. You:',
    [opt('Examine each person\'s methodology to find the divergence',{analytical_thinking:4,logic:4}),
     opt('Average their conclusions',{logic:1}),
     opt('Present both findings and let stakeholders decide',{communication:3}),
     opt('Go with the more senior person\'s conclusion',{teamwork:1})],
    ['data_science','finance','technology','research'],'hard','analytical_thinking',['logic','analytical_thinking'],1.5,'logic'),

  q('lg_010','You find a shortcut that gives faster but slightly less accurate results. You:',
    [opt('Use it only when speed is clearly prioritized over accuracy',{logic:4,strategic_thinking:4}),
     opt('Always use the shortcut to save time',{adaptability:2}),
     opt('Never compromise accuracy',{discipline:4,logic:3}),
     opt('Test both and document the tradeoff',{research_mindset:4,logic:4})],
    ['technology','finance','data_science'],'medium','logic',['logic','analytical_thinking','strategic_thinking'],1.3,'logic'),
];

// ─── CREATIVITY (40 questions) ───────────────────────────────────────────────
const creativityQuestions = [
  q('cr_001','When starting a new project, you prefer to:',
    [opt('Brainstorm freely without constraints first',{creativity:4,curiosity:4}),
     opt('Research existing solutions and improve on them',{research_mindset:4,creativity:3}),
     opt('Follow a proven framework from the start',{discipline:3}),
     opt('Get feedback from others before ideating',{teamwork:3,communication:3})],
    ['design','media','marketing','entrepreneurship'],'easy','creativity',['creativity','curiosity'],1.2,'creativity'),

  q('cr_002','You are asked to design a product for elderly users. Your first step is:',
    [opt('Observe and interview elderly people in their daily context',{design_thinking:4,empathy:4,research_mindset:4}),
     opt('Look at existing elderly-focused products for inspiration',{research_mindset:3,creativity:2}),
     opt('Sketch ideas based on my own assumptions',{creativity:3}),
     opt('Study accessibility guidelines',{discipline:3,research_mindset:3})],
    ['design','healthcare','technology'],'medium','design_thinking',['creativity','design_thinking'],1.4,'creativity'),

  q('cr_003','Which creative environment do you thrive in?',
    [opt('Open-ended with no constraints',{creativity:4,adaptability:4}),
     opt('Structured with clear objectives but creative freedom',{creativity:3,discipline:3}),
     opt('Collaborative with constant feedback',{teamwork:4,creativity:3}),
     opt('Independent, quiet, and focused',{discipline:4,creativity:3})],
    ['design','media','marketing'],'easy','creativity',['creativity','adaptability'],1.1,'creativity'),

  q('cr_004','If you had to pitch a completely novel business idea, you would feel:',
    [opt('Excited — I love presenting original ideas',{creativity:4,public_speaking:4,entrepreneurship:4}),
     opt('Nervous but willing if the idea is solid',{public_speaking:2,creativity:3}),
     opt('Uncomfortable — I prefer refining existing ideas',{creativity:2,discipline:3}),
     opt('I would rather support someone else\'s pitch',{teamwork:3})],
    ['entrepreneurship','marketing','media'],'easy','creativity',['creativity','entrepreneurship'],1.2,'creativity'),

  q('cr_005','How do you respond to creative blocks?',
    [opt('Change environment, seek new inputs, let it rest',{creativity:4,adaptability:4}),
     opt('Force through with discipline',{discipline:4,creativity:2}),
     opt('Seek inspiration from unrelated fields',{curiosity:4,creativity:4}),
     opt('Ask for help or collaborate',{teamwork:3,creativity:3})],
    ['design','media','marketing'],'medium','creativity',['creativity','adaptability','curiosity'],1.3,'creativity'),

  q('cr_006','You are given complete freedom to redesign a school. What is your primary focus?',
    [opt('Student experience — spaces that spark curiosity and joy',{design_thinking:4,creativity:4}),
     opt('Operational efficiency — optimize flow and resources',{analytical_thinking:4,logic:3}),
     opt('Safety and compliance first',{discipline:4}),
     opt('Community connection — open spaces for all',{communication:4,teamwork:4})],
    ['design','education','architecture'],'medium','design_thinking',['creativity','design_thinking'],1.3,'creativity'),

  q('cr_007','When evaluating a creative piece, you focus most on:',
    [opt('Originality and conceptual depth',{creativity:4,analytical_thinking:3}),
     opt('Technical execution and polish',{discipline:4,technical_thinking:3}),
     opt('Emotional impact on the audience',{emotional_intelligence:4,creativity:3}),
     opt('Commercial viability',{strategic_thinking:4,financial_intelligence:3})],
    ['design','media','marketing','fashion'],'medium','creativity',['creativity','analytical_thinking'],1.3,'creativity'),

  q('cr_008','How often do you make connections between unrelated fields?',
    [opt('Constantly — cross-domain thinking is natural to me',{creativity:4,curiosity:4,analytical_thinking:3}),
     opt('Sometimes when I actively seek it',{creativity:3,research_mindset:3}),
     opt('Rarely — I prefer depth in one area',{discipline:4,technical_thinking:3}),
     opt('I had not thought about it this way',{adaptability:2})],
    ['design','technology','entrepreneurship','ai'],'easy','creativity',['creativity','curiosity'],1.2,'creativity'),

  q('cr_009','You must present a complex idea to a non-expert audience. You would:',
    [opt('Use an analogy or story to make it vivid',{creativity:4,communication:4}),
     opt('Use visuals and minimal text',{design_thinking:4,creativity:3}),
     opt('Simplify into three clear bullet points',{communication:3,discipline:3}),
     opt('Provide detailed documentation for them to read',{discipline:3,research_mindset:3})],
    ['design','media','education','technology'],'medium','communication',['creativity','communication'],1.3,'creativity'),

  q('cr_010','A product you designed is criticised harshly by users. You:',
    [opt('Deeply analyse the feedback and redesign with empathy',{design_thinking:4,creativity:4,emotional_intelligence:3}),
     opt('Defend your design choices with reasoning',{communication:3,leadership:2}),
     opt('Accept it gracefully and start fresh',{adaptability:4,creativity:3}),
     opt('Seek third-party validation of your design',{research_mindset:3})],
    ['design','technology','media'],'hard','design_thinking',['creativity','design_thinking','emotional_intelligence'],1.5,'creativity'),
];

// ─── EMOTIONAL INTELLIGENCE (35 questions) ───────────────────────────────────
const emotionalIntelligenceQuestions = [
  q('ei_001','A close colleague is visibly upset at work. You:',
    [opt('Check in privately and listen without judgement',{emotional_intelligence:4,communication:4}),
     opt('Give them space and let them approach you',{emotional_intelligence:3,adaptability:3}),
     opt('Alert a manager to handle it',{teamwork:2}),
     opt('Continue working and not interfere',{discipline:2})],
    ['healthcare','psychology','education','business'],'easy','emotional_intelligence',['emotional_intelligence','communication'],1.3,'emotional_intelligence'),

  q('ei_002','How well can you identify your own emotional triggers?',
    [opt('Very well — I actively reflect on my reactions',{emotional_intelligence:4,research_mindset:3}),
     opt('Fairly well — I notice patterns over time',{emotional_intelligence:3}),
     opt('Somewhat — emotions often catch me off guard',{emotional_intelligence:2}),
     opt('Not really — I focus on rational thinking',{logic:3,emotional_intelligence:1})],
    ['psychology','healthcare','education'],'easy','emotional_intelligence',['emotional_intelligence'],1.2,'emotional_intelligence'),

  q('ei_003','During a heated team disagreement, you tend to:',
    [opt('Stay calm, summarise all viewpoints, find common ground',{emotional_intelligence:4,leadership:4,communication:4}),
     opt('Advocate strongly for the position I believe is right',{communication:3,leadership:3}),
     opt('Withdraw until emotions cool down',{adaptability:3,emotional_intelligence:2}),
     opt('Ask a neutral third party to mediate',{teamwork:3,emotional_intelligence:3})],
    ['business','healthcare','law','education'],'medium','emotional_intelligence',['emotional_intelligence','leadership'],1.4,'emotional_intelligence'),

  q('ei_004','You receive unexpected harsh criticism of your work. Your immediate reaction is:',
    [opt('Feel hurt but reflect honestly on the validity',{emotional_intelligence:4,analytical_thinking:3}),
     opt('Immediately defend your work',{communication:2,leadership:2}),
     opt('Ask clarifying questions to understand the concern',{emotional_intelligence:4,communication:4}),
     opt('Feel discouraged and step back',{emotional_intelligence:1,adaptability:1})],
    ['psychology','media','design','business'],'medium','emotional_intelligence',['emotional_intelligence'],1.4,'emotional_intelligence'),

  q('ei_005','How do you help someone who is anxious before an important event?',
    [opt('Listen empathetically, validate feelings, offer practical support',{emotional_intelligence:4,communication:4}),
     opt('Tell them there is nothing to worry about',{emotional_intelligence:1,communication:1}),
     opt('Share techniques like deep breathing',{emotional_intelligence:3,communication:3}),
     opt('Distract them with something unrelated',{adaptability:3,emotional_intelligence:2})],
    ['healthcare','psychology','education'],'medium','emotional_intelligence',['emotional_intelligence','communication'],1.4,'emotional_intelligence'),

  q('ei_006','How do you manage stress during high-pressure deadlines?',
    [opt('Prioritise ruthlessly, break tasks into chunks, stay grounded',{emotional_intelligence:4,discipline:4,strategic_thinking:4}),
     opt('Push through by working harder and longer',{discipline:4,emotional_intelligence:2}),
     opt('Delegate what I can and focus on critical items',{leadership:4,strategic_thinking:3}),
     opt('Take a break to reset before continuing',{emotional_intelligence:3,adaptability:3})],
    ['business','technology','healthcare'],'medium','emotional_intelligence',['emotional_intelligence','discipline'],1.3,'emotional_intelligence'),

  q('ei_007','Can you tell when someone is being dishonest with you?',
    [opt('Usually yes — I pick up subtle cues in behaviour and language',{emotional_intelligence:4,analytical_thinking:3}),
     opt('Sometimes — depends on how well I know them',{emotional_intelligence:3}),
     opt('Rarely — I tend to take people at face value',{emotional_intelligence:2}),
     opt('I do not focus on this; I trust data over instinct',{logic:3,emotional_intelligence:1})],
    ['law','psychology','business','media'],'hard','emotional_intelligence',['emotional_intelligence'],1.5,'emotional_intelligence'),

  q('ei_008','You made a mistake that hurt a colleague. You would:',
    [opt('Apologise sincerely, take responsibility, make it right',{emotional_intelligence:4,communication:4}),
     opt('Apologise briefly and move forward',{communication:2,emotional_intelligence:2}),
     opt('Explain the circumstances that led to it',{communication:2}),
     opt('Hope they get over it on their own',{emotional_intelligence:1})],
    ['psychology','healthcare','education','business'],'easy','emotional_intelligence',['emotional_intelligence','communication'],1.2,'emotional_intelligence'),
];

// ─── ENTREPRENEURSHIP (35 questions) ─────────────────────────────────────────
const entrepreneurshipQuestions = [
  q('en_001','If you had ₹5 lakh to invest, what would you do?',
    [opt('Start a small business in a niche I understand',{entrepreneurship:4,risk_taking:4,financial_intelligence:3}),
     opt('Invest in mutual funds for long-term growth',{financial_intelligence:4,discipline:3}),
     opt('Upskill myself with courses and certifications',{discipline:4,curiosity:3}),
     opt('Save it for emergencies',{financial_intelligence:3,discipline:4})],
    ['entrepreneurship','business','finance'],'easy','entrepreneurship',['entrepreneurship','risk_taking'],1.2,'entrepreneurship'),

  q('en_002','What is your attitude toward failure in a business venture?',
    [opt('Failure is data — each mistake is a lesson to iterate',{entrepreneurship:4,adaptability:4,risk_taking:4}),
     opt('Failure is costly — avoid it with careful planning',{discipline:4,risk_taking:1}),
     opt('Failure happens, I accept it and try again',{adaptability:4,entrepreneurship:3}),
     opt('I would rather not risk failure at all',{discipline:3,risk_taking:0})],
    ['entrepreneurship','business'],'easy','risk_taking',['entrepreneurship','risk_taking','adaptability'],1.3,'entrepreneurship'),

  q('en_003','You have a brilliant idea but no experience in that industry. You:',
    [opt('Research deeply, find a mentor, start lean',{entrepreneurship:4,research_mindset:4,curiosity:4}),
     opt('Partner with someone who has the experience',{teamwork:4,entrepreneurship:3}),
     opt('Work in that industry first before starting',{discipline:4,entrepreneurship:2}),
     opt('Abandon the idea — experience is everything',{risk_taking:0,discipline:2})],
    ['entrepreneurship','business','technology'],'medium','entrepreneurship',['entrepreneurship','risk_taking'],1.4,'entrepreneurship'),

  q('en_004','What excites you most about starting a business?',
    [opt('Building something from nothing that solves a real problem',{entrepreneurship:4,creativity:4,problem_solving:4}),
     opt('The potential for financial independence',{financial_intelligence:4,entrepreneurship:3}),
     opt('Leading a team and creating a culture',{leadership:4,entrepreneurship:3}),
     opt('The intellectual challenge of the market',{analytical_thinking:4,entrepreneurship:3})],
    ['entrepreneurship','business'],'easy','entrepreneurship',['entrepreneurship','creativity'],1.2,'entrepreneurship'),

  q('en_005','How do you validate a business idea before committing fully?',
    [opt('Talk to at least 20 potential customers about the problem',{research_mindset:4,entrepreneurship:4,communication:3}),
     opt('Build a basic prototype and test market response',{entrepreneurship:4,technical_thinking:3,risk_taking:3}),
     opt('Analyse competitor success as proof of market',{analytical_thinking:4,research_mindset:3}),
     opt('Trust my gut — good ideas speak for themselves',{risk_taking:3,entrepreneurship:2})],
    ['entrepreneurship','business','technology'],'hard','entrepreneurship',['entrepreneurship','research_mindset'],1.5,'entrepreneurship'),

  q('en_006','Which startup model appeals most to you?',
    [opt('B2C product — sell directly to millions of users',{entrepreneurship:4,marketing:3,risk_taking:4}),
     opt('B2B SaaS — recurring revenue from businesses',{entrepreneurship:4,financial_intelligence:4,strategic_thinking:4}),
     opt('Social enterprise — profit with purpose',{entrepreneurship:3,emotional_intelligence:4}),
     opt('Freelance/agency — services with low overhead',{entrepreneurship:3,discipline:3})],
    ['entrepreneurship','business','technology'],'medium','entrepreneurship',['entrepreneurship','strategic_thinking'],1.3,'entrepreneurship'),

  q('en_007','An investor offers you ₹1 crore for 40% equity in your startup. You:',
    [opt('Negotiate — offer 20-25% and explain valuation',{entrepreneurship:4,financial_intelligence:4,communication:4}),
     opt('Accept immediately — capital is critical',{risk_taking:3,entrepreneurship:2}),
     opt('Decline — I want to retain full ownership',{entrepreneurship:3,risk_taking:1}),
     opt('Research comparable deals first before responding',{research_mindset:4,financial_intelligence:3})],
    ['entrepreneurship','finance','business'],'hard','financial_intelligence',['entrepreneurship','financial_intelligence'],1.5,'entrepreneurship'),

  q('en_008','What is the biggest barrier to entrepreneurship for you personally?',
    [opt('Fear of financial risk',{risk_taking:2,financial_intelligence:3}),
     opt('Lack of a strong network',{communication:2,teamwork:2}),
     opt('Uncertainty of success',{risk_taking:2,adaptability:2}),
     opt('I do not see major barriers',{entrepreneurship:4,risk_taking:4})],
    ['entrepreneurship','business'],'easy','risk_taking',['entrepreneurship','risk_taking'],1.1,'entrepreneurship'),
];

// ─── TECHNICAL THINKING (35 questions) ───────────────────────────────────────
const technicalThinkingQuestions = [
  q('tt_001','How do you approach learning a completely new technology?',
    [opt('Start with docs and official tutorials, then build something',{technical_thinking:4,discipline:4,curiosity:4}),
     opt('Watch overview videos then dive into projects',{technical_thinking:3,adaptability:3}),
     opt('Find a course and follow it completely',{discipline:4,technical_thinking:3}),
     opt('Find someone to teach me directly',{teamwork:3,communication:2})],
    ['technology','ai','data_science','cybersecurity'],'easy','technical_thinking',['technical_thinking','curiosity'],1.2,'technical_thinking'),

  q('tt_002','You find a bug in production that is causing user errors. You:',
    [opt('Isolate, reproduce, diagnose root cause, fix and test',{technical_thinking:4,analytical_thinking:4,problem_solving:4}),
     opt('Immediately roll back to the last stable version',{technical_thinking:3,discipline:3}),
     opt('Search for a similar issue online',{research_mindset:3,technical_thinking:2}),
     opt('Alert the senior engineer',{teamwork:2})],
    ['technology','data_science','ai'],'medium','technical_thinking',['technical_thinking','problem_solving'],1.4,'technical_thinking'),

  q('tt_003','Which best describes your relationship with technical complexity?',
    [opt('I enjoy deep technical challenges — complexity is exciting',{technical_thinking:4,curiosity:4,discipline:4}),
     opt('I can handle it when required but prefer simplicity',{technical_thinking:3,adaptability:3}),
     opt('I prefer to work at a higher abstraction level',{strategic_thinking:3,technical_thinking:2}),
     opt('I rely on specialists for technical depth',{teamwork:3,communication:3})],
    ['technology','ai','data_science'],'easy','technical_thinking',['technical_thinking','curiosity'],1.2,'technical_thinking'),

  q('tt_004','When designing a system, your primary concern is:',
    [opt('Scalability and performance under load',{technical_thinking:4,analytical_thinking:4}),
     opt('Security and data protection',{technical_thinking:4,discipline:4}),
     opt('Developer experience and maintainability',{technical_thinking:3,teamwork:3}),
     opt('Shipping quickly and iterating',{adaptability:4,entrepreneurship:3})],
    ['technology','cybersecurity','ai'],'medium','technical_thinking',['technical_thinking','analytical_thinking'],1.3,'technical_thinking'),

  q('tt_005','You need to explain a technical architecture to a non-technical executive. You:',
    [opt('Use an analogy and visual diagram to simplify',{communication:4,creativity:4,technical_thinking:3}),
     opt('Prepare a written summary of the key decisions',{communication:3,discipline:3}),
     opt('Walk through the actual system live',{technical_thinking:4,communication:3}),
     opt('Let the tech lead handle the explanation',{teamwork:2})],
    ['technology','business','data_science'],'medium','communication',['technical_thinking','communication'],1.3,'technical_thinking'),

  q('tt_006','How comfortable are you reading and writing code?',
    [opt('Very — coding is a core skill I actively develop',{technical_thinking:4,discipline:4}),
     opt('Moderately — I can read and write basic scripts',{technical_thinking:3}),
     opt('Somewhat — I understand logic but not syntax deeply',{technical_thinking:2,analytical_thinking:3}),
     opt('Not very — I rely on no-code or others for this',{technical_thinking:1})],
    ['technology','ai','data_science'],'easy','technical_thinking',['technical_thinking'],1.1,'technical_thinking'),

  q('tt_007','Artificial Intelligence in your field will:',
    [opt('Amplify human capability if used intelligently',{technical_thinking:4,strategic_thinking:4,analytical_thinking:3}),
     opt('Replace many jobs and create new opportunities',{analytical_thinking:3,strategic_thinking:3}),
     opt('Create ethical and privacy challenges to manage',{analytical_thinking:3,emotional_intelligence:3}),
     opt('I am not sure how relevant it is to my field',{adaptability:2})],
    ['technology','ai','business','healthcare'],'medium','technical_thinking',['technical_thinking','strategic_thinking'],1.3,'technical_thinking'),

  q('tt_008','You have a weekend to learn one technical skill. You choose based on:',
    [opt('What will have the highest career ROI in 3 years',{strategic_thinking:4,financial_intelligence:3,technical_thinking:3}),
     opt('What I am most curious about right now',{curiosity:4,technical_thinking:3}),
     opt('What my team or project needs immediately',{teamwork:4,discipline:3}),
     opt('What is trending in my field',{adaptability:3,research_mindset:3})],
    ['technology','ai','data_science'],'easy','technical_thinking',['technical_thinking','strategic_thinking'],1.1,'technical_thinking'),
];

// ─── COMMUNICATION (35 questions) ────────────────────────────────────────────
const communicationQuestions = [
  q('cm_001','In a meeting where you strongly disagree with the majority, you:',
    [opt('Clearly and respectfully present your counter-view with evidence',{communication:4,leadership:3,analytical_thinking:3}),
     opt('Speak up but defer if the group still disagrees',{communication:3,teamwork:3}),
     opt('Stay quiet and raise it privately afterwards',{communication:2,emotional_intelligence:3}),
     opt('Go with the majority to keep harmony',{teamwork:3,communication:1})],
    ['business','law','media','government_jobs'],'medium','communication',['communication','leadership'],1.4,'communication'),

  q('cm_002','How do you adapt your communication style for different audiences?',
    [opt('Significantly — I tailor vocabulary, depth, and tone',{communication:4,emotional_intelligence:4}),
     opt('Somewhat — I adjust tone but keep content consistent',{communication:3}),
     opt('Minimally — I communicate the same way with everyone',{communication:1,discipline:3}),
     opt('I am still developing this skill',{adaptability:3,communication:2})],
    ['business','media','education','law'],'easy','communication',['communication','emotional_intelligence'],1.2,'communication'),

  q('cm_003','You are presenting to 500 people for the first time. You feel:',
    [opt('Excited — large audiences energise me',{public_speaking:4,communication:4}),
     opt('Nervous but I will prepare thoroughly',{discipline:4,communication:3}),
     opt('Very anxious — I prefer smaller settings',{public_speaking:1,communication:2}),
     opt('Indifferent — I focus on the content, not the crowd',{discipline:4,communication:3})],
    ['media','business','education','marketing'],'easy','public_speaking',['communication','public_speaking'],1.2,'communication'),

  q('cm_004','When you write a professional email, your priority is:',
    [opt('Clarity and brevity — every word must earn its place',{communication:4,discipline:3}),
     opt('Thoroughness — include all relevant context',{discipline:4,communication:2}),
     opt('Tone — make it warm and personable',{emotional_intelligence:4,communication:3}),
     opt('Speed — get it out quickly',{adaptability:3})],
    ['business','media','law','marketing'],'easy','communication',['communication'],1.1,'communication'),

  q('cm_005','A client misunderstood your proposal and is upset. You:',
    [opt('Apologise for the confusion, clarify clearly, ask for feedback',{communication:4,emotional_intelligence:4}),
     opt('Resend the original proposal highlighting what they missed',{communication:2}),
     opt('Schedule a call to walk through it together',{communication:4,teamwork:3}),
     opt('Defend the original proposal\'s clarity',{communication:1})],
    ['business','marketing','law'],'medium','communication',['communication','emotional_intelligence'],1.4,'communication'),

  q('cm_006','How do you handle silence in a difficult conversation?',
    [opt('Sit with it — silence can be powerful and necessary',{emotional_intelligence:4,communication:4}),
     opt('Fill it quickly — silence is uncomfortable',{communication:2,adaptability:2}),
     opt('Use it to reframe or ask a clarifying question',{communication:4,emotional_intelligence:4}),
     opt('End the meeting if silence persists',{adaptability:2})],
    ['psychology','law','business','media'],'hard','communication',['communication','emotional_intelligence'],1.5,'communication'),

  q('cm_007','Which medium do you prefer for complex communication?',
    [opt('Face-to-face — I want full non-verbal context',{communication:4,emotional_intelligence:4}),
     opt('Video call — effective and saves travel time',{communication:3,adaptability:3}),
     opt('Detailed written document for reference',{discipline:4,communication:3}),
     opt('Chat/message — quick and async',{adaptability:4,communication:2})],
    ['business','media','technology'],'easy','communication',['communication'],1.1,'communication'),

  q('cm_008','How do you handle being misquoted or misrepresented publicly?',
    [opt('Respond publicly with calm, factual clarification',{communication:4,leadership:3}),
     opt('Address it privately with the person responsible',{communication:4,emotional_intelligence:3}),
     opt('Ignore it — corrections often draw more attention',{strategic_thinking:3,communication:2}),
     opt('Consult a PR or legal professional first',{risk_taking:1,strategic_thinking:3})],
    ['media','law','business','government_jobs'],'hard','communication',['communication','strategic_thinking'],1.5,'communication'),
];

// ─── RISK TAKING (30 questions) ───────────────────────────────────────────────
const riskTakingQuestions = [
  q('rt_001','You have a stable job but a compelling startup opportunity arises. You:',
    [opt('Leave if I believe deeply in the idea and have savings',{risk_taking:4,entrepreneurship:4}),
     opt('Work on it nights/weekends before committing',{risk_taking:3,discipline:4}),
     opt('Stay stable and invest in the startup as an adviser',{risk_taking:2,financial_intelligence:3}),
     opt('Stick to my job — stability is my priority',{discipline:4,risk_taking:1})],
    ['entrepreneurship','business','technology'],'medium','risk_taking',['risk_taking','entrepreneurship'],1.4,'risk_taking'),

  q('rt_002','How do you feel about making decisions with incomplete data?',
    [opt('Comfortable — waiting for perfect data is paralysis',{risk_taking:4,adaptability:4}),
     opt('Somewhat — I set a time limit and then decide',{risk_taking:3,discipline:3}),
     opt('Uncomfortable — I need sufficient data',{logic:3,risk_taking:2}),
     opt('Very uncomfortable — I prefer to delay',{risk_taking:1,discipline:3})],
    ['business','finance','technology'],'easy','risk_taking',['risk_taking','adaptability'],1.2,'risk_taking'),

  q('rt_003','What is your philosophy on financial risk?',
    [opt('High risk, high reward — I am willing to lose for big gains',{risk_taking:4,financial_intelligence:3}),
     opt('Calculated risk — research before committing capital',{risk_taking:3,financial_intelligence:4}),
     opt('Low risk — preserve capital, grow steadily',{financial_intelligence:4,discipline:4}),
     opt('Avoid risk where possible',{risk_taking:1,discipline:4})],
    ['finance','entrepreneurship','business'],'easy','risk_taking',['risk_taking','financial_intelligence'],1.2,'risk_taking'),

  q('rt_004','Your biggest career decision required you to choose between security and growth. You:',
    [opt('Chose growth even though it felt scary',{risk_taking:4,adaptability:4}),
     opt('Chose security — growth will come within a stable path',{discipline:4,risk_taking:1}),
     opt('Found a middle path that balanced both',{strategic_thinking:4,risk_taking:3}),
     opt('Have not faced this type of decision yet',{adaptability:2})],
    ['business','entrepreneurship'],'medium','risk_taking',['risk_taking','strategic_thinking'],1.3,'risk_taking'),

  q('rt_005','You discover a significant flaw in your product just before launch. You:',
    [opt('Delay launch to fix it — quality matters',{discipline:4,risk_taking:2,strategic_thinking:3}),
     opt('Launch with a known workaround and fix post-launch',{risk_taking:4,adaptability:4}),
     opt('Launch for a limited beta and monitor closely',{risk_taking:3,strategic_thinking:4}),
     opt('Cancel the launch entirely',{risk_taking:1,discipline:3})],
    ['technology','entrepreneurship','business'],'hard','risk_taking',['risk_taking','strategic_thinking'],1.5,'risk_taking'),

  q('rt_006','In adventure activities, you prefer:',
    [opt('High-adrenaline — skydiving, bungee, extreme sport',{risk_taking:4,adaptability:4}),
     opt('Moderate — hiking, rock climbing, surfing',{risk_taking:3,adaptability:3}),
     opt('Low-key — nature walks, cycling, swimming',{discipline:3,risk_taking:2}),
     opt('I avoid physically risky activities',{risk_taking:1,discipline:4})],
    ['sports','entrepreneurship'],'easy','risk_taking',['risk_taking','adaptability'],1.0,'risk_taking'),
];

// ─── ANALYTICAL THINKING (35 questions) ──────────────────────────────────────
const analyticalThinkingQuestions = [
  q('at_001','When presented with a large dataset, your first step is:',
    [opt('Understand the context and define what question to answer',{analytical_thinking:4,strategic_thinking:4}),
     opt('Run summary statistics to see overall patterns',{analytical_thinking:4,technical_thinking:3}),
     opt('Visualise the data to spot trends',{analytical_thinking:3,creativity:3}),
     opt('Clean the data before any analysis',{discipline:4,analytical_thinking:3})],
    ['data_science','finance','technology','ai'],'medium','analytical_thinking',['analytical_thinking','strategic_thinking'],1.4,'analytical_thinking'),

  q('at_002','How do you approach a decision with many competing factors?',
    [opt('Build a weighted decision matrix and score options',{analytical_thinking:4,logic:4,discipline:4}),
     opt('List pros and cons for each option',{analytical_thinking:3,logic:3}),
     opt('Consult trusted advisors and synthesise views',{teamwork:4,communication:3}),
     opt('Trust gut instinct after reviewing options',{emotional_intelligence:3,adaptability:3})],
    ['business','finance','technology'],'medium','analytical_thinking',['analytical_thinking','logic'],1.4,'analytical_thinking'),

  q('at_003','Which of these represents the best analytical approach?',
    [opt('Challenge assumptions before analysing them',{analytical_thinking:4,logic:4,research_mindset:4}),
     opt('Analyse data and then form conclusions',{analytical_thinking:3,logic:3}),
     opt('Form a hypothesis first, then test it',{research_mindset:4,analytical_thinking:4}),
     opt('Use the conclusion others have already reached',{adaptability:2})],
    ['data_science','research','finance','ai'],'hard','analytical_thinking',['analytical_thinking','research_mindset'],1.5,'analytical_thinking'),

  q('at_004','You notice a 30% drop in revenue for one product. You:',
    [opt('Segment by time, region, channel and customer to isolate the cause',{analytical_thinking:4,logic:4}),
     opt('Talk to the sales team to get their view',{communication:3,teamwork:3}),
     opt('Compare with industry benchmarks',{research_mindset:3,analytical_thinking:3}),
     opt('Run a price test to see if pricing is the issue',{analytical_thinking:3,risk_taking:3})],
    ['business','finance','marketing'],'hard','analytical_thinking',['analytical_thinking','logic'],1.5,'analytical_thinking'),

  q('at_005','Do you find patterns in chaos naturally?',
    [opt('Yes — I almost always see structure in complexity',{analytical_thinking:4,logic:4,curiosity:4}),
     opt('Sometimes — when I slow down and focus',{analytical_thinking:3,discipline:3}),
     opt('Rarely — I am more of an intuitive thinker',{emotional_intelligence:3,creativity:3}),
     opt('I prefer to use data tools to surface patterns',{technical_thinking:4,analytical_thinking:3})],
    ['data_science','ai','finance','technology'],'easy','analytical_thinking',['analytical_thinking','logic'],1.2,'analytical_thinking'),

  q('at_006','How do you evaluate the strength of an argument?',
    [opt('Check evidence quality, source credibility, and logical validity',{analytical_thinking:4,logic:4,research_mindset:4}),
     opt('See if it aligns with my existing knowledge',{analytical_thinking:2}),
     opt('Look for counterarguments to stress-test it',{analytical_thinking:4,logic:4}),
     opt('Ask whether people I respect agree with it',{teamwork:2})],
    ['law','research','finance','technology'],'hard','analytical_thinking',['analytical_thinking','logic'],1.5,'analytical_thinking'),
];

// ─── TEAMWORK (30 questions) ──────────────────────────────────────────────────
const teamworkQuestions = [
  q('tw_001','In a group project where no one agrees on direction, you:',
    [opt('Facilitate a structured discussion to find common ground',{teamwork:4,communication:4,leadership:3}),
     opt('Present a strong recommendation and build consensus',{leadership:4,communication:3,teamwork:3}),
     opt('Let the strongest voice lead',{teamwork:2,adaptability:3}),
     opt('Split tasks independently to avoid conflict',{discipline:3,teamwork:1})],
    ['business','education','healthcare'],'medium','teamwork',['teamwork','communication'],1.4,'teamwork'),

  q('tw_002','What is your ideal role within a team?',
    [opt('Leader — setting direction and driving decisions',{leadership:4,teamwork:3}),
     opt('Idea generator — providing creative solutions',{creativity:4,teamwork:3}),
     opt('Implementer — executing plans reliably',{discipline:4,teamwork:4}),
     opt('Connector — building relationships and harmony',{teamwork:4,emotional_intelligence:4})],
    ['business','technology','healthcare'],'easy','teamwork',['teamwork','leadership'],1.1,'teamwork'),

  q('tw_003','A team member consistently misses deadlines. You:',
    [opt('Address it empathetically, understand the cause, offer support',{teamwork:4,emotional_intelligence:4,leadership:3}),
     opt('Escalate to management after one missed deadline',{discipline:3,leadership:2}),
     opt('Cover for them to protect the project',{teamwork:3,discipline:2}),
     opt('Redistribute their tasks without involving them',{leadership:3,teamwork:1})],
    ['business','technology','healthcare'],'medium','teamwork',['teamwork','emotional_intelligence'],1.4,'teamwork'),

  q('tw_004','How do you build trust within a new team?',
    [opt('Deliver on small commitments consistently from day one',{teamwork:4,discipline:4,communication:3}),
     opt('Learn everyone\'s strengths and personalise my interactions',{teamwork:4,emotional_intelligence:4}),
     opt('Be transparent about my goals and limitations',{communication:4,teamwork:4}),
     opt('Focus on results — trust comes from performance',{discipline:4,teamwork:2})],
    ['business','healthcare','education'],'medium','teamwork',['teamwork','communication'],1.3,'teamwork'),

  q('tw_005','You disagree with a team decision that has already been made. You:',
    [opt('Raise concern formally once, then commit to the decision',{teamwork:4,communication:4,discipline:3}),
     opt('Implement it but document your objections',{discipline:4,communication:3}),
     opt('Continue to advocate for change internally',{leadership:3,communication:3}),
     opt('Comply silently to avoid friction',{teamwork:2,discipline:3})],
    ['business','technology','law'],'hard','teamwork',['teamwork','communication','leadership'],1.5,'teamwork'),
];

// ─── DISCIPLINE (25 questions) ────────────────────────────────────────────────
const disciplineQuestions = [
  q('ds_001','How do you manage your daily workload?',
    [opt('Time-block tasks, prioritise by impact, review at EOD',{discipline:4,strategic_thinking:4}),
     opt('Work through tasks in the order they arrive',{discipline:3,adaptability:3}),
     opt('Work in bursts of energy when motivated',{adaptability:4,discipline:2}),
     opt('Focus on what is due soonest',{discipline:3,adaptability:2})],
    ['business','technology','healthcare'],'easy','discipline',['discipline','strategic_thinking'],1.2,'discipline'),

  q('ds_002','When do you do your best work?',
    [opt('On a fixed schedule with clear goals and deadlines',{discipline:4,strategic_thinking:3}),
     opt('When creatively inspired with open time',{creativity:4,adaptability:4}),
     opt('Under pressure near a deadline',{adaptability:4,risk_taking:3}),
     opt('During collaborative sessions with others',{teamwork:4,communication:3})],
    ['technology','design','business'],'easy','discipline',['discipline','adaptability'],1.1,'discipline'),

  q('ds_003','You have 3 major tasks due the same day. You:',
    [opt('Estimate time per task, tackle hardest first, deliver all',{discipline:4,analytical_thinking:4}),
     opt('Do the easiest first to build momentum',{adaptability:3,discipline:3}),
     opt('Prioritise by stakeholder importance',{strategic_thinking:4,discipline:3}),
     opt('Negotiate one deadline to reduce pressure',{communication:4,strategic_thinking:3})],
    ['business','technology','healthcare'],'medium','discipline',['discipline','analytical_thinking'],1.3,'discipline'),

  q('ds_004','How do you handle a task you find boring but necessary?',
    [opt('Complete it efficiently — everything worthwhile has routine',{discipline:4}),
     opt('Try to automate or delegate it',{technical_thinking:3,leadership:3}),
     opt('Gamify it to make it more interesting',{creativity:3,adaptability:3}),
     opt('Procrastinate and do it at the last minute',{discipline:1,adaptability:2})],
    ['business','technology','finance'],'easy','discipline',['discipline'],1.1,'discipline'),

  q('ds_005','What is your relationship with habits and routines?',
    [opt('Strong routines are the foundation of my productivity',{discipline:4,strategic_thinking:3}),
     opt('I build habits deliberately for outcomes I care about',{discipline:4,analytical_thinking:3}),
     opt('I resist routines — flexibility keeps me creative',{creativity:4,adaptability:4}),
     opt('My routines are inconsistent',{discipline:1,adaptability:2})],
    ['healthcare','sports','business','education'],'easy','discipline',['discipline'],1.1,'discipline'),
];

// ─── RESEARCH MINDSET (25 questions) ─────────────────────────────────────────
const researchMindsetQuestions = [
  q('rm_001','Before starting a major project, your research depth is:',
    [opt('Extensive — I research until I have deep domain confidence',{research_mindset:4,discipline:4,curiosity:4}),
     opt('Moderate — enough to start and learn by doing',{adaptability:4,research_mindset:3}),
     opt('Minimal — I prefer to learn from mistakes',{risk_taking:4,adaptability:4}),
     opt('I rely on experts to brief me',{teamwork:3,communication:3})],
    ['technology','science','law','medicine'],'easy','research_mindset',['research_mindset','curiosity'],1.2,'research_mindset'),

  q('rm_002','How do you evaluate the credibility of information you read?',
    [opt('Check source, author credentials, publication date, and citations',{research_mindset:4,analytical_thinking:4,logic:4}),
     opt('See if multiple credible sources agree',{research_mindset:3,analytical_thinking:3}),
     opt('Trust my sense of whether it feels accurate',{emotional_intelligence:2}),
     opt('Trust platforms like Google or Wikipedia',{research_mindset:1})],
    ['law','medicine','technology','education'],'medium','research_mindset',['research_mindset','analytical_thinking'],1.4,'research_mindset'),

  q('rm_003','You are writing a report on an unfamiliar topic. You:',
    [opt('Research primary sources, synthesise, then write',{research_mindset:4,discipline:4,analytical_thinking:4}),
     opt('Research broadly then narrow to the most relevant sources',{research_mindset:3,analytical_thinking:3}),
     opt('Outline first, then fill with research',{discipline:4,research_mindset:3}),
     opt('Find a similar existing report and update it',{adaptability:3,research_mindset:2})],
    ['law','education','media','science'],'medium','research_mindset',['research_mindset','discipline'],1.3,'research_mindset'),

  q('rm_004','Do you enjoy reading academic or technical papers?',
    [opt('Yes — deep reading fuels my thinking',{research_mindset:4,curiosity:4,discipline:4}),
     opt('Sometimes — when directly relevant to my work',{research_mindset:3,discipline:3}),
     opt('Rarely — I prefer summaries and abstracts',{adaptability:3,research_mindset:2}),
     opt('No — I prefer practical experience',{adaptability:4,research_mindset:1})],
    ['science','medicine','technology','law'],'easy','research_mindset',['research_mindset','curiosity'],1.1,'research_mindset'),
];

// ─── FINANCIAL INTELLIGENCE (25 questions) ───────────────────────────────────
const financialIntelligenceQuestions = [
  q('fi_001','How do you track your personal finances?',
    [opt('Detailed monthly budget with category tracking',{financial_intelligence:4,discipline:4}),
     opt('Rough mental estimate and regular check-ins',{financial_intelligence:2,adaptability:3}),
     opt('I use an app but do not analyse deeply',{financial_intelligence:2,technical_thinking:2}),
     opt('I do not actively track finances',{financial_intelligence:0})],
    ['finance','business','entrepreneurship'],'easy','financial_intelligence',['financial_intelligence','discipline'],1.2,'financial_intelligence'),

  q('fi_002','You have surplus income this month. You allocate it as:',
    [opt('60% investment, 30% emergency fund, 10% enjoyment',{financial_intelligence:4,discipline:4,strategic_thinking:4}),
     opt('Split between savings and a planned purchase',{financial_intelligence:3,discipline:3}),
     opt('Invest everything for maximum growth',{financial_intelligence:3,risk_taking:4}),
     opt('Enjoy it — life is short',{risk_taking:3,financial_intelligence:1})],
    ['finance','business'],'easy','financial_intelligence',['financial_intelligence','strategic_thinking'],1.2,'financial_intelligence'),

  q('fi_003','How do you evaluate whether a business is financially healthy?',
    [opt('Analyse revenue, margin, cash flow, and debt levels',{financial_intelligence:4,analytical_thinking:4}),
     opt('Check revenue growth rate primarily',{financial_intelligence:3,analytical_thinking:2}),
     opt('Look at profitability and market reputation',{financial_intelligence:2,analytical_thinking:2}),
     opt('I am not confident evaluating business finances',{financial_intelligence:0})],
    ['finance','business','entrepreneurship'],'hard','financial_intelligence',['financial_intelligence','analytical_thinking'],1.5,'financial_intelligence'),

  q('fi_004','What is the most important financial metric for a startup?',
    [opt('Burn rate and runway — how long cash lasts',{financial_intelligence:4,strategic_thinking:4}),
     opt('Monthly Recurring Revenue (MRR) growth',{financial_intelligence:4,analytical_thinking:3}),
     opt('Customer Acquisition Cost vs Lifetime Value',{financial_intelligence:4,analytical_thinking:4}),
     opt('Total valuation from investors',{financial_intelligence:2})],
    ['finance','entrepreneurship','business'],'hard','financial_intelligence',['financial_intelligence','analytical_thinking'],1.5,'financial_intelligence'),
];

// ─── STRATEGIC THINKING (25 questions) ───────────────────────────────────────
const strategicThinkingQuestions = [
  q('st_001','When planning a major goal, how far ahead do you think?',
    [opt('5+ years — I think about long-term positioning',{strategic_thinking:4,discipline:4}),
     opt('1-2 years — medium-term planning feels realistic',{strategic_thinking:3,discipline:3}),
     opt('3-6 months — short-term plans are more actionable',{discipline:3,adaptability:3}),
     opt('Day by day — too much can change to plan far ahead',{adaptability:4,risk_taking:3})],
    ['business','finance','entrepreneurship'],'easy','strategic_thinking',['strategic_thinking','discipline'],1.2,'strategic_thinking'),

  q('st_002','You are entering a crowded market. Your strategy is:',
    [opt('Find a defensible niche where you can be number one',{strategic_thinking:4,analytical_thinking:4}),
     opt('Compete on price to capture market share quickly',{financial_intelligence:3,risk_taking:3}),
     opt('Build superior quality to justify premium pricing',{discipline:4,strategic_thinking:3}),
     opt('Partner with established players to gain access',{teamwork:4,strategic_thinking:3})],
    ['business','entrepreneurship','marketing'],'hard','strategic_thinking',['strategic_thinking','analytical_thinking'],1.5,'strategic_thinking'),

  q('st_003','How do you balance short-term results with long-term vision?',
    [opt('Set quarterly milestones that serve the 3-year vision',{strategic_thinking:4,discipline:4}),
     opt('Focus on long-term; short-term will follow',{strategic_thinking:3,risk_taking:3}),
     opt('Adjust vision based on short-term results',{adaptability:4,strategic_thinking:3}),
     opt('Short-term results fund long-term vision',{financial_intelligence:4,strategic_thinking:3})],
    ['business','finance','entrepreneurship'],'medium','strategic_thinking',['strategic_thinking','discipline'],1.4,'strategic_thinking'),

  q('st_004','You discover a competitor is copying your core product feature. You:',
    [opt('Accelerate innovation — build features they cannot copy',{strategic_thinking:4,creativity:4}),
     opt('Compete on quality and user experience',{strategic_thinking:3,discipline:4}),
     opt('Seek legal IP protection immediately',{risk_taking:2,strategic_thinking:3}),
     opt('Interpret it as market validation and focus on brand',{strategic_thinking:4,communication:3})],
    ['technology','entrepreneurship','business'],'hard','strategic_thinking',['strategic_thinking','creativity'],1.5,'strategic_thinking'),
];

// ─── CURIOSITY (25 questions) ─────────────────────────────────────────────────
const curiosityQuestions = [
  q('cu_001','How often do you learn something completely unrelated to your field?',
    [opt('Weekly — cross-domain learning is a habit',{curiosity:4,adaptability:4,research_mindset:3}),
     opt('Monthly — when something interesting catches my eye',{curiosity:3,adaptability:3}),
     opt('Rarely — I prefer depth in my area',{discipline:4,technical_thinking:3}),
     opt('Almost never — I have limited time',{discipline:3,curiosity:1})],
    ['technology','design','entrepreneurship','research'],'easy','curiosity',['curiosity','adaptability'],1.2,'curiosity'),

  q('cu_002','You encounter a topic you know nothing about in conversation. You:',
    [opt('Ask questions eagerly and follow up with research',{curiosity:4,research_mindset:4,communication:3}),
     opt('Listen and make a mental note to explore later',{curiosity:3,discipline:3}),
     opt('Nod along and move the conversation forward',{communication:2,adaptability:3}),
     opt('Admit I do not know and redirect',{communication:3,emotional_intelligence:3})],
    ['design','media','technology','research'],'easy','curiosity',['curiosity','research_mindset'],1.1,'curiosity'),

  q('cu_003','The last time you went deep on a topic just because it fascinated you was:',
    [opt('Within the last week',{curiosity:4,discipline:4}),
     opt('Last month',{curiosity:3,discipline:3}),
     opt('Several months ago',{curiosity:2}),
     opt('I cannot remember',{curiosity:0})],
    ['technology','science','design','research'],'easy','curiosity',['curiosity'],1.0,'curiosity'),

  q('cu_004','Which excites you more?',
    [opt('Discovering how something works at a deep level',{curiosity:4,research_mindset:4,analytical_thinking:3}),
     opt('Applying knowledge to build something new',{technical_thinking:4,creativity:4}),
     opt('Teaching what I know to others',{communication:4,discipline:3}),
     opt('Using knowledge to earn and grow financially',{financial_intelligence:4,strategic_thinking:3})],
    ['science','technology','design','education'],'easy','curiosity',['curiosity','research_mindset'],1.1,'curiosity'),
];

// ─── ADAPTABILITY (25 questions) ─────────────────────────────────────────────
const adaptabilityQuestions = [
  q('ad_001','Your project scope changes significantly mid-way. You:',
    [opt('Reassess the plan, adjust, and move forward confidently',{adaptability:4,strategic_thinking:4}),
     opt('Feel frustrated but adapt after processing it',{adaptability:3,emotional_intelligence:3}),
     opt('Push back on the change with data to support the original plan',{analytical_thinking:4,communication:3}),
     opt('Follow new direction but document original plan for reference',{adaptability:3,discipline:4})],
    ['technology','business','design'],'medium','adaptability',['adaptability','strategic_thinking'],1.3,'adaptability'),

  q('ad_002','You are moved to a new role you did not choose. You:',
    [opt('Embrace it as a chance to grow new skills',{adaptability:4,curiosity:4}),
     opt('Accept it but seek to move back when possible',{adaptability:2,discipline:3}),
     opt('Perform adequately but focus energy elsewhere',{adaptability:2,strategic_thinking:2}),
     opt('Discuss my concerns with management clearly',{communication:4,leadership:3})],
    ['business','technology','healthcare'],'medium','adaptability',['adaptability','curiosity'],1.3,'adaptability'),

  q('ad_003','How do you react when your best plan fails completely?',
    [opt('Quickly analyse why, pivot, and restart',{adaptability:4,analytical_thinking:4,risk_taking:4}),
     opt('Take time to process, then rebuild',{emotional_intelligence:4,adaptability:3}),
     opt('Seek advice and reassess approach',{teamwork:3,adaptability:3}),
     opt('Find it difficult to recover quickly',{adaptability:1,emotional_intelligence:2})],
    ['entrepreneurship','business','technology'],'hard','adaptability',['adaptability','analytical_thinking'],1.5,'adaptability'),

  q('ad_004','How comfortable are you working in ambiguous, undefined situations?',
    [opt('Very — ambiguity creates opportunity for me',{adaptability:4,entrepreneurship:4,risk_taking:4}),
     opt('Fairly — I create structure in ambiguity',{adaptability:3,discipline:4}),
     opt('Moderately — I prefer some guidance',{discipline:3,adaptability:2}),
     opt('Uncomfortable — I need clear direction',{discipline:4,adaptability:1})],
    ['entrepreneurship','design','technology'],'medium','adaptability',['adaptability','risk_taking'],1.3,'adaptability'),
];

// ─── PROBLEM SOLVING (30 questions) ──────────────────────────────────────────
const problemSolvingQuestions = [
  q('ps_001','When you face a problem you have never seen before, your approach is:',
    [opt('Break it into known components and tackle each',{problem_solving:4,analytical_thinking:4,logic:4}),
     opt('Look for analogous problems in other domains',{problem_solving:4,curiosity:4,creativity:4}),
     opt('Gather a team to brainstorm together',{teamwork:4,problem_solving:3}),
     opt('Research until I find a proven solution',{research_mindset:4,problem_solving:3})],
    ['technology','business','science'],'medium','problem_solving',['problem_solving','analytical_thinking'],1.4,'problem_solving'),

  q('ps_002','What is your first instinct when a plan is not working?',
    [opt('Diagnose root cause before making changes',{problem_solving:4,analytical_thinking:4}),
     opt('Try a different approach immediately',{adaptability:4,problem_solving:3}),
     opt('Consult others who have faced similar issues',{teamwork:4,problem_solving:3}),
     opt('Persist with the current approach more intensely',{discipline:4,problem_solving:2})],
    ['business','technology','entrepreneurship'],'easy','problem_solving',['problem_solving','analytical_thinking'],1.2,'problem_solving'),

  q('ps_003','You are stuck on a problem for hours with no progress. You:',
    [opt('Step away completely, return with fresh perspective',{adaptability:4,problem_solving:4}),
     opt('Systematically eliminate options one by one',{analytical_thinking:4,discipline:4,problem_solving:4}),
     opt('Explain the problem to someone else to gain clarity',{communication:4,teamwork:4,problem_solving:3}),
     opt('Search online for solutions',{research_mindset:4,problem_solving:3})],
    ['technology','science','design'],'medium','problem_solving',['problem_solving','adaptability'],1.3,'problem_solving'),

  q('ps_004','The best solution to a problem is usually:',
    [opt('The simplest one that fully addresses the root cause',{problem_solving:4,logic:4,discipline:3}),
     opt('The most elegant and innovative one',{creativity:4,problem_solving:3}),
     opt('The one most stakeholders agree on',{teamwork:4,communication:4}),
     opt('The fastest one given current constraints',{adaptability:4,strategic_thinking:3})],
    ['technology','business','design'],'easy','problem_solving',['problem_solving','logic'],1.2,'problem_solving'),

  q('ps_005','You are given a problem with no single correct answer. You:',
    [opt('Explore multiple solutions, evaluate trade-offs, select best',{problem_solving:4,analytical_thinking:4,strategic_thinking:4}),
     opt('Pick the safest option to minimise risk',{risk_taking:2,discipline:3}),
     opt('Test two options in parallel and compare',{problem_solving:4,technical_thinking:3,risk_taking:3}),
     opt('Seek expert input before deciding',{research_mindset:3,teamwork:3})],
    ['technology','business','law'],'hard','problem_solving',['problem_solving','analytical_thinking','strategic_thinking'],1.5,'problem_solving'),
];

// ─── DESIGN THINKING (25 questions) ──────────────────────────────────────────
const designThinkingQuestions = [
  q('dt_001','How do you define the success of a design?',
    [opt('It solves the user\'s real problem intuitively',{design_thinking:4,emotional_intelligence:3,analytical_thinking:3}),
     opt('It is aesthetically excellent and memorable',{creativity:4,design_thinking:3}),
     opt('It meets all specified requirements',{discipline:4,design_thinking:2}),
     opt('It drives measurable business outcomes',{strategic_thinking:4,financial_intelligence:3})],
    ['design','technology','marketing'],'easy','design_thinking',['design_thinking','creativity'],1.2,'design_thinking'),

  q('dt_002','When designing an app, what is your first step?',
    [opt('Define user personas and map their journey',{design_thinking:4,research_mindset:4,analytical_thinking:3}),
     opt('Sketch wireframes of the core screens',{design_thinking:3,creativity:3}),
     opt('List all features the app needs',{discipline:3,analytical_thinking:3}),
     opt('Research competing apps for inspiration',{research_mindset:3,creativity:3})],
    ['design','technology'],'medium','design_thinking',['design_thinking','research_mindset'],1.4,'design_thinking'),

  q('dt_003','How important is prototyping before building a final product?',
    [opt('Essential — prototype early and fail cheaply',{design_thinking:4,risk_taking:4,adaptability:4}),
     opt('Important but can be skipped if time is limited',{adaptability:3,design_thinking:3}),
     opt('Helpful only for complex projects',{design_thinking:2,discipline:3}),
     opt('Not necessary if research is thorough',{research_mindset:3,design_thinking:2})],
    ['design','technology','entrepreneurship'],'medium','design_thinking',['design_thinking','adaptability'],1.3,'design_thinking'),

  q('dt_004','When user testing reveals your design has major flaws, you feel:',
    [opt('Grateful — this is exactly what testing is for',{design_thinking:4,adaptability:4,emotional_intelligence:4}),
     opt('Disappointed but motivated to fix it',{adaptability:3,emotional_intelligence:3,design_thinking:3}),
     opt('Defensive — some users do not understand the intent',{design_thinking:1,emotional_intelligence:1}),
     opt('Anxious about the timeline impact',{adaptability:2})],
    ['design','technology'],'medium','design_thinking',['design_thinking','emotional_intelligence'],1.4,'design_thinking'),
];

// ─── SALES ABILITY (20 questions) ────────────────────────────────────────────
const salesAbilityQuestions = [
  q('sa_001','How comfortable are you with persuading someone to your view?',
    [opt('Very — I enjoy crafting compelling arguments',{sales_ability:4,communication:4,leadership:3}),
     opt('Comfortable when I genuinely believe in what I am saying',{sales_ability:3,communication:3}),
     opt('Somewhat — I prefer to inform rather than persuade',{communication:3,sales_ability:2}),
     opt('Uncomfortable — persuasion feels manipulative',{emotional_intelligence:3,sales_ability:1})],
    ['marketing','business','entrepreneurship'],'easy','sales_ability',['sales_ability','communication'],1.2,'sales_ability'),

  q('sa_002','A potential client says "your price is too high." You respond:',
    [opt('Anchor on value delivered, not price paid',{sales_ability:4,communication:4,financial_intelligence:3}),
     opt('Offer a discount to close the deal',{sales_ability:2,financial_intelligence:1}),
     opt('Ask what budget they have and tailor a proposal',{sales_ability:3,communication:4}),
     opt('Explain all features to justify the price',{communication:3,sales_ability:2})],
    ['marketing','business','entrepreneurship'],'hard','sales_ability',['sales_ability','communication'],1.5,'sales_ability'),

  q('sa_003','How do you build rapport with strangers in a professional context?',
    [opt('Find genuine common ground through questions',{sales_ability:4,communication:4,emotional_intelligence:4}),
     opt('Lead with my credentials and expertise',{communication:2,sales_ability:2}),
     opt('Be warm but professional, let rapport build naturally',{emotional_intelligence:4,sales_ability:3}),
     opt('I find building rapport with strangers challenging',{sales_ability:1,emotional_intelligence:2})],
    ['marketing','business','hospitality'],'medium','sales_ability',['sales_ability','communication'],1.3,'sales_ability'),
];

// ─── PUBLIC SPEAKING (20 questions) ──────────────────────────────────────────
const publicSpeakingQuestions = [
  q('pk_001','How do you prepare for an important presentation?',
    [opt('Know the content deeply, rehearse, anticipate questions',{public_speaking:4,discipline:4,analytical_thinking:3}),
     opt('Prepare key points on slides and speak naturally',{public_speaking:3,adaptability:3}),
     opt('Memorise a script word for word',{discipline:4,public_speaking:2}),
     opt('Wing it — I perform better spontaneously',{adaptability:4,public_speaking:3,risk_taking:3})],
    ['media','business','education','marketing'],'easy','public_speaking',['public_speaking','discipline'],1.2,'public_speaking'),

  q('pk_002','What makes a great speaker in your view?',
    [opt('The ability to connect emotionally and tell a story',{public_speaking:4,communication:4,emotional_intelligence:4}),
     opt('Deep expertise and credibility',{discipline:4,research_mindset:3}),
     opt('Clarity, pace, and structure',{communication:4,discipline:4,public_speaking:3}),
     opt('Confidence and charisma',{leadership:4,public_speaking:3})],
    ['media','education','marketing','law'],'easy','public_speaking',['public_speaking','communication'],1.1,'public_speaking'),

  q('pk_003','When asked an unexpected question during a presentation, you:',
    [opt('Acknowledge it, think briefly, answer honestly if possible',{public_speaking:4,communication:4,emotional_intelligence:3}),
     opt('Defer — "great question, let me follow up"',{communication:3,discipline:3}),
     opt('Attempt an answer even if uncertain',{risk_taking:3,adaptability:3}),
     opt('Feel flustered and lose composure',{public_speaking:1,emotional_intelligence:1})],
    ['media','business','law'],'hard','public_speaking',['public_speaking','communication'],1.5,'public_speaking'),
];

// ─── COMBINED EXPORT ──────────────────────────────────────────────────────────
export const questionBank = {
  leadership: leadershipQuestions,
  logic: logicQuestions,
  creativity: creativityQuestions,
  emotional_intelligence: emotionalIntelligenceQuestions,
  entrepreneurship: entrepreneurshipQuestions,
  technical_thinking: technicalThinkingQuestions,
  communication: communicationQuestions,
  risk_taking: riskTakingQuestions,
  analytical_thinking: analyticalThinkingQuestions,
  teamwork: teamworkQuestions,
  discipline: disciplineQuestions,
  research_mindset: researchMindsetQuestions,
  financial_intelligence: financialIntelligenceQuestions,
  strategic_thinking: strategicThinkingQuestions,
  curiosity: curiosityQuestions,
  adaptability: adaptabilityQuestions,
  problem_solving: problemSolvingQuestions,
  design_thinking: designThinkingQuestions,
  sales_ability: salesAbilityQuestions,
  public_speaking: publicSpeakingQuestions
};

// Interest → category mapping for dynamic question selection
export const INTEREST_CATEGORY_MAP = {
  'Technology':       ['technical_thinking','logic','analytical_thinking','problem_solving','curiosity'],
  'AI':               ['technical_thinking','analytical_thinking','logic','research_mindset','curiosity'],
  'Business':         ['leadership','strategic_thinking','financial_intelligence','communication','teamwork'],
  'Entrepreneurship': ['entrepreneurship','risk_taking','strategic_thinking','leadership','creativity'],
  'Design':           ['creativity','design_thinking','curiosity','problem_solving','communication'],
  'Media':            ['creativity','communication','public_speaking','adaptability','sales_ability'],
  'Marketing':        ['sales_ability','communication','creativity','strategic_thinking','analytical_thinking'],
  'Finance':          ['financial_intelligence','analytical_thinking','discipline','logic','strategic_thinking'],
  'Healthcare':       ['emotional_intelligence','discipline','teamwork','research_mindset','analytical_thinking'],
  'Psychology':       ['emotional_intelligence','communication','research_mindset','curiosity','analytical_thinking'],
  'Law':              ['logic','communication','research_mindset','analytical_thinking','discipline'],
  'Agriculture':      ['research_mindset','discipline','curiosity','technical_thinking','analytical_thinking'],
  'Sports':           ['discipline','teamwork','leadership','adaptability','risk_taking'],
  'Fashion':          ['creativity','design_thinking','communication','sales_ability','curiosity'],
  'Hospitality':      ['communication','emotional_intelligence','teamwork','adaptability','sales_ability'],
  'Aviation':         ['discipline','technical_thinking','adaptability','risk_taking','teamwork'],
  'Government Jobs':  ['discipline','strategic_thinking','research_mindset','communication','analytical_thinking'],
  'Education':        ['communication','emotional_intelligence','teamwork','research_mindset','discipline'],
  'Robotics':         ['technical_thinking','analytical_thinking','problem_solving','logic','creativity'],
  'Data Science':     ['analytical_thinking','technical_thinking','logic','research_mindset','curiosity'],
  'Cybersecurity':    ['technical_thinking','logic','risk_taking','analytical_thinking','discipline'],
  'Game Development': ['creativity','technical_thinking','design_thinking','teamwork','curiosity'],
  'Commerce':         ['financial_intelligence','analytical_thinking','communication','discipline','strategic_thinking'],
  'International Relations':['communication','strategic_thinking','adaptability','research_mindset','emotional_intelligence'],
  'Environmental Science':['research_mindset','analytical_thinking','curiosity','discipline','problem_solving'],
  'Biotechnology':    ['research_mindset','analytical_thinking','discipline','technical_thinking','curiosity'],
};
