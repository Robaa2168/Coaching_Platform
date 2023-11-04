// studentController.js

const CoachingUser = require('../models/coachingUser');
const Mentor = require('../models/mentor');
const MentoringOpportunity = require('../models/mentoringOpportunity');

exports.dashboard_get = async (req, res) => {
    try {

        const opportunities = await MentoringOpportunity.find().lean();

        // Render the `dashboard.mustache` view with opportunities data
        // Note the removal of the leading slash before 'students/dashboard'
        res.render('students/dashboard', {
            title: 'Student Dashboard',
            opportunities: opportunities
        });
    } catch (error) {
        // Handle any errors that occur during fetching or rendering
        console.error('Error rendering student dashboard: ', error);
        res.status(500).send('Error rendering dashboard');
    }
};

exports.careerAdvice_get = async (req, res) => {
    try {
        // Fetch only the mentoring opportunities related to career advice
        const careerAdviceOpportunities = await MentoringOpportunity.find({ category: 'Career_advice' }).lean();

        // Render the `career_advice.mustache` view with the filtered data
        res.render('students/career_advice', {
            title: 'Career Advice Opportunities',
            user: req.user,
            careerAdviceOpportunities: careerAdviceOpportunities
        });
    } catch (error) {
        // Handle any errors that occur during fetching or rendering
        console.error('Error rendering career advice page: ', error);
        res.status(500).send('Error rendering career advice page');
    }
};

exports.resumeReview_get = async (req, res) => {
    try {
        // Fetch only the mentoring opportunities related to resume review
        const resumeReviewOpportunities = await MentoringOpportunity.find({ category: 'Resume_Review' }).lean();

        // Render the `resume_review.mustache` view with the filtered data
        res.render('students/resume_review', {
            title: 'Resume Review Opportunities',
            user: req.user,
            resumeReviewOpportunities: resumeReviewOpportunities
        });
    } catch (error) {
        // Handle any errors that occur during fetching or rendering
        console.error('Error rendering resume review page: ', error);
        res.status(500).send('Error rendering resume review page');
    }
};


exports.mockInterview_get = async (req, res) => {
    try {
        // Fetch only the mentoring opportunities related to mock interviews
        const mockInterviewOpportunities = await MentoringOpportunity.find({ category: 'Mock_Interview' }).lean();

        // Render the `mock_interview.mustache` view with the filtered data
        res.render('students/mock_interview', {
            title: 'Mock Interview Opportunities',
            user: req.user,
            mockInterviewOpportunities: mockInterviewOpportunities
        });
    } catch (error) {
        // Handle any errors that occur during fetching or rendering
        console.error('Error rendering mock interview page: ', error);
        res.status(500).send('Error rendering mock interview page');
    }
};





// Function to join an opportunity
exports.joinOpportunity = async (req, res) => {
    const userId = req.user._id; // Assuming you have access to the user's ID from the session or token
    const opportunityId = req.params.opportunityId;
  
    try {
      // Add the opportunity to the user's list if it's not already present
      const result = await CoachingUser.findByIdAndUpdate(
        userId,
        { $addToSet: { opportunities: opportunityId } }, // $addToSet prevents duplicates
        { new: true } // Return the updated document
      );
  
      if (result) {
        res.json({ message: 'You have successfully joined the opportunity!' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error joining opportunity', error: error });
    }
  };
  
  // Function to leave an opportunity
  exports.leaveOpportunity = async (req, res) => {
    const userId = req.user._id; // As above, we're assuming the user ID is accessible
    const opportunityId = req.params.opportunityId;
  
    try {
      // Remove the opportunity from the user's list
      const result = await CoachingUser.findByIdAndUpdate(
        userId,
        { $pull: { opportunities: opportunityId } }, // $pull removes the item from the array
        { new: true }
      );
  
      if (result) {
        res.json({ message: 'You have successfully left the opportunity.' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error leaving opportunity', error: error });
    }
  };

  exports.myOpportunities_get = async (req, res) => {
    try {
        // Get the user's opportunities with detail
        const user = await CoachingUser.findById(req.user._id).populate('opportunities').exec();

        // Render the `my_opportunities.mustache` view with the user's opportunities data
        res.render('students/my_opportunities', {
            title: 'My Opportunities',
            opportunities: user.opportunities
        });
    } catch (error) {
        console.error('Error rendering my opportunities page: ', error);
        res.status(500).send('Error rendering my opportunities page');
    }
};

exports.get_mentors = async (req, res) => {
    try {
        // Fetch all mentors
        const mentors = await Mentor.find().lean();

        // Render the `mentors.mustache` view with the mentor data
        res.render('students/mentors', {
            title: 'Mentors',
            mentors: mentors
        });
    } catch (error) {
        // Handle any errors that occur during fetching or rendering
        console.error('Error rendering mentors page: ', error);
        res.status(500).send('Error rendering mentors page');
    }
};