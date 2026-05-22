const fs = require('fs');

const interestsList = [
  "technology", "ai", "business", "design", "finance", 
  "marketing", "agriculture", "sports", "healthcare", 
  "psychology", "media", "law", "fashion", 
  "entrepreneurship", "government_jobs", "education", 
  "hospitality", "aviation"
];

const allTraits = ["Analytical Thinking", "Problem Solving", "Creativity", "Leadership", "Communication", "Empathy", "Detail-oriented", "Adaptability", "Teamwork"];
const allStreams = ["Science", "Commerce", "Humanities", "Computer Science", "Bio Science"];

// Base templates for different types
const actionVerbs = ["Do you enjoy", "Are you interested in", "Can you see yourself", "Would you like", "Are you passionate about"];
const descriptors = {
  technology: ["building software systems", "managing IT infrastructure", "troubleshooting networks", "exploring new tech gadgets", "optimizing software performance", "learning new programming languages"],
  ai: ["training machine learning models", "automating repetitive tasks", "exploring artificial neural networks", "designing smart algorithms", "predicting trends using data", "working with natural language processing"],
  business: ["managing teams", "analyzing market trends", "optimizing supply chains", "negotiating deals", "scaling operations", "overseeing project budgets"],
  design: ["creating visual layouts", "prototyping user interfaces", "sketching new concepts", "selecting color palettes", "working on 3D modeling", "improving user experience"],
  finance: ["analyzing stock markets", "managing investment portfolios", "auditing financial records", "calculating tax liabilities", "forecasting economic trends", "balancing corporate budgets"],
  marketing: ["running social media campaigns", "analyzing consumer behavior", "writing ad copy", "managing brand identity", "optimizing SEO strategies", "organizing promotional events"],
  agriculture: ["improving crop yields", "managing organic farms", "exploring agritech solutions", "working with soil sciences", "planning sustainable farming", "operating agricultural machinery"],
  sports: ["coaching athletic teams", "analyzing player performance", "managing sports facilities", "reporting on sports events", "designing fitness programs", "organizing local tournaments"],
  healthcare: ["caring for patients", "researching medical treatments", "managing clinic operations", "administering physical therapy", "analyzing lab results", "promoting public health"],
  psychology: ["counseling individuals", "studying human behavior", "analyzing mental health patterns", "conducting cognitive research", "managing workplace wellness", "assisting in behavioral therapy"],
  media: ["writing news articles", "directing video productions", "editing audio tracks", "managing public relations", "broadcasting live events", "creating digital content"],
  law: ["researching legal precedents", "drafting contracts", "arguing cases in court", "advising corporate compliance", "mediating disputes", "advocating for human rights"],
  fashion: ["designing clothing lines", "forecasting fashion trends", "managing retail operations", "styling photo shoots", "working with textiles", "organizing runway shows"],
  entrepreneurship: ["pitching startup ideas", "identifying market gaps", "securing venture capital", "building minimum viable products", "networking with founders", "taking calculated business risks"],
  government_jobs: ["managing public resources", "implementing civil policies", "preparing for civil services", "handling administrative duties", "overseeing community projects", "maintaining public records"],
  education: ["teaching complex subjects", "developing curriculum", "mentoring young students", "managing school administration", "conducting educational research", "designing e-learning modules"],
  hospitality: ["managing hotel operations", "planning large events", "overseeing restaurant services", "coordinating travel itineraries", "ensuring guest satisfaction", "managing tourism campaigns"],
  aviation: ["piloting aircraft", "managing air traffic control", "maintaining aviation equipment", "overseeing airport logistics", "designing aerospace components", "coordinating flight schedules"]
};

// Combinations
const generateQuestion = (id, category, type) => {
  let qText = "";
  let traits = [];
  let stream = [];
  
  let primaryInterest = category;
  let secondaryInterest = interestsList[Math.floor(Math.random() * interestsList.length)];
  
  if (type === 'interest') {
    const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
    const desc = descriptors[category][Math.floor(Math.random() * descriptors[category].length)];
    qText = `${verb} ${desc}?`;
    
    // Assign generic traits based on category
    if (['technology', 'ai', 'finance', 'law'].includes(category)) traits.push("Analytical Thinking", "Problem Solving");
    if (['design', 'fashion', 'media'].includes(category)) traits.push("Creativity", "Detail-oriented");
    if (['business', 'entrepreneurship', 'sports'].includes(category)) traits.push("Leadership", "Communication");
    if (['healthcare', 'psychology', 'education'].includes(category)) traits.push("Empathy", "Communication");
    
    // Assign generic streams
    if (['technology', 'ai', 'aviation', 'agriculture'].includes(category)) stream = ["Science", "Computer Science"];
    if (['business', 'finance', 'entrepreneurship', 'marketing'].includes(category)) stream = ["Commerce"];
    if (['design', 'psychology', 'media', 'law', 'education'].includes(category)) stream = ["Humanities"];
    
  } else if (type === 'personality') {
    qText = `When faced with a complex challenge, do you prefer to rely on data and logic over intuition?`;
    traits = ["Analytical Thinking", "Problem Solving"];
    stream = allStreams;
  } else if (type === 'behavioral') {
    qText = `Do you thrive in high-pressure environments where quick decisions are required?`;
    traits = ["Adaptability", "Leadership"];
    stream = allStreams;
  } else if (type === 'combination') {
    qText = `Would you be interested in applying ${primaryInterest} concepts to the field of ${secondaryInterest}?`;
    traits = ["Creativity", "Adaptability"];
    stream = allStreams;
  }
  
  if (stream.length === 0) stream = allStreams;

  return {
    id: id,
    question: qText,
    options: ["Yes, absolutely", "Sometimes", "Not sure", "No"],
    category: category,
    interests: [primaryInterest, type === 'combination' ? secondaryInterest : primaryInterest],
    stream: stream,
    traits: Array.from(new Set(traits))
  };
};

const questionBank = {};
let globalCount = 1;

interestsList.forEach(category => {
  questionBank[category] = [];
  
  // 30 questions per category
  for (let i = 0; i < 30; i++) {
    let type = 'interest';
    if (i > 15) type = 'combination';
    if (i > 20) type = 'personality';
    if (i > 25) type = 'behavioral';
    
    const q = generateQuestion(`q_${category}_${i+1}`, category, type);
    // Add variations to text to ensure uniqueness
    if (type === 'personality') q.question = `[Personality] ${actionVerbs[Math.floor(Math.random() * actionVerbs.length)]} exploring how ${category} relates to your personal growth?`;
    if (type === 'behavioral') q.question = `[Behavioral] In a team setting, would you take charge of a ${category} project?`;
    
    questionBank[category].push(q);
    globalCount++;
  }
});

const fileContent = `export const questionBank = ${JSON.stringify(questionBank, null, 2)};\n`;
fs.writeFileSync('src/lib/careerDatabase/questions.js', fileContent);
console.log(`Successfully generated ${globalCount - 1} dynamic questions across ${interestsList.length} categories!`);
