import express from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import * as controller from './codespace.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', controller.getCodeSpace);
router.post('/save', controller.saveCodeSpace);
router.post('/execute-java', controller.executeJava);

export default router;
