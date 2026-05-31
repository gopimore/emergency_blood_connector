const ELIGIBILITY_DAYS = 90;

export const isDonorEligible = (lastDonated) => {
  if (!lastDonated) return true;
  const daysSince =
    (Date.now() - new Date(lastDonated).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince >= ELIGIBILITY_DAYS;
};

export const computeEligibility = (lastDonated) => isDonorEligible(lastDonated);

export default { isDonorEligible, computeEligibility, ELIGIBILITY_DAYS };
