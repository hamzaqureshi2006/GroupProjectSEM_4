const express = require('express');
const router = express.Router();


const authenticate = require('../middleware/authenticate'); // assuming you have JWT middleware
const upload = require('../middleware/multer');
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserDetails,
  getUserDetailsById,
  toggleSubscribeUser,
  changePassword,
  updateProfile
} = require('../controllers/userController');


// POST /api/users/register
router.post('/register', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), registerUser);

// POST /api/users/login
router.post('/login', loginUser);

router.post('/logout', authenticate, logoutUser);

// GET /api/users/me
router.get('/me', authenticate, getUserDetails);

// GET /api/users/getUserDetailsById/:id
router.get('/getUserDetailsById/:id', authenticate, getUserDetailsById);

// POST /api/users/subscribe
router.get('/toggleSubscribe/:id', authenticate, toggleSubscribeUser);

// POST /api/users/change-password
router.post('/change-password', authenticate, changePassword);

// POST /api/users/update-profile
router.post('/update-profile', authenticate, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), updateProfile);

module.exports = router;
