import { Bank, Project, RankedBank, Settings, OptimizationResult } from '../types';
import { ratingToScore, meetsMinimumRating } from './creditRating';

export function rankBanksForProject(
  banks: Bank[],
  project: Project,
  weights: Settings['weights']
): RankedBank[] {
  return banks.map(bank => {
    const disqualifyReasons: string[] = [];
    const availableCapacity = bank.totalCapacity - bank.usedCapacity;

    // Hard filters
    const operatesInCountry =
      bank.countries.includes('GLOBAL') || bank.countries.includes(project.country);
    if (!operatesInCountry) disqualifyReasons.push('Does not operate in project country');

    const noSensitiveConflict =
      !project.projectType?.length ||
      !bank.sensitiveSubjects?.length ||
      !project.projectType.some(pt => bank.sensitiveSubjects!.includes(pt));
    if (!noSensitiveConflict) disqualifyReasons.push('Sensitive subject conflict');

    const meetsTenor =
      !project.tenorRequired || !bank.maxTenor || bank.maxTenor >= project.tenorRequired;
    if (!meetsTenor) disqualifyReasons.push('Max tenor insufficient');

    const meetsRating = meetsMinimumRating(bank.creditRating, project.minimumCreditRating);
    if (!meetsRating) disqualifyReasons.push('Credit rating below minimum');

    const hasCapacity = availableCapacity > 0;
    if (!hasCapacity) disqualifyReasons.push('No available capacity');

    const eligible = disqualifyReasons.length === 0;

    // Soft scoring
    const capacityScore = bank.totalCapacity > 0
      ? (availableCapacity - project.capacityNeeded) / bank.totalCapacity
      : 0;

    const priceScore = bank.averagePrice
      ? 1 - (bank.averagePrice / 500) // Normalize: 0bps=1.0, 500bps=0.0
      : 0.5;

    const ratingScore = ratingToScore(bank.creditRating) / 10;

    // Local bank bonus: banks that specifically list the project country
    // get a boost over GLOBAL banks to prioritize local capacity utilization
    const isLocalBank = bank.countries.includes(project.country) && !bank.countries.includes('GLOBAL');
    const localBonus = isLocalBank ? 0.05 : 0;

    const score = eligible
      ? weights.capacityHeadroom * Math.max(0, capacityScore) +
        weights.priceCompetitiveness * Math.max(0, priceScore) +
        weights.creditRating * ratingScore +
        localBonus
      : 0;

    return {
      ...bank,
      availableCapacity,
      score: Math.round(score * 1000) / 1000,
      capacityScore: Math.round(Math.max(0, capacityScore) * 1000) / 1000,
      priceScore: Math.round(Math.max(0, priceScore) * 1000) / 1000,
      ratingScore: Math.round(ratingScore * 1000) / 1000,
      isLocalBank,
      eligible,
      disqualifyReasons,
    };
  }).sort((a, b) => {
    if (a.eligible && !b.eligible) return -1;
    if (!a.eligible && b.eligible) return 1;
    return b.score - a.score;
  });
}

export function optimizeProjects(
  banks: Bank[],
  projects: Project[],
  weights: Settings['weights'],
  forcedAssignments?: Record<string, string> // projectId -> bankId
): OptimizationResult[] {
  const plannedProjects = projects.filter(p => p.status === 'Planned');

  // Clone banks for capacity tracking
  const bankCopies = banks.map(b => ({
    ...b,
    usedCapacity: b.usedCapacity,
  }));

  const results: OptimizationResult[] = [];

  // Process forced assignments first — deduct their capacity
  const forcedProjectIds = new Set<string>();
  if (forcedAssignments) {
    for (const [projectId, bankId] of Object.entries(forcedAssignments)) {
      const project = plannedProjects.find(p => p.id === projectId);
      const bank = bankCopies.find(b => b.id === bankId);
      if (project && bank) {
        forcedProjectIds.add(projectId);
        bank.usedCapacity += project.capacityNeeded;
        results.push({
          projectId: project.id,
          projectName: project.name,
          recommendedBankId: bank.id,
          recommendedBankName: bank.name,
          score: -1, // indicates forced
          forced: true,
        });
      }
    }
  }

  // Sort remaining by most constrained (fewest eligible banks)
  const remaining = plannedProjects.filter(p => !forcedProjectIds.has(p.id));
  const projectEligibility = remaining.map(p => ({
    project: p,
    eligibleCount: bankCopies.filter(b => {
      const avail = b.totalCapacity - b.usedCapacity;
      const inCountry = b.countries.includes('GLOBAL') || b.countries.includes(p.country);
      const noConflict = !p.projectType?.length || !b.sensitiveSubjects?.length ||
        !p.projectType.some(pt => b.sensitiveSubjects!.includes(pt));
      return inCountry && noConflict && avail > 0;
    }).length,
  }));
  projectEligibility.sort((a, b) => a.eligibleCount - b.eligibleCount);

  for (const { project } of projectEligibility) {
    const ranked = rankBanksForProject(bankCopies, project, weights);
    const bestBank = ranked.find(r => r.eligible);

    if (bestBank) {
      const bankCopy = bankCopies.find(b => b.id === bestBank.id)!;
      bankCopy.usedCapacity += project.capacityNeeded;

      results.push({
        projectId: project.id,
        projectName: project.name,
        recommendedBankId: bestBank.id,
        recommendedBankName: bestBank.name,
        score: bestBank.score,
      });
    } else {
      results.push({
        projectId: project.id,
        projectName: project.name,
        recommendedBankId: '',
        recommendedBankName: 'No eligible bank',
        score: 0,
      });
    }
  }

  return results;
}
