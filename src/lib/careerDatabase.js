import { questionBank } from './careerDatabase/questions';
import { careerDatabase } from './careerDatabase/courses';
import { collegeDatabase } from './careerDatabase/colleges';
import { careersMl } from './careerDatabase/careersMl';

export { questionBank, careerDatabase, collegeDatabase };

// ─── DYNAMIC SHUFFLE AND SELECTION OF QUESTIONS ─────────────────────────────
const streamCategoryMap = {
  Science: ['technology', 'ai', 'healthcare', 'aviation', 'agriculture', 'sports'],
  Commerce: ['business', 'finance', 'entrepreneurship', 'marketing', 'hospitality', 'government_jobs'],
  Humanities: ['design', 'psychology', 'media', 'law', 'education', 'fashion', 'government_jobs'],
  'Computer Science': ['technology', 'ai', 'design', 'media', 'entrepreneurship'],
  Arts: ['design', 'fashion', 'media', 'psychology', 'education']
};

function getAnswerMultiplier(answer) {
  if (!answer) return 0.5;
  const lower = answer.toLowerCase();
  if (lower.includes('strongly agree') || lower === 'yes, absolutely' || lower === 'yes' || lower === 'yes, very much') return 1.0;
  if (lower.includes('agree') || lower === 'sometimes' || lower === 'sometimes, if needed' || lower.includes('occasionally')) return 0.6;
  if (lower.includes('neutral') || lower === 'not sure') return 0.3;
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
    
    // Support old scoring logic if present
    const scoring = ans.scoringLogic || {};
    if (scoring.traits) {
      Object.keys(scoring.traits).forEach(trait => {
        if (traits[trait] !== undefined) traits[trait] += scoring.traits[trait] * mult;
      });
    }

    // Support new string array format
    if (ans.traits && Array.isArray(ans.traits)) {
      ans.traits.forEach(t => {
        const lowerT = t.toLowerCase();
        if (lowerT.includes('analytical') || lowerT.includes('problem')) traits.analytical += 1.0 * mult;
        if (lowerT.includes('creativity') || lowerT.includes('design') || lowerT.includes('innovation')) traits.creativity += 1.0 * mult;
        if (lowerT.includes('leadership') || lowerT.includes('manage')) traits.leadership += 1.0 * mult;
        if (lowerT.includes('communication') || lowerT.includes('empathy') || lowerT.includes('team')) traits.communication += 1.0 * mult;
      });
    }
  });

  return traits;
}

export function selectNextQuestion(stream, interests, previousAnswers = [], alreadySelectedIds = new Set()) {
  const normalizedInterests = (interests || []).map(i => i.toLowerCase().replace(/\s+/g, '_')).filter(cat => !!questionBank[cat]);
  const activeInterests = normalizedInterests.length > 0 ? normalizedInterests : (streamCategoryMap[stream] || streamCategoryMap.Science);
  const totalAnswered = previousAnswers.length;

  // Track category usage for round-robin distribution
  const catCounts = {};
  activeInterests.forEach(cat => { catCounts[cat] = 0; });
  previousAnswers.forEach(ans => {
    if (ans.category && catCounts[ans.category] !== undefined) catCounts[ans.category]++;
  });
  const sortedCats = [...activeInterests].sort((a, b) => (catCounts[a] || 0) - (catCounts[b] || 0));

  let allCandidates = [];
  for (const cat of sortedCats) {
    const qs = questionBank[cat] || [];
    let filtered = qs.filter(q => !alreadySelectedIds.has(q.id) && q.stream && q.stream.includes(stream));
    if (filtered.length === 0) filtered = qs.filter(q => !alreadySelectedIds.has(q.id));
    allCandidates = allCandidates.concat(filtered);
  }

  if (allCandidates.length === 0) {
    for (const c of Object.keys(questionBank)) {
      allCandidates = allCandidates.concat((questionBank[c] || []).filter(q => !alreadySelectedIds.has(q.id)));
    }
  }

  // Difficulty progression
  const isNormal = q => q.question && !q.question.includes('[Behavioral]') && !q.question.includes('[Personality]');
  const isPersonality = q => q.question && q.question.includes('[Personality]');
  const isBehavioral = q => q.question && q.question.includes('[Behavioral]');

  let candidates;
  if (totalAnswered < 4) {
    candidates = allCandidates.filter(isNormal);
  } else if (totalAnswered < 7) {
    candidates = allCandidates.filter(isPersonality);
    if (candidates.length === 0) candidates = allCandidates.filter(isNormal);
  } else {
    candidates = allCandidates.filter(isBehavioral);
  }
  if (!candidates || candidates.length === 0) candidates = allCandidates;

  if (candidates.length === 0) return null;

  // Prioritize least-used category
  const leastCat = sortedCats[0];
  const priority = candidates.filter(q => q.category === leastCat);
  const pool = priority.length > 0 ? priority : candidates;

  // Fisher-Yates shuffle
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr[0];
}

