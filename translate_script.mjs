import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const delay = ms => new Promise(res => setTimeout(res, ms));

async function translateText(text) {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ml&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    return data[0].map(x => x[0]).join('');
  } catch (e) {
    console.error("Translate error", e);
    return text;
  }
}

// Pre-translated common options to save API calls
const commonOptions = {
  "Yes, absolutely": "അതെ, തീർച്ചയായും",
  "Sometimes": "ചിലപ്പോൾ",
  "Not sure": "ഉറപ്പില്ല",
  "No": "ഇല്ല",
  "Yes, definitely": "അതെ, തീർച്ചയായും",
  "Maybe": "ഒരുപക്ഷേ",
  "Yes": "അതെ",
  "Yes, very much": "അതെ, വളരെ കൂടുതൽ",
  "No, I prefer other roles": "ഇല്ല, എനിക്ക് മറ്റ് റോളുകളാണ് താല്പര്യം",
  "Sometimes, if needed": "ചിലപ്പോൾ, ആവശ്യമെങ്കിൽ",
  "No, I prefer hands-on work": "ഇല്ല, എനിക്ക് പ്രായോഗിക പ്രവർത്തനമാണ് താല്പര്യം"
};

async function main() {
  const { questionBank } = await import('./src/lib/careerDatabase/questions.js');
  
  const mlQuestions = {};
  
  let i = 0;
  for (const cat of Object.keys(questionBank)) {
    for (const q of questionBank[cat]) {
      i++;
      console.log(`Translating ${i}/540: ${q.id}`);
      
      const mlQ = await translateText(q.question);
      
      const mlOptions = await Promise.all(q.options.map(async opt => {
        if (commonOptions[opt]) return commonOptions[opt];
        const res = await translateText(opt);
        await delay(50);
        return res;
      }));
      
      mlQuestions[q.id] = {
        question: mlQ,
        options: mlOptions
      };
      
      await delay(100); // rate limit protection
    }
  }
  
  const fileContent = `export const dynamicMl = ${JSON.stringify(mlQuestions, null, 2)};`;
  fs.writeFileSync(path.join(__dirname, 'src/lib/careerDatabase/dynamicMl.js'), fileContent);
  console.log('Done!');
}

main();
