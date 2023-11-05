const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Assuming you have middleware to check if a student is logged in
const { isLoggedIn, isStudent } = require('../middleware/authMiddleware');

// Student dashboard can only be accessed by logged in students
router.get('/dashboard', isLoggedIn, isStudent, studentController.dashboard_get);
router.get('/mentors', isLoggedIn, isStudent, studentController.get_mentors);
router.get('/career-advice', isLoggedIn, isStudent, studentController.careerAdvice_get);

router.get('/my-opportunities', isLoggedIn, isStudent, studentController.myOpportunities_get);
router.get('/resume-review', isLoggedIn, isStudent, studentController.resumeReview_get);
router.get('/mock-interview', isLoggedIn, isStudent, studentController.mockInterview_get);
router.post('/join-opportunity/:opportunityId', studentController.joinOpportunity);
router.post('/leave-opportunity/:opportunityId', studentController.leaveOpportunity);


module.exports = router;
