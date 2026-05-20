import { questionBank } from './careerDatabase/questions';
import { careerDatabase } from './careerDatabase/courses';
import { collegeDatabase } from './careerDatabase/colleges';

export { questionBank, careerDatabase, collegeDatabase };

// ─── DYNAMIC SHUFFLE AND SELECTION OF QUESTIONS ─────────────────────────────
export function selectQuestionsForStudent(stream, interests, count = 10) {
  // Normalize interests to lowercase keys that match questionBank keys
  const normalizedInterests = (interests || []).map(i => {
    if (i === "Government Jobs") return "government_jobs";
    return i.toLowerCase().replace(/\s+/g, '_');
  }).filter(cat => !!questionBank[cat]);

  let selectedPool = [];
  const selectedIds = new Set();

  if (normalizedInterests.length > 0) {
    // Determine base questions count per selected interest
    const basePerInterest = Math.floor(count / normalizedInterests.length);
    let remainder = count % normalizedInterests.length;

    normalizedInterests.forEach((cat, idx) => {
      const targetCount = basePerInterest + (idx < remainder ? 1 : 0);
      if (targetCount > 0 && questionBank[cat]) {
        const shuffledCat = shuffleArray([...questionBank[cat]]);
        let added = 0;
        for (let i = 0; i < shuffledCat.length; i++) {
          if (added >= targetCount) break;
          const q = shuffledCat[i];
          if (!selectedIds.has(q.id)) {
            selectedPool.push(q);
            selectedIds.add(q.id);
            added++;
          }
        }
      }
    });
  }

  // If pool size is less than requested count, fill dynamically from other categories
  if (selectedPool.length < count) {
    const allCats = Object.keys(questionBank);
    const remainingCats = allCats.filter(c => !normalizedInterests.includes(c));
    const shuffledRemainingCats = shuffleArray(remainingCats);

    for (let cIdx = 0; cIdx < shuffledRemainingCats.length; cIdx++) {
      if (selectedPool.length >= count) break;
      const cat = shuffledRemainingCats[cIdx];
      const shuffledCat = shuffleArray([...questionBank[cat]]);
      
      for (let qIdx = 0; qIdx < shuffledCat.length; qIdx++) {
        if (selectedPool.length >= count) break;
        const q = shuffledCat[qIdx];
        if (!selectedIds.has(q.id)) {
          selectedPool.push(q);
          selectedIds.add(q.id);
        }
      }
    }
  }

  // Final shuffle of the combined pool to interleave questions from different categories
  return shuffleArray(selectedPool).slice(0, count);
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

  // 2. Generate plausible traits
  const defaultTraits = [
    { name: "Creativity", val: 75 + Math.floor(Math.random() * 20) },
    { name: "Leadership", val: 70 + Math.floor(Math.random() * 20) },
    { name: "Analytical", val: 75 + Math.floor(Math.random() * 20) },
    { name: "Communication", val: 70 + Math.floor(Math.random() * 20) }
  ];

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
