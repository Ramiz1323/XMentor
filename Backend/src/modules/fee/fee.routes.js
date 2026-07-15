import express from 'express';
import * as feeController from './fee.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected by default
router.use(protect);

router.get('/overview', feeController.getFeeOverview);
router.get('/payments', feeController.getPayments);
router.get('/configs', feeController.getConfigs);

// Teacher-only routes
router.post('/payments', authorize('TEACHER'), feeController.recordPayment);
router.put('/payments/:id', authorize('TEACHER'), feeController.updatePayment);
router.delete('/payments/:id', authorize('TEACHER'), feeController.deletePayment);

router.post('/configs', authorize('TEACHER'), feeController.updateConfig);
router.post('/default-fee', authorize('TEACHER'), feeController.updateDefaultFee);

export default router;
