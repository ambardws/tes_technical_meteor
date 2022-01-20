const express = require('express');

const router = express.Router();

// Middleware
const { auth } = require('../middlewares/auth')

const { register, login, checkAuth } = require('../controllers/auth');
const { createUser, getUser, getUsers, updateUser, deleteUser, getProfile } = require('../controllers/user');

//Route Auth
router.post('/register', register)
router.post('/login', login)
router.get('/check-auth', auth, checkAuth);

// Profile
router.get('/profile',auth, getProfile);

//Route CRUD User
router.post('/user', auth, createUser);
router.get('/users', auth, getUsers);
router.get('/user/:id', auth, getUser);
router.patch('/user/:id',auth, updateUser);
router.delete('/user/:id', auth, deleteUser);

module.exports = router;