const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /register
const registerUser = async (req, res) => {
  const { channelName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const logoUrl = req.files?.logo?.[0]?.path || '';
    const bannerUrl = req.files?.banner?.[0]?.path || '';

    const user = new User({
      channelName,
      email,
      password: hashedPassword,
      logo: logoUrl,
      banner: bannerUrl,
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'No such email exists' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Password' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // Set JWT as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // send cookie only over HTTPS in production
      sameSite: 'lax',// CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return user object only (no token in body)
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /logout
const logoutUser = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ message: 'Logged out successfully' });
};


const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      _id: user._id,
      channelName: user.channelName,
      email: user.email,
      logo: user.logo,
      banner: user.banner,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

const getUserDetailsById = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}


// POST /:id/subscribe
const toggleSubscribeUser = async (req, res) => {
  console.log("Subscribe API is called");
  const currentUserId = req.userId; // send in request body
  const targetUserId = req.params.id;
  console.log("Subscribe request body:", targetUserId, "Current user ID:", currentUserId);

  try {
    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "Can't subscribe to yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent duplicate subscription
    if (currentUser.subscribedChannels.includes(targetUserId)) {
      currentUser.subscribedChannels = currentUser.subscribedChannels.filter(id => id.toString() !== targetUserId);
      targetUser.subscribers = Math.max(0, (targetUser.subscribers || 0) - 1);
      await currentUser.save();
      await targetUser.save();
      console.log(`User ${currentUser.channelName} unsubscribed from ${targetUser.channelName}`);
      console.log("Unsubscribed successfully");
      return res.json({ currentUser, targetUser });
    }

    currentUser.subscribedChannels.push(targetUserId);
    targetUser.subscribers = (targetUser.subscribers || 0) + 1;

    await currentUser.save();
    await targetUser.save();

    console.log(`User ${currentUser.channelName} subscribed to ${targetUser.channelName}`);

    res.json({ currentUser, targetUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserDetails,
  getUserDetailsById,
  toggleSubscribeUser,
  changePassword
};