export function selectQuestionsForStudent(stream, interests, count = 15) {
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

export function getCollegesForCareers(careerIds, userCity = "") {
  const filterColleges = (list) => {
    return list.filter(college => {
      if (!college.availableCourses) return false;
      return college.availableCourses.some(courseId => careerIds.includes(courseId));
    });
  };

  const scoreCollege = (college) => {
    let score = college.placementScore || 50;
    if (userCity && college.location && college.location.toLowerCase() === userCity.toLowerCase()) {
      score += 20; // Boost home city colleges
    }
    score += Math.random() * 5; // Tie-breaker
    return score;
  };

  const matchedKerala = filterColleges(collegeDatabase.kerala)
    .map(c => ({...c, _matchScore: scoreCollege(c)}))
    .sort((a, b) => b._matchScore - a._matchScore);
    
  const matchedIndia = filterColleges(collegeDatabase.india)
    .map(c => ({...c, _matchScore: scoreCollege(c)}))
    .sort((a, b) => b._matchScore - a._matchScore);

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

  const actualTraits = calculateTraits(userProfile.conversationHistory || []);

  const scoredCareers = careerDatabase.map(career => {
    let score = 0;
    
    // 1. Stream Match (Strict Penalization)
    const careerStreams = (career.streams || []).map(s => s.toLowerCase());
    const userStreamLower = stream.toLowerCase();
    const hasStreamMatch = careerStreams.length === 0 || careerStreams.includes(userStreamLower) || careerStreams.includes('any');
    
    if (!hasStreamMatch) {
      score -= 100; // Strong penalty for stream mismatch
    } else {
      score += 20; // Stream match bonus
    }

    // 2. Interest match
    const careerCategory = (career.category || '').toLowerCase();
    if (selectedInterests.some(interest => careerCategory === interest.toLowerCase() || (interest === "Government Jobs" && careerCategory === "government jobs"))) {
      score += 30;
    }
    
    if (career.interests) {
      const matchCount = selectedInterests.filter(i => career.interests.map(ci=>ci.toLowerCase()).includes(i.toLowerCase())).length;
      score += (matchCount * 10);
    }

    // 3. Personality Score Match
    if (career.personalityMatch) {
      let traitScore = 0;
      career.personalityMatch.forEach(trait => {
        const lowerTrait = trait.toLowerCase();
        if (lowerTrait.includes('creat') || lowerTrait.includes('design') || lowerTrait.includes('innovat')) traitScore += actualTraits.creativity;
        if (lowerTrait.includes('lead') || lowerTrait.includes('manage')) traitScore += actualTraits.leadership;
        if (lowerTrait.includes('analy') || lowerTrait.includes('problem')) traitScore += actualTraits.analytical;
        if (lowerTrait.includes('commun') || lowerTrait.includes('empath')) traitScore += actualTraits.communication;
      });
      score += (traitScore * 10);
    }

    // 4. Answer patterns (Question scores)
    const history = userProfile.conversationHistory || [];
    let answerScore = 0;
    history.forEach(ans => {
      let mult = 0.5;
      const lowerAns = (ans.answer || '').toLowerCase();
      if (lowerAns.includes('strongly agree') || lowerAns === 'yes, absolutely' || lowerAns === 'yes') mult = 1.0;
      else if (lowerAns.includes('agree') || lowerAns === 'sometimes') mult = 0.6;
      else if (lowerAns.includes('neutral') || lowerAns === 'not sure') mult = 0.3;
      else if (lowerAns.includes('disagree') || lowerAns === 'no') mult = -0.5;
      else if (lowerAns.includes('strongly disagree')) mult = -1.0;
      
      if (ans.category && ans.category.toLowerCase() === careerCategory) {
        answerScore += (mult * 15);
      }

      // Check tags against career skills/title
      if (ans.tags && Array.isArray(ans.tags)) {
        ans.tags.forEach(tag => {
          const lowerTag = tag.toLowerCase();
          if (career.title.toLowerCase().includes(lowerTag)) answerScore += (mult * 10);
          if (career.skills && career.skills.some(s => s.toLowerCase().includes(lowerTag))) answerScore += (mult * 8);
        });
      }
    });
    score += answerScore;

    // Tie breaker
    score += Math.random() * 2;
    
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

  // actualTraits is now calculated earlier

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
  const matchedColleges = getCollegesForCareers(topCourseIds, userProfile.city);
  
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
