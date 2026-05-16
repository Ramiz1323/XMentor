import asyncHandler from '../../utils/asyncHandler.js';
import * as shopService from './shop.service.js';

export const getItems = asyncHandler(async (req, res) => {
  const items = await shopService.listItems();
  res.status(200).json({ success: true, data: items });
});

export const buyItem = asyncHandler(async (req, res) => {
  const { itemId } = req.body;
  const result = await shopService.purchaseItem(req.user._id, itemId);
  res.status(200).json({
    success: true,
    message: `Item purchased! ${result.item.name} is now in your inventory.`,
    data: result,
  });
});

export const claimDaily = asyncHandler(async (req, res) => {
  const result = await shopService.claimDailyLogin(req.user._id);
  res.status(200).json({
    success: true,
    message: `+${result.pointsEarned} Pts claimed! Daily bonus locked in.`,
    data: result,
  });
});

// POST /api/shop/use-pause  { testId }
export const usePause = asyncHandler(async (req, res) => {
  const { testId } = req.body;
  if (!testId) return res.status(400).json({ success: false, message: 'testId is required' });

  const result = await shopService.usePauseToken(req.user._id, testId);
  res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
});

// POST /api/shop/use-deadline-extend  { testId }
export const useDeadlineExtend = asyncHandler(async (req, res) => {
  const { testId } = req.body;
  if (!testId) return res.status(400).json({ success: false, message: 'testId is required' });

  const result = await shopService.useDeadlineExtend(req.user._id, testId);
  res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
});

// Generic use-perk (legacy / other perks)
export const usePerk = asyncHandler(async (req, res) => {
  const { itemId } = req.body;
  const result = await shopService.consumePerk(req.user._id, itemId);
  res.status(200).json({
    success: true,
    message: 'Perk activated successfully.',
    data: result,
  });
});
