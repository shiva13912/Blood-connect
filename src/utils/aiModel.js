// Blood Compatibility Table
// Key: Recipient Blood Type -> List of Donor Blood Types they can receive from
const COMPATIBILITY_MAP = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

/**
 * Check if a donor can give blood to a recipient
 */
export const isCompatible = (donorGroup, recipientGroup) => {
  if (!donorGroup || !recipientGroup) return false;
  const allowedDonors = COMPATIBILITY_MAP[recipientGroup];
  return allowedDonors ? allowedDonors.includes(donorGroup) : false;
};

/**
 * Calculates a matching score (0 to 100) and response likelihood for a donor
 */
export const calculateMatchScore = (donor, requestBloodGroup, requestCity) => {
  // 1. Core Medical Eligibility Rules
  if (!donor.eligibility) {
    return { score: 0, likelihood: 'Ineligible', reasons: ['Medically ineligible'] };
  }

  // 2. Compatibility Check
  if (!isCompatible(donor.bloodGroup, requestBloodGroup)) {
    return { score: 0, likelihood: 'Incompatible', reasons: ['Blood type mismatch'] };
  }

  let scorePoints = 0;
  const reasons = [];

  // A. Blood Type Match Level
  if (donor.bloodGroup === requestBloodGroup) {
    scorePoints += 30;
    reasons.push('Exact blood type match (+30)');
  } else {
    scorePoints += 15;
    reasons.push('Compatible alternative type (+15)');
  }

  // B. Last Donation Interval (Whole blood interval: 56 days)
  if (!donor.lastDonationDate) {
    scorePoints += 20;
    reasons.push('Fresh donor, no recent donations (+20)');
  } else {
    const lastDate = new Date(donor.lastDonationDate);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 56) {
      // Medically unfit to donate yet
      return { score: 0, likelihood: 'Rest Period', reasons: [`Last donation was only ${diffDays} days ago (Requires 56 days minimum rest)`] };
    } else if (diffDays >= 90 && diffDays <= 180) {
      scorePoints += 25;
      reasons.push('Optimal donation window, 90-180 days rest (+25)');
    } else if (diffDays > 180) {
      scorePoints += 15;
      reasons.push('Safely past rest period, last donation > 180 days (+15)');
    } else {
      scorePoints += 8;
      reasons.push('Past minimum rest period, 56-90 days (+8)');
    }
  }

  // C. Availability status
  if (donor.availability) {
    scorePoints += 25;
    reasons.push('Marked as active/available (+25)');
  } else {
    scorePoints -= 10;
    reasons.push('Marked as currently unavailable (-10)');
  }

  // D. Donation Loyalty (Frequency)
  const total = donor.totalDonations || 0;
  if (total >= 10) {
    scorePoints += 15;
    reasons.push('Veteran donor, 10+ previous donations (+15)');
  } else if (total >= 5) {
    scorePoints += 10;
    reasons.push('Regular donor, 5-9 previous donations (+10)');
  } else if (total >= 1) {
    scorePoints += 5;
    reasons.push('Previous donor (+5)');
  }

  // E. Location Match
  if (requestCity && donor.city && donor.city.toLowerCase() === requestCity.toLowerCase()) {
    scorePoints += 10;
    reasons.push('Located in same city (+10)');
  } else {
    scorePoints += 2;
    reasons.push('Located in different city (+2)');
  }

  // Normalize/Clamp Score (Range 0 - 99 to make it look like a statistical percentage)
  const finalScore = Math.max(0, Math.min(99, scorePoints));

  // Response Likelihood Classifications
  let likelihood = 'Low';
  if (finalScore >= 80) {
    likelihood = 'Critical High';
  } else if (finalScore >= 65) {
    likelihood = 'High';
  } else if (finalScore >= 45) {
    likelihood = 'Medium';
  }

  return {
    score: finalScore,
    likelihood,
    reasons
  };
};

/**
 * Takes a list of donors, filters out completely incompatible/ineligible ones,
 * scores the remaining ones, and returns them sorted by score descending.
 */
export const getAIRecommendations = (donors, requestBloodGroup, requestCity) => {
  if (!donors || !requestBloodGroup) return [];

  return donors
    .map((donor) => {
      const matchResult = calculateMatchScore(donor, requestBloodGroup, requestCity);
      return {
        ...donor,
        matchScore: matchResult.score,
        likelihood: matchResult.likelihood,
        reasons: matchResult.reasons,
      };
    })
    .filter((d) => d.matchScore > 0) // Filter out completely incompatible or resting donors
    .sort((a, b) => b.matchScore - a.matchScore);
};
