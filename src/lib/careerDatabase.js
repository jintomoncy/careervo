import { questionBank } from './careerDatabase/questions';
import { careerDatabase } from './careerDatabase/courses';
import { collegeDatabase } from './careerDatabase/colleges';

export { questionBank, careerDatabase, collegeDatabase };

// ─── DYNAMIC SHUFFLE AND SELECTION OF QUESTIONS ─────────────────────────────
// ─── DYNAMIC SHUFFLE AND SELECTION OF QUESTIONS ─────────────────────────────
const streamCategoryMap = {
  Science: ['technology', 'ai', 'healthcare', 'aviation', 'agriculture', 'sports'],
  Commerce: ['business', 'finance', 'entrepreneurship', 'marketing', 'hospitality', 'government_jobs'],
  Humanities: ['design', 'psychology', 'media', 'law', 'education', 'fashion', 'government_jobs']
};

function getAnswerMultiplier(answer) {
  if (!answer) return 0.5;
  const lower = answer.toLowerCase();
  if (lower.includes('strongly agree') || lower === 'yes, absolutely' || lower === 'yes') return 1.0;
  if (lower.includes('agree') || lower === 'sometimes' || lower === 'sometimes, if needed' || lower.includes('occasionally')) return 0.6;
  if (lower.includes('neutral')) return 0.3;
  if (lower.includes('disagree') || lower === 'no' || lower === 'no, i prefer other roles' || lower.includes('rarely')) return 0.0;
  if (lower.includes('strongly disagree')) return -0.3;
  return 0.5;
}

export function calculateTraits(previousAnswers) {
  const traits = {
    analytical: 0,
    creativity: 0,
    leadership: 0,
    communication: 0,
    empathy: 0,
    discipline: 0
  };

  previousAnswers.forEach(ans => {
    const mult = getAnswerMultiplier(ans.answer);
    const scoring = ans.scoringLogic || {};
    if (scoring.traits) {
      Object.keys(scoring.traits).forEach(trait => {
        if (traits[trait] !== undefined) {
          traits[trait] += scoring.traits[trait] * mult;
        }
      });
    }
  });

  return traits;
}

export function selectNextQuestion(stream, interests, previousAnswers = [], alreadySelectedIds = new Set()) {
  // Normalize interests to lowercase keys
  const normalizedInterests = (interests || []).map(i => {
    if (i === "Government Jobs") return "government_jobs";
    return i.toLowerCase().replace(/\s+/g, '_');
  }).filter(cat => !!questionBank[cat]);

  // If interests are empty, fall back to stream categories
  const activeInterests = normalizedInterests.length > 0 ? normalizedInterests : (streamCategoryMap[stream] || streamCategoryMap.Science);

  // 1. Determine target category for the next question
  let targetCategory = '';
  let targetDifficulty = 'easy';
  let targetTrait = '';

  const totalAnswered = previousAnswers.length;

  if (totalAnswered < activeInterests.length) {
    // Stage 1: Make sure we cover each selected interest at least once in the beginning
    targetCategory = activeInterests[totalAnswered];
    targetDifficulty = 'easy'; // start easy
  } else {
    // Stage 2: Adaptive selection based on previous answers and personality traits
    const traits = calculateTraits(previousAnswers);
    // Find the highest scoring trait
    let maxTrait = 'analytical';
    let maxVal = -999;
    Object.keys(traits).forEach(t => {
      if (traits[t] > maxVal) {
        maxVal = traits[t];
        maxTrait = t;
      }
    });
    targetTrait = maxTrait;

    const lastAns = previousAnswers[previousAnswers.length - 1];
    const lastMult = lastAns ? getAnswerMultiplier(lastAns.answer) : 0.5;

    if (lastMult >= 0.6) {
      // User liked the last topic -> drill deeper or cross-interest
      const rand = Math.random();
      if (rand < 0.4) {
        // Drill deeper in the same category with higher difficulty
        targetCategory = lastAns.category;
        targetDifficulty = Math.random() < 0.5 ? 'medium' : 'hard';
      } else if (rand < 0.7) {
        // Cross-interest: find a category from active interests that has overlapping tags
        targetCategory = activeInterests.find(c => c !== lastAns.category) || lastAns.category;
        targetDifficulty = 'medium';
      } else {
        // Select based on top trait
        targetCategory = activeInterests[Math.floor(Math.random() * activeInterests.length)];
        targetDifficulty = 'medium';
      }
    } else {
      // User disliked/neutral on the last topic -> switch category, keep difficulty manageable
      targetCategory = activeInterests.find(c => c !== (lastAns ? lastAns.category : '')) || activeInterests[0];
      targetDifficulty = 'easy';
    }
  }

  // 2. Fetch candidates from target category
  let candidates = (questionBank[targetCategory] || []).filter(q => !alreadySelectedIds.has(q.id));

  // If no candidates in target category, try other selected interests
  if (candidates.length === 0) {
    for (let c of activeInterests) {
      candidates = (questionBank[c] || []).filter(q => !alreadySelectedIds.has(q.id));
      if (candidates.length > 0) {
        targetCategory = c;
        break;
      }
    }
  }

  // If still no candidates, scan the entire questionBank
  if (candidates.length === 0) {
    const allCats = Object.keys(questionBank);
    for (let c of allCats) {
      candidates = (questionBank[c] || []).filter(q => !alreadySelectedIds.has(q.id));
      if (candidates.length > 0) {
        targetCategory = c;
        break;
      }
    }
  }

  // If absolutely no questions left, reset selection check
  if (candidates.length === 0) {
    candidates = questionBank[activeInterests[0]] || [];
  }

  // 3. Score and rank candidates based on matching target difficulty and traits/tags
  const scoredCandidates = candidates.map(q => {
    let score = 0;
    
    // Difficulty match
    if (q.difficulty === targetDifficulty) {
      score += 3;
    }
    
    // Trait match in scoringLogic
    if (targetTrait && q.scoringLogic && q.scoringLogic.traits && q.scoringLogic.traits[targetTrait]) {
      score += 2;
    }

    // Stream relevance match
    const streamCats = streamCategoryMap[stream] || [];
    if (streamCats.includes(q.category)) {
      score += 1;
    }

    return { question: q, score };
  });

  // Sort candidates by score descending
  scoredCandidates.sort((a, b) => b.score - a.score);

  // Pick from the top scoring candidates (with minor randomization among top matches to keep it fresh)
  const topScore = scoredCandidates[0] ? scoredCandidates[0].score : 0;
  const bestCandidates = scoredCandidates.filter(c => c.score >= topScore - 1).map(c => c.question);

  const selectedQuestion = bestCandidates[Math.floor(Math.random() * bestCandidates.length)] || candidates[0];
  return selectedQuestion;
}

export function selectQuestionsForStudent(stream, interests, count = 10) {
  const selectedPool = [];
  const selectedIds = new Set();

  for (let i = 0; i < count; i++) {
    const nextQ = selectNextQuestion(stream, interests, selectedPool, selectedIds);
    if (nextQ) {
      selectedPool.push(nextQ);
      selectedIds.add(nextQ.id);
    }
  }

  return selectedPool;
}


// ─── COLLEGE MATCHING SYSTEM BY CAREERS ──────────────────────────────────────
export function getCollegesForCareers(careerIds) {
  const filterColleges = (list) => {
    return list.filter(college => {
      // Return true if the college offers at least one of the recommended courses
      return college.availableCourses.some(courseId => careerIds.includes(courseId));
    });
  };

  const matchedKerala = filterColleges(collegeDatabase.kerala).sort((a, b) => b.placementScore - a.placementScore);
  const matchedIndia = filterColleges(collegeDatabase.india).sort((a, b) => b.placementScore - a.placementScore);

  return {
    kerala: matchedKerala,
    india: matchedIndia
  };
}

// ─── UTILITY HELPERS ────────────────────────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── FALLBACK ANALYSIS GENERATION ───────────────────────────────────────────
import { careersMl } from './careerDatabase/careersMl';

const categoryMapMl = {
  "business": "ബിസിനസ്സ്",
  "technology": "സാങ്കേതികവിദ്യ",
  "ai": "കൃത്രിമ ബുദ്ധി (AI)",
  "design": "ഡിസൈൻ",
  "finance": "ധനകാര്യം",
  "marketing": "മാർക്കറ്റിംഗ്",
  "agriculture": "കൃഷി",
  "sports": "കായികം",
  "healthcare": "ആരോഗ്യ സംരക്ഷണം",
  "psychology": "സൈക്കോളജി",
  "media": "മാധ്യമം",
  "law": "നിയമം",
  "fashion": "ഫാഷൻ",
  "entrepreneurship": "സംരംഭകത്വം",
  "government jobs": "സർക്കാർ ജോലി",
  "education": "വിദ്യാഭ്യാസം",
  "hospitality": "ഹോസ്പിറ്റാലിറ്റി",
  "aviation": "വ്യോമയാനം"
};

const traitMapMl = {
  "creativity": "സർഗ്ഗാത്മകത",
  "leadership": "നേതൃത്വപാടവം",
  "analytical": "വിശകലന ശേഷി",
  "communication": "ആശയവിനിമയ ശേഷി"
};

export function getFallbackAnalysis(userProfile, lang = 'en') {
  const selectedInterests = userProfile.interests || [];
  const stream = userProfile.stream || "";
  const isMl = lang === 'ml';

  // 1. Calculate matching scores for all careers
  const scoredCareers = careerDatabase.map(career => {
    let score = 0;
    
    // Category match
    if (selectedInterests.some(interest => 
      career.category.toLowerCase() === interest.toLowerCase() ||
      (interest === "Government Jobs" && career.category.toLowerCase() === "government jobs")
    )) {
      score += 10;
    }
    
    // Stream match
    if (career.streams.some(s => s.toLowerCase() === stream.toLowerCase())) {
      score += 5;
    }

    return { career, score };
  });

  // Sort by score descending and take top 3
  const top3 = scoredCareers
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item, idx) => {
      const c = item.career;
      const matchScore = 90 - idx * 4 + Math.floor(Math.random() * 5); // 88% - 94% range
      
      const mlCat = categoryMapMl[c.category.toLowerCase()] || c.category;
      const mlStream = stream === "Science" ? "സയൻസ്" : stream === "Commerce" ? "കോമേഴ്‌സ്" : stream === "Humanities" ? "ഹ്യുമാനിറ്റീസ്" : stream;
      
      const trait1 = c.personalityMatch[0] ? (isMl ? (traitMapMl[c.personalityMatch[0].toLowerCase()] || c.personalityMatch[0]) : c.personalityMatch[0]) : "";
      const trait2 = c.personalityMatch[1] ? (isMl ? (traitMapMl[c.personalityMatch[1].toLowerCase()] || c.personalityMatch[1]) : c.personalityMatch[1]) : "";
      const traitsJoined = trait1 && trait2 ? `${trait1} & ${trait2}` : trait1;

      const whyText = isMl
        ? `${mlCat} മേഖലയിലുള്ള നിങ്ങളുടെ താല്പര്യവും ${mlStream || 'നിങ്ങളുടെ പഠന ശാഖ'} പശ്ചാത്തലവും അടിസ്ഥാനമാക്കി, ഈ കരിയർ നിങ്ങളുടെ വ്യക്തിത്വത്തിന് ഏറ്റവും അനുയോജ്യമാണ്. നിങ്ങളുടെ ${traitsJoined} എന്നിവ മികച്ച രീതിയിൽ ഉപയോഗിക്കാൻ ഈ കരിയർ സഹായിക്കും.`
        : `Based on your interest in ${c.category} and your academic background in ${stream || 'your stream'}, this path offers a strong match for your personality. You demonstrated excellent ${c.personalityMatch.slice(0, 2).join(' and ')} during our evaluation.`;
        
      const parentWhyText = isMl
        ? `${mlCat} മേഖലയിൽ മികച്ച തൊഴിൽ സ്ഥിരതയുള്ള ഒരു കരിയർ ആണിത്. ഇതിന്റെ ശരാശരി തുടക്ക ശമ്പളം ${c.salary} ആണ്. ആഗോളതലത്തിലുള്ള വലിയ ആവശ്യകതയും ആരോഗ്യകരമായ വർക്ക്-ലൈഫ് ബാലൻസും ഇതിനെ സുരക്ഷിതമായ തിരഞ്ഞെടുപ്പാക്കുന്നു.`
        : `This career offers excellent long-term career stability in the ${c.category} sector with a starting average salary of ${c.salary}. High global demand and a healthy work-life balance make it a highly secure choice.`;

      return {
        id: c.id,
        match: matchScore,
        why: whyText,
        parentWhy: parentWhyText
      };
    });

  // 2. Generate plausible traits dynamically based on actual assessment answers
  const actualTraits = calculateTraits(userProfile.conversationHistory || []);
  const baseTraits = {
    Creativity: actualTraits.creativity,
    Leadership: actualTraits.leadership,
    Analytical: actualTraits.analytical,
    Communication: actualTraits.communication
  };

  const defaultTraits = Object.keys(baseTraits).map(name => {
    const rawVal = baseTraits[name.toLowerCase()] || 0;
    // Map raw score (typically 0 to 15) to 60-98 range with minor randomization for flavor
    const mappedVal = Math.min(98, Math.max(60, Math.floor(65 + (rawVal * 3.5) + Math.random() * 8)));
    return { name, val: mappedVal };
  });

  // 3. Generate roadmap based on first career
  const careerId = top3[0].id;
  const firstCareerTitle = isMl 
    ? (careersMl[careerId] || careerDatabase.find(c => c.id === careerId)?.title || "നിങ്ങളുടെ മേഖല")
    : (careerDatabase.find(c => c.id === careerId)?.title || "your chosen field");

  const defaultRoadmap = isMl ? [
    { period: "ഘട്ടം 1: അടിസ്ഥാന വിദ്യാഭ്യാസം (Undergrad)", description: `${firstCareerTitle} അല്ലെങ്കിൽ അനുബന്ധ മേഖലയിൽ ഒരു ബിരുദം അല്ലെങ്കിൽ മികച്ച കോഴ്സ് തിരഞ്ഞെടുക്കുക. അടിസ്ഥാന തത്വങ്ങൾ പഠിക്കുന്നതിലും അക്കാദമിക് പ്രോജക്റ്റുകളിലും ശ്രദ്ധ കേന്ദ്രീകരിക്കുക.` },
    { period: "ഘട്ടം 2: പ്രായോഗിക പരിശീലനം (Upskilling & Internships)", description: "ഈ മേഖലയിലെ പ്രധാന ടൂളുകൾ പഠിക്കുക, സ്വന്തമായി ഒരു പോർട്ട്‌ഫോളിയോ നിർമ്മിക്കുക, പ്രായോഗിക പരിചയം നേടുന്നതിനായി 2-3 മാസത്തെ ഇന്റേൺഷിപ്പ് ചെയ്യുക." },
    { period: "ഘട്ടം 3: കരിയർ ലോഞ്ച് & സ്പെഷ്യലൈസേഷൻ", description: "പ്രൊഫഷണൽ സർട്ടിഫിക്കേഷനുകൾ നേടുക, ഇൻഡസ്ട്രി വിദഗ്ദ്ധരുമായി ബന്ധപ്പെടുക, മികച്ച തുടക്ക ജോലികൾക്കായി അപേക്ഷിക്കുക അല്ലെങ്കിൽ സ്വന്തം സ്റ്റാർട്ടപ്പ് സാധ്യതകൾ പരിശോധിക്കുക." }
  ] : [
    { period: "Phase 1: Foundation (Undergrad)", description: `Pursue a degree or formal certification in ${firstCareerTitle} or related discipline. Focus on mastering key fundamentals and academic projects.` },
    { period: "Phase 2: Upskilling & Internships", description: "Learn industry-standard tools, build a personal portfolio website, and secure a 2-3 month internship to gain practical hands-on experience." },
    { period: "Phase 3: Launch & Specialization", description: "Obtain professional certifications, network with industry specialists, and apply for entry-level roles or explore startup opportunities." }
  ];

  const firstInterest = selectedInterests[0] || 'chosen';
  const mlInterest = isMl ? (categoryMapMl[firstInterest.toLowerCase()] || firstInterest) : firstInterest;

  const workStyleText = isMl
    ? "കൂട്ടായ പ്രവർത്തനങ്ങളിലും കൃത്യതയിലും താല്പര്യമുള്ള സ്വഭാവം. മാറിക്കൊണ്ടിരിക്കുന്ന സാങ്കേതിക-ബിസിനസ് സാഹചര്യങ്ങളുമായി വേഗത്തിൽ പൊരുത്തപ്പെടാൻ സാധിക്കുന്നു."
    : "Collaborative, detail-oriented, and highly adaptive to changing technical and business landscapes.";

  const ambitionText = isMl
    ? `${mlInterest} മേഖലയിൽ മികച്ച സൊല്യൂഷനുകൾ കണ്ടെത്താനും, പുതിയ പ്രോജക്റ്റുകൾക്ക് നേതൃത്വം നൽകാനും, കരിയറിൽ മികച്ച വളർച്ചയും സ്ഥിരതയും കൈവരിക്കാനും ആഗ്രഹിക്കുന്നു.`
    : `Aspires to lead innovative projects, drive creative solutions in the ${selectedInterests[0] || 'chosen'} domain, and achieve long-term professional stability.`;

  return {
    traits: defaultTraits,
    workStyle: workStyleText,
    ambition: ambitionText,
    roadmap: defaultRoadmap,
    careers: top3
  };
}
