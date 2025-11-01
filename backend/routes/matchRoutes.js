import express from 'express';
import multer from 'multer';
import { handleMatch } from '../controllers/matchController.js';
import loadingScreen from '../middleware/loadingScreen.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/resumes/' });

router.post(
  '/',
  loadingScreen,
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'job', maxCount: 1 }
  ]),
  handleMatch
);

export default router;