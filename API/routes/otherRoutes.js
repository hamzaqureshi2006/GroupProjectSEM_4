const express = require('express');
const router = express.Router();
const {getNews} = require('../controllers/otherControllers');

router.get("/news",getNews);

module.exports = router;