import ShopItem from './shop.model.js';
import User from '../auth/auth.model.js';
import { MCQTest } from '../mcq/mcq.model.js';
import ErrorResponse from '../../utils/errorResponse.js';

export const listItems = async () => {
  return await ShopItem.find({ isAvailable: true }).lean();
};

export const purchaseItem = async (userId, itemId) => {
  const [item, user] = await Promise.all([
    ShopItem.findOne({ itemId, isAvailable: true }).lean(),
    User.findById(userId),
  ]);

  if (!item) throw new ErrorResponse('Item not found in Tactical Shop', 404);
  if (!user) throw new ErrorResponse('User not found', 404);

  // Check if already owned (for THEME type, no re-purchase)
  if (item.itemType === 'THEME') {
    const alreadyOwned = user.inventory.some(i => i.itemId === itemId);
    if (alreadyOwned) throw new ErrorResponse('You already own this theme', 400);
  }

  // Check balance
  if (user.points < item.price) {
    throw new ErrorResponse(
      `Insufficient Pts. Need ${item.price} Pts, you have ${user.points} Pts.`,
      402
    );
  }


  // Deduct points + add to inventory
  user.points -= item.price;
  user.inventory.push({
    itemId: item.itemId,
    itemType: item.itemType,
    name: item.name,
    purchasedAt: new Date(),
  });

  await user.save();

  return {
    newBalance: user.points,
    item,
    inventory: user.inventory,
  };
};

export const claimDailyLogin = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse('User not found', 404);

  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  if (user.lastDailyLogin) {
    const lastLoginUTC = new Date(
      Date.UTC(
        user.lastDailyLogin.getUTCFullYear(),
        user.lastDailyLogin.getUTCMonth(),
        user.lastDailyLogin.getUTCDate()
      )
    );
    if (lastLoginUTC.getTime() >= todayUTC.getTime()) {
      throw new ErrorResponse('Daily login bonus already claimed today. Come back tomorrow!', 400);
    }
  }

  const DAILY_BONUS = 10;
  user.points += DAILY_BONUS;
  user.lastDailyLogin = now;
  await user.save();

  return { newBalance: user.points, pointsEarned: DAILY_BONUS };
};

export const awardMCQPoints = async (userId, correctAnswers) => {
  if (!userId || correctAnswers <= 0) return 0;

  // 0.5 pts per correct answer. Min 0, uses $inc for atomicity.
  const ptsEarned = Math.floor(correctAnswers * 0.5); // floor: need 2 correct for 1 pt
  if (ptsEarned < 1) return 0; // less than 2 correct answers = 0 pts

  await User.findByIdAndUpdate(userId, { $inc: { points: ptsEarned } });
  return ptsEarned;
};

export const usePauseToken = async (userId, testId) => {
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse('User not found', 404);

  const now = Date.now();
  if (user.lastPauseUse && (now - new Date(user.lastPauseUse).getTime()) < 24 * 60 * 60 * 1000) {
    const remainingHours = Math.ceil((24 * 60 * 60 * 1000 - (now - new Date(user.lastPauseUse).getTime())) / (60 * 60 * 1000));
    throw new ErrorResponse(`Tactical Command Rule: You cannot use another Emergency Pause Token within 24 hours. Cooldown remaining: ~${remainingHours}h.`, 400);
  }

  const perkIndex = user.inventory.findIndex(
    i => (i.itemId === 'perk_extra_pause' || i.itemId === 'perk_pause_token') && i.itemType === 'PERK'
  );
  if (perkIndex === -1) {
    throw new ErrorResponse('No Pause Token found in your inventory', 404);
  }

  // Bump the test's pauseLimit by 1 so the existing pause flow works seamlessly
  const test = await MCQTest.findById(testId);
  if (!test) throw new ErrorResponse('Test not found', 404);

  if (test.pauseLimit === 0) {
    throw new ErrorResponse('Tactical Command Rule: This exam was configured by the instructor to disallow pausing (Pause Limit is 0). Emergency Pause Tokens cannot be used here.', 400);
  }

  test.pauseLimit += 1;
  await test.save();

  // Remove perk from inventory
  user.inventory.splice(perkIndex, 1);
  user.lastPauseUse = new Date();
  await user.save();

  return {
    inventory: user.inventory,
    newPauseLimit: test.pauseLimit,
    message: 'Pause Token activated! You can now pause this test once.',
  };
};

// ─────────────────────────────────────────────────────────
// USE DEADLINE EXTEND
// Validates ownership + test exists, extends deadline by 24 hours,
// removes one deadline_extend perk from inventory.
// ─────────────────────────────────────────────────────────
export const useDeadlineExtend = async (userId, testId) => {
  const PERK_ID = 'perk_deadline_extend';

  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse('User not found', 404);

  const now = Date.now();
  if (user.lastDeadlineExtendUse && (now - new Date(user.lastDeadlineExtendUse).getTime()) < 48 * 60 * 60 * 1000) {
    const remainingHours = Math.ceil((48 * 60 * 60 * 1000 - (now - new Date(user.lastDeadlineExtendUse).getTime())) / (60 * 60 * 1000));
    throw new ErrorResponse(`Tactical Command Rule: You cannot use another Deadline Extension Token within 48 hours. Cooldown remaining: ~${remainingHours}h.`, 400);
  }

  const perkIndex = user.inventory.findIndex(
    i => i.itemId === PERK_ID && i.itemType === 'PERK'
  );
  if (perkIndex === -1) {
    throw new ErrorResponse('No Deadline Extension token found in your inventory', 404);
  }

  const test = await MCQTest.findById(testId);
  if (!test) throw new ErrorResponse('Test not found', 404);

  // Only extend if the student is actually assigned to this test
  const isAssigned = test.assignedStudents.some(id => id.toString() === userId.toString());
  if (!isAssigned) {
    throw new ErrorResponse('You are not assigned to this test', 403);
  }

  // Extend deadline for THIS STUDENT ONLY
  const extIndex = test.extendedDeadlines.findIndex(e => e.studentId.toString() === userId.toString());
  const currentStudentDeadline = extIndex !== -1 ? new Date(test.extendedDeadlines[extIndex].deadline) : new Date(test.deadline);

  const baseDate = currentStudentDeadline > new Date() ? currentStudentDeadline : new Date();
  const newDeadline = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);

  if (extIndex !== -1) {
    test.extendedDeadlines[extIndex].deadline = newDeadline;
  } else {
    test.extendedDeadlines.push({ studentId: userId, deadline: newDeadline });
  }

  await test.save();

  // Remove one instance of the perk from inventory
  user.inventory.splice(perkIndex, 1);
  user.lastDeadlineExtendUse = new Date();
  await user.save();

  return {
    inventory: user.inventory,
    newDeadline: newDeadline,
    message: `Deadline extended to ${newDeadline.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}!`,
  };
};

// Legacy generic consumePerk kept for backwards compat
export const consumePerk = async (userId, itemId) => {
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse('User not found', 404);

  const perkIndex = user.inventory.findIndex(i => i.itemId === itemId && i.itemType === 'PERK');
  if (perkIndex === -1) throw new ErrorResponse('Perk not found in your inventory', 404);

  user.inventory.splice(perkIndex, 1);
  await user.save();

  return { inventory: user.inventory };
};
