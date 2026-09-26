import express from 'express';
import authMiddleware from '../middlewares/auth.js';
import authController from '../controllers/authControllers.js';
const router = express.Router();

router.get('/profil', authMiddleware, (req, res) => {

    res.json({ mesaj: "Korumalı alana girdin!", kullaniciId: req.user.id });
});
router.post('/register' , authController.register);
router.post('/login' , authController.login);
export default router;