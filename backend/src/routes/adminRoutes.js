import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { listAllNotes } from '../controllers/noteController.js';
import { listUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { getUsersByInterest } from '../controllers/aggregationController.js';

const router = Router();
router.use(authenticate, authorize('admin'));

router.get('/notes', listAllNotes);

router.get('/users-by-interest', getUsersByInterest);
router.route('/users').get(listUsers).post(createUser);
router.route('/users/:id').get(getUser).put(updateUser).delete(deleteUser);

export default router;