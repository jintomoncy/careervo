import { questionBank } from './careerDatabase/questions';
import { careerDatabase } from './careerDatabase/courses';
import { collegeDatabase } from './careerDatabase/colleges';
import { careersMl } from './careerDatabase/careersMl';

export { questionBank, careerDatabase, collegeDatabase };

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
    communication: 0
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
  const normalizedInterests = (interests || []).map(i => i.toLowerCase().replace(/\s+/g, '_')).filter(cat => !!questionBank[cat]);
  const activeInterests = normalizedInterests.length > 0 ? normalizedInterests : (streamCategoryMap[stream] || streamCategoryMap.Science);

  let targetCategory = '';
  let targetDifficulty = 'easy';
  let targetTrait = '';

  const totalAnswered = previousAnswers.length;

  if (totalAnswered < activeInterests.length) {
    targetCategory = activeInterests[totalAnswered];
    targetDifficulty = 'easy';
  } else {
    const traits = calculateTraits(previousAnswers);
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
      const rand = Math.random();
      if (rand < 0.4) {
        targetCategory = lastAns.category;
        targetDifficulty = Math.random() < 0.5 ? 'medium' : 'hard';
      } else if (rand < 0.7) {
        targetCategory = activeInterests.find(c => c !== lastAns.category) || lastAns.category;
        targetDifficulty = 'medium';
      } else {
        targetCategory = activeInterests[Math.floor(Math.random() * activeInterests.length)];
        targetDifficulty = 'medium';
      }
    } else {
      targetCategory = activeInterests.find(c => c !== (lastAns ? lastAns.category : '')) || activeInterests[0];
      targetDifficulty = 'easy';
    }
  }

  let candidates = (questionBank[targetCategory] || []).filter(q => !alreadySelectedIds.has(q.id));

  if (candidates.length === 0) {
    for (let c of activeInterests) {
      candidates = (questionBank[c] || []).filter(q => !alreadySelectedIds.has(q.id));
      if (candidates.length > 0) {
        targetCategory = c;
        break;
      }
    }
  }

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

  if (candidates.length === 0) {
    candidates = questionBank[activeInterests[0]] || [];
  }

  const scoredCandidates = candidates.map(q => {
    let score = 0;
    if (q.difficulty === targetDifficulty) score += 3;
    if (targetTrait && q.scoringLogic && q.scoringLogic.traits && q.scoringLogic.traits[targetTrait]) score += 2;
    const streamCats = streamCategoryMap[stream] || [];
    if (streamCats.includes(q.category)) score += 1;
    return { question: q, score };
  });

  scoredCandidates.sort((a, b) => b.score - a.score);
  const topScore = scoredCandidates[0] ? scoredCandidates[0].score : 0;
  const bestCandidates = scoredCandidates.filter(c => c.score >= topScore - 1).map(c => c.question);

  return bestCandidates[Math.floor(Math.random() * bestCandidates.length)] || candidates[0];
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

export function getCollegesForCareers(careerIds) {
  const filterColleges = (list) => {
    return list.filter(college => college.availableCourses.some(courseId => careerIds.includes(courseId)));
  };

  const matchedKerala = filterColleges(collegeDatabase.kerala).sort((a, b) => b.placementScore - a.placementScore);
  const matchedIndia = filterColleges(collegeDatabase.india).sort((a, b) => b.placementScore - a.placementScore);

  return { kerala: matchedKerala, india: matchedIndia };
}

const categoryMapMl = {
  "business": "ബിസിനസ്സ്", "technology": "സാങ്കേതികവിദ്യ", "ai": "കൃത്രിമ ബുദ്ധി (AI)",
  "design": "ഡിസൈൻ", "finance": "ധനകാര്യം", "marketing": "മാർക്കറ്റിംഗ്",
  "agriculture": "കൃഷി", "sports": "കായികം", "healthcare": "ആരോഗ്യ സംരക്ഷണം",
  "psychology": "സൈക്കോളജി", "media": "മാധ്യമം", "law": "നിയമം",
  "fashion": "ഫാഷൻ", "entrepreneurship": "സംരംഭകത്വം", "government jobs": "സർക്കാർ ജോലി",
  "education": "വിദ്യാഭ്യാസം", "hospitality": "ഹോസ്പിറ്റാലിറ്റി", "aviation": "വ്യോമയാനം"
};

const traitMapMl = {
  "creativity": "സർഗ്ഗാത്മകത", "leadership": "നേതൃത്വപാടവം",
  "analytical": "വിശകലന ശേഷി", "communication": "ആശയവിനിമയ ശേഷി"
};

export function getFallbackAnalysis(userProfile, lang = 'en') {
  const selectedInterests = userProfile.interests || [];
  const stream = userProfile.stream || "";
  const isMl = lang === 'ml';

  const scoredCareers = careerDatabase.map(career => {
    let score = 0;
    if (selectedInterests.some(interest => 
      career.category.toLowerCase() === interest.toLowerCase() ||
      (interest === "Government Jobs" && career.category.toLowerCase() === "government jobs")
    )) {
      score += 15;
    }
    
    if (career.streams && career.streams.some(s => s.toLowerCase() === stream.toLowerCase())) {
      score += 8;
    }

    if (career.interests && selectedInterests.some(i => career.interests.includes(i))) {
      score += 10;
    }
    
    return { career, score };
  });

  const top5 = scoredCareers
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item, idx) => {
      const c = item.career;
      const matchScore = 95 - idx * 3 + Math.floor(Math.random() * 4);
      
      const mlCat = categoryMapMl[c.category.toLowerCase()] || c.category;
      const mlStream = stream === "Science" ? "സയൻസ്" : stream === "Commerce" ? "കോമേഴ്‌സ്" : stream === "Humanities" ? "ഹ്യുമാനിറ്റീസ്" : stream;
      
      const trait1 = (c.personalityMatch && c.personalityMatch[0]) ? (isMl ? (traitMapMl[c.personalityMatch[0].toLowerCase()] || c.personalityMatch[0]) : c.personalityMatch[0]) : "";
      const trait2 = (c.personalityMatch && c.personalityMatch[1]) ? (isMl ? (traitMapMl[c.personalityMatch[1].toLowerCase()] || c.personalityMatch[1]) : c.personalityMatch[1]) : "";
      const traitsJoined = trait1 && trait2 ? `${trait1} & ${trait2}` : trait1;

      const whyText = isMl
        ? `${mlCat} മേഖലയിലുള്ള നിങ്ങളുടെ താല്പര്യവും ${mlStream || 'നിങ്ങളുടെ പഠന ശാഖ'} പശ്ചാത്തലവും അടിസ്ഥാനമാക്കി, ഈ കരിയർ നിങ്ങൾക്ക് ഏറ്റവും അനുയോജ്യമാണ്.`
        : `Based on your interest in ${c.category} and your academic background in ${stream || 'your stream'}, this path offers a strong match for your personality.`;
        
      const parentWhyText = isMl
        ? ` മികച്ച തൊഴിൽ സാധ്യതകളും ശരാശരി തുടക്ക ശമ്പളവും (${c.salary}) ഇതിനെ സുരക്ഷിതമായ തിരഞ്ഞെടുപ്പാക്കുന്നു.`
        : `This career offers excellent long-term stability with a starting average salary of ${c.salary}. High global demand makes it a highly secure choice.`;

      return {
        id: c.id,
        title: isMl ? (careersMl[c.id] || c.title) : c.title,
        match: matchScore,
        why: whyText,
        parentWhy: parentWhyText,
        salary: c.salary || "Variable",
        futureScope: c.futureScope || "High",
        aiRisk: c.aiRisk || "Low",
        workLifeBalance: c.workLifeBalance || "Moderate",
        startupOpportunity: c.startupOpportunity || "Medium",
        globalDemand: c.globalDemand || "High",
        skills: c.skills || [],
        learningPlatforms: c.learningPlatforms || [],
        admissionExams: c.admissionExams || []
      };
    });

  const actualTraits = calculateTraits(userProfile.conversationHistory || []);
  const baseTraits = {
    Creativity: actualTraits.creativity,
    Leadership: actualTraits.leadership,
    Analytical: actualTraits.analytical,
    Communication: actualTraits.communication
  };

  const defaultTraits = Object.keys(baseTraits).map(name => {
    const rawVal = baseTraits[name] || 0;
    const mappedVal = Math.min(98, Math.max(60, Math.floor(65 + (rawVal * 3.5) + Math.random() * 8)));
    return { name, val: mappedVal };
  });

  const careerId = top5[0].id;
  const firstCareerTitle = top5[0].title;

  const defaultRoadmap = isMl ? [
    { period: "ഘട്ടം 1: അടിസ്ഥാന വിദ്യാഭ്യാസം", description: `${firstCareerTitle} അല്ലെങ്കിൽ അനുബന്ധ മേഖലയിൽ ഒരു ബിരുദം തിരഞ്ഞെടുക്കുക.` },
    { period: "ഘട്ടം 2: പ്രായോഗിക പരിശീലനം", description: "ഈ മേഖലയിലെ പ്രധാന ടൂളുകൾ പഠിക്കുക, ഇന്റേൺഷിപ്പ് ചെയ്യുക." },
    { period: "ഘട്ടം 3: കരിയർ ലോഞ്ച്", description: "സർട്ടിഫിക്കേഷനുകൾ നേടുക, മികച്ച ജോലികൾക്കായി അപേക്ഷിക്കുക." }
  ] : [
    { period: "Phase 1: Foundation", description: `Pursue a degree or formal certification in ${firstCareerTitle} or related discipline.` },
    { period: "Phase 2: Upskilling & Internships", description: "Learn industry-standard tools and secure a 2-3 month internship to gain practical hands-on experience." },
    { period: "Phase 3: Launch & Specialization", description: "Obtain professional certifications, network, and apply for entry-level roles." }
  ];

  const firstInterest = selectedInterests[0] || 'chosen';
  const mlInterest = isMl ? (categoryMapMl[firstInterest.toLowerCase()] || firstInterest) : firstInterest;

  const workStyleText = isMl
    ? "കൂട്ടായ പ്രവർത്തനങ്ങളിലും കൃത്യതയിലും താല്പര്യമുള്ള സ്വഭാവം."
    : "Collaborative, detail-oriented, and highly adaptive to changing technical and business landscapes.";

  const ambitionText = isMl
    ? `${mlInterest} മേഖലയിൽ മികച്ച സൊല്യൂഷനുകൾ കണ്ടെത്താനും, കരിയറിൽ മികച്ച വളർച്ച കൈവരിക്കാനും ആഗ്രഹിക്കുന്നു.`
    : `Aspires to lead innovative projects, drive creative solutions in the ${selectedInterests[0] || 'chosen'} domain, and achieve long-term professional stability.`;

  // Get matching colleges
  const topCourseIds = top5.map(c => c.id);
  const matchedColleges = getCollegesForCareers(topCourseIds);
  
  return {
    traits: defaultTraits,
    workStyle: workStyleText,
    ambition: ambitionText,
    roadmap: defaultRoadmap,
    careers: top5,
    keralaColleges: matchedColleges.kerala.slice(0, 10),
    indiaColleges: matchedColleges.india.slice(0, 10)
  };
}
