import cron from 'node-cron';
import DonorProfile from '../models/DonorProfile.model.js';
import User from '../models/User.model.js';
import { computeEligibility } from '../utils/eligibilityHelper.js';
import logger from '../config/logger.js';

export const recalculateDonorEligibility = async () => {
  const donors = await DonorProfile.find({});
  let updated = 0;

  for (const donor of donors) {
    const eligible = computeEligibility(donor.lastDonated);
    if (donor.isEligible !== eligible) {
      donor.isEligible = eligible;
      await donor.save();
      updated += 1;
    }
  }

  logger.info(`Eligibility cron: updated ${updated} donor profiles`);
};

export const cleanExpiredPasswordResetTokens = async () => {
  const result = await User.updateMany(
    {
      passwordResetExpires: { $lt: new Date() },
    },
    {
      $unset: { passwordResetToken: '', passwordResetExpires: '' },
    }
  );

  logger.info(
    `Password reset cleanup: cleared tokens on ${result.modifiedCount} users`
  );
};

export const startCronJobs = () => {
  cron.schedule('0 2 * * *', () => {
    recalculateDonorEligibility().catch((err) =>
      logger.error(`Eligibility cron failed: ${err.message}`)
    );
  });

  cron.schedule('0 * * * *', () => {
    cleanExpiredPasswordResetTokens().catch((err) =>
      logger.error(`Token cleanup cron failed: ${err.message}`)
    );
  });

  logger.info('Cron jobs scheduled');
};

export default { startCronJobs, recalculateDonorEligibility, cleanExpiredPasswordResetTokens };
