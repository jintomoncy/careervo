const fs = require('fs');

const categories = ['business', 'technology', 'ai', 'design', 'finance', 'marketing', 'agriculture', 'sports', 'healthcare', 'psychology', 'media', 'law', 'fashion', 'entrepreneurship', 'government_jobs', 'education', 'hospitality', 'aviation'];

const questionTemplates = {
  business: ['Do you enjoy managing teams?', 'Do you like analyzing market trends?', 'Are you good at negotiating?', 'Do you find business strategies interesting?', 'Would you like to run a company one day?', 'Do you enjoy resolving conflicts between people?', 'Are you comfortable taking calculated risks?', 'Do you like reading about successful companies?', 'Can you easily convince others?', 'Do you like optimizing processes for efficiency?'],
  technology: ['Do you enjoy coding or learning new software?', 'Are you curious about how computers work?', 'Do you like building apps or websites?', 'Do you find troubleshooting tech issues fun?', 'Do you follow the latest tech news?', 'Do you enjoy logic puzzles?', 'Would you like to work in cybersecurity?', 'Do you like automating repetitive tasks?', 'Are you interested in cloud computing?', 'Do you enjoy working with databases?'],
  ai: ['Are you fascinated by robots and automation?', 'Do you want to build intelligent systems?', 'Do you follow AI advancements like ChatGPT?', 'Are you interested in machine learning?', 'Do you enjoy math and algorithms?', 'Do you want to solve complex problems using AI?', 'Are you curious about computer vision?', 'Do you think about the ethics of AI?', 'Would you like to train AI models?', 'Do you want to build chatbots?'],
  design: ['Do you enjoy drawing or sketching?', 'Do you care about how websites look?', 'Are you sensitive to colors and layouts?', 'Do you like creating logos or graphics?', 'Are you interested in user experience (UX)?', 'Do you enjoy 3D modeling?', 'Do you pay attention to product packaging?', 'Do you like interior decoration?', 'Do you enjoy typography?', 'Are you creative with visual arts?'],
  finance: ['Do you like working with numbers?', 'Are you interested in the stock market?', 'Do you enjoy budgeting and saving?', 'Do you want to understand how banks work?', 'Are you good at mental math?', 'Do you like analyzing financial reports?', 'Are you interested in cryptocurrency?', "Do you enjoy managing other people's money?", 'Do you like learning about investments?', 'Are you interested in taxation?'],
  marketing: ['Do you enjoy creating social media content?', 'Are you good at understanding what people want?', 'Do you like coming up with catchy slogans?', 'Are you interested in digital marketing?', 'Do you enjoy studying consumer behavior?', 'Do you like analyzing ad campaigns?', 'Are you good at storytelling?', 'Do you want to build brand identities?', 'Do you enjoy public relations?', 'Are you interested in SEO?'],
  agriculture: ['Do you enjoy being in nature?', 'Are you interested in farming techniques?', 'Do you want to solve food security issues?', 'Do you care about sustainable agriculture?', 'Are you interested in plant biology?', 'Do you like learning about crop yields?', 'Are you interested in agritech?', 'Do you want to manage a farm?', 'Do you enjoy learning about soil science?', 'Are you interested in organic farming?'],
  sports: ['Are you passionate about athletics?', 'Do you enjoy team sports?', 'Are you interested in sports management?', 'Do you want to be a coach or trainer?', 'Do you like analyzing sports statistics?', 'Are you interested in sports medicine?', 'Do you enjoy physical fitness?', 'Do you want to organize sports events?', 'Are you interested in sports journalism?', 'Do you follow sports leagues closely?'],
  healthcare: ['Do you enjoy helping sick people?', 'Are you interested in human biology?', 'Do you want to become a doctor or nurse?', 'Are you calm in emergency situations?', 'Do you enjoy learning about medicines?', 'Are you interested in medical research?', 'Do you want to work in a hospital?', 'Are you empathetic towards patients?', 'Do you like studying diseases?', 'Are you interested in public health?'],
  psychology: ['Are you interested in how the human mind works?', "Do you enjoy listening to people's problems?", 'Do you want to be a counselor?', 'Are you good at understanding emotions?', 'Do you like analyzing human behavior?', 'Are you interested in child development?', 'Do you want to study mental illnesses?', 'Are you good at reading body language?', 'Do you enjoy psychology books?', 'Are you interested in cognitive science?'],
  media: ['Do you enjoy writing articles or blogs?', 'Are you interested in journalism?', 'Do you like video editing?', 'Do you want to be a news anchor?', 'Are you interested in mass communication?', 'Do you enjoy podcasting?', 'Do you want to direct films?', 'Are you interested in photography?', 'Do you like following the news?', 'Are you interested in media ethics?'],
  law: ['Are you interested in justice and rules?', 'Do you enjoy debating?', 'Do you like analyzing arguments?', 'Are you interested in corporate law?', 'Do you want to be an advocate or judge?', 'Are you good at public speaking?', 'Do you enjoy reading legal documents?', 'Are you interested in human rights?', 'Do you want to study the constitution?', 'Are you interested in criminal law?'],
  fashion: ['Are you passionate about clothes and trends?', 'Do you enjoy designing garments?', 'Are you interested in the fashion industry?', 'Do you like styling outfits?', 'Are you interested in textile design?', 'Do you want to be a fashion model?', 'Do you enjoy fashion magazines?', 'Are you interested in jewelry design?', 'Do you want to manage a fashion brand?', 'Are you interested in fashion marketing?'],
  entrepreneurship: ['Do you want to start your own business?', 'Do you enjoy pitching new ideas?', 'Are you a risk-taker?', 'Do you want to be your own boss?', 'Are you interested in startups?', 'Do you like solving everyday problems?', 'Are you good at networking?', 'Do you want to disrupt an industry?', 'Are you resilient against failure?', 'Do you enjoy creating business plans?'],
  government_jobs: ['Are you interested in public administration?', 'Do you want to serve the country?', 'Are you preparing for UPSC or state exams?', 'Do you want a stable, secure career?', 'Are you interested in policy making?', 'Do you want to work in a government office?', 'Are you interested in diplomacy?', 'Do you want to work in defense or police?', 'Are you interested in the IRS or IAS?', 'Do you want to work in public welfare?'],
  education: ['Do you enjoy teaching others?', 'Are you interested in pedagogy?', 'Do you want to be a professor?', 'Are you patient with learners?', 'Do you enjoy creating lesson plans?', 'Are you interested in educational technology?', 'Do you want to shape the future of students?', 'Are you interested in special education?', 'Do you like explaining complex concepts?', 'Are you interested in curriculum design?'],
  hospitality: ['Do you enjoy serving and hosting guests?', 'Are you interested in hotel management?', 'Do you want to work in the tourism industry?', 'Are you good at customer service?', 'Do you enjoy culinary arts and cooking?', 'Are you interested in event management?', 'Do you want to manage a restaurant?', 'Are you polite and welcoming?', 'Do you enjoy traveling?', 'Are you interested in luxury hospitality?'],
  aviation: ['Are you fascinated by airplanes?', 'Do you want to be a pilot?', 'Are you interested in aerospace engineering?', 'Do you want to work as cabin crew?', 'Are you interested in air traffic control?', 'Do you want to manage an airport?', 'Are you comfortable with heights and flying?', 'Do you enjoy aviation technology?', 'Are you interested in flight safety?', 'Do you want to work in aviation mechanics?']
};

let questions = {};

categories.forEach(cat => {
  questions[cat] = [];
  questionTemplates[cat].forEach((text, i) => {
    const qnum = i + 1;
    questions[cat].push({
      id: `q_${cat}_${qnum}`,
      category: cat,
      text: text,
      options: [
        { text: 'Yes, absolutely', score: 1 },
        { text: 'Sometimes', score: 0.6 },
        { text: 'Neutral', score: 0.3 },
        { text: 'No', score: 0 }
      ],
      scoringLogic: {
        traits: {
          analytical: Number((Math.random() * 0.8 + 0.2).toFixed(2)),
          creativity: Number((Math.random() * 0.8 + 0.2).toFixed(2)),
          leadership: Number((Math.random() * 0.8 + 0.2).toFixed(2)),
          communication: Number((Math.random() * 0.8 + 0.2).toFixed(2))
        }
      },
      difficulty: qnum <= 3 ? 'easy' : (qnum <= 7 ? 'medium' : 'hard')
    });
  });
});

const content = 'export const questionBank = ' + JSON.stringify(questions, null, 2) + ';';
fs.writeFileSync('src/lib/careerDatabase/questions.js', content);
console.log('Successfully generated 180 questions!');
