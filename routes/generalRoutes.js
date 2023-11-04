// routes/generalRoutes.js

const express = require('express');
const router = express.Router();

// Public About Us page route
router.get('/about', (req, res) => {
  res.render('about'); // Render the about view
});

// ... other routes

module.exports = router;
