// routes/generalRoutes.js

const express = require('express');
const router = express.Router();

// Define the root path route
router.get('/', (req, res) => {
  res.render('about'); 
});

// Public About Us page route
router.get('/about', (req, res) => {
  res.render('about'); 
});


module.exports = router;
