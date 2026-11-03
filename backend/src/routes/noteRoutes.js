import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createNote, listMyNotes, getNote, updateNote, deleteNote } from '../controllers/noteController.js';

const router = Router();
router.use(authenticate);

router.route('/').post(createNote).get(listMyNotes);
router.route('/:id').get(getNote).put(updateNote).delete(deleteNote);

export default router;