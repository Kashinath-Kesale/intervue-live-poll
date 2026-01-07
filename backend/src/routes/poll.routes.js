import express from 'express';
import {createPollController} from '../controllers/poll.controller.js';
import { getActivePollController, submitVoteController, getPollResultsController, getPollHistoryController } from "../controllers/poll.controller.js";

const router = express.Router();

router.post('/polls', createPollController);
router.get("/polls/active", getActivePollController);
router.post('/polls/vote', submitVoteController);
router.get('/polls/:pollId/results', getPollResultsController);
router.get('/polls/history', getPollHistoryController);

export default router;