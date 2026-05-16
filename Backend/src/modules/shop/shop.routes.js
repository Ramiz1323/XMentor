import express from 'express';
import { getItems, buyItem, claimDaily, usePause, useDeadlineExtend, usePerk } from './shop.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/community.middleware.js';
import { buyItemSchema, consumePerkSchema } from './shop.validation.js';

const router = express.Router();

router.use(protect);

router.get('/items', getItems);
router.post('/buy', validate(buyItemSchema), buyItem);
router.post('/daily-login', claimDaily);
router.post('/use-pause', usePause);
router.post('/use-deadline-extend', useDeadlineExtend);
router.post('/use-perk', validate(consumePerkSchema), usePerk);

export default router;
