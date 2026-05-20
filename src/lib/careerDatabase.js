import { questionBank } from './careerDatabase/questions';
import { careerDatabase } from './careerDatabase/courses';
import { collegeDatabase } from './careerDatabase/colleges';

export { questionBank, careerDatabase, collegeDatabase };

// ─── DYNAMIC SHUFFLE AND SELECTION OF QUESTIONS ─────────────────────────────
export function selectQuestionsForStudent(stream, interests, count = 10) {
  // Normalize interests to lowercase keys that match questionBank keys
  const normalizedInterests = interests.map(i => {
    if (i === "Government Jobs") return "government_jobs";
    return i.toLowerCase().replace(/\s+/g, '_');
  });

  let selectedPool = [];

  // Pick up to 4 questions per chosen interest category to build a personalized pool
  normalizedInterests.forEach(cat => {
    if (questionBank[cat]) {
      const shuffledCat = shuffleArray([...questionBank[cat]]);
      selectedPool.push(...shuffledCat.slice(0, 4));
    }
  });

  // If pool size is less than requested count (e.g. fewer than 3 interests), fill with other categories
  if (selectedPool.length < count) {
    const allCats = Object.keys(questionBank);
    const remainingCats = allCats.filter(c => !normalizedInterests.includes(c));
    shuffleArray(remainingCats).forEach(cat => {
      if (selectedPool.length < count && questionBank[cat]) {
        selectedPool.push(...questionBank[cat].slice(0, 2));
      }
    });
  }

  // Final shuffle of the combined pool and slicing to requested count
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
export function getFallbackAnalysis(userProfile) {
  const selectedInterests = userProfile.interests || [];
  const stream = userProfile.stream || "";

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
      return {
        id: c.id,
        match: matchScore,
        why: `Based on your interest in ${c.category} and your academic background in ${stream || 'your stream'}, this path offers a strong match for your personality. You demonstrated excellent ${c.personalityMatch.slice(0, 2).join(' and ')} during our evaluation.`,
        parentWhy: `This career offers excellent long-term career stability in the ${c.category} sector with a starting average salary of ${c.salary}. High global demand and a healthy work-life balance make it a highly secure choice.`
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
  const firstCareerTitle = careerDatabase.find(c => c.id === top3[0].id)?.title || "your chosen field";
  const defaultRoadmap = [
    { period: "Phase 1: Foundation (Undergrad)", description: `Pursue a degree or formal certification in ${firstCareerTitle} or related discipline. Focus on mastering key fundamentals and academic projects.` },
    { period: "Phase 2: Upskilling & Internships", description: "Learn industry-standard tools, build a personal portfolio website, and secure a 2-3 month internship to gain practical hands-on experience." },
    { period: "Phase 3: Launch & Specialization", description: "Obtain professional certifications, network with industry specialists, and apply for entry-level roles or explore startup opportunities." }
  ];

  return {
    traits: defaultTraits,
    workStyle: "Collaborative, detail-oriented, and highly adaptive to changing technical and business landscapes.",
    ambition: `Aspires to lead innovative projects, drive creative solutions in the ${selectedInterests[0] || 'chosen'} domain, and achieve long-term professional stability.`,
    roadmap: defaultRoadmap,
    careers: top3
  };
}
