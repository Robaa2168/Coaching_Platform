// controllers/adminController.js

const CoachingUser = require('../models/coachingUser');
const Mentor = require('../models/mentor');
const MentoringOpportunity = require('../models/mentoringOpportunity');
const bcrypt = require('bcryptjs');
const passport = require('passport');


exports.admin_dashboard = (req, res) => {
  res.render('admin/dashboard');
};

exports.list_students = async (req, res) => {
  try {
    const students = await CoachingUser.find({}); // Assuming you store a 'role' in the user model to differentiate students
    res.render('admin/students', { students });
  } catch (error) {
    console.error('Error fetching student list: ', error);
    res.status(500).send('Error fetching student list');
  }
};

exports.get_student = async (req, res) => {
  try {
    const student = await CoachingUser.findById(req.params.id);
    res.render('admin/student', { student });
  } catch (error) {
    console.error('Error fetching student details: ', error);
    res.status(500).send('Error fetching student details');
  }
};

exports.new_student = (req, res) => {
  res.render('admin/new_student');
};

exports.create_student = async (req, res) => {
  try {
    const { username, password, firstName, lastName, email, phoneNumber } = req.body;
    let user = await CoachingUser.findOne({ $or: [{ username: username }, { email: email }] });

    if (user) {
      req.flash('error', 'Username or Email already exists.');
      return res.redirect('/admin/student/new');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new CoachingUser({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      email,
      phoneNumber,
      role: 'student' // Assuming 'role' field exists in the schema
    });

    await user.save();
    req.flash('success', 'New student added successfully.');
    res.redirect('/admin/students');
  } catch (err) {
    console.error('Admin Error - New Student:', err);
    req.flash('error', 'An error occurred while adding the new student.');
    res.redirect('/admin/student/new');
  }
};

// Display edit student form
exports.edit_student_get = async (req, res) => {
  try {
    const student = await CoachingUser.findById(req.params.id);
    if (!student) {
      req.flash('error', 'No student found with that ID.');
      return res.redirect('/admin/students');
    }
    console.log(student);
    // Correct the path here
    res.render('admin/edit', { student });  // Removed the leading slash
  } catch (error) {
    console.error('Error fetching student for edit: ', error);
    req.flash('error', 'An error occurred while fetching student details.');
    res.redirect('/admin/students');
  }
};


// Update student details
exports.update_student = async (req, res) => {
  try {
    const { username, firstName, lastName, email } = req.body;
    const updatedStudent = await CoachingUser.findByIdAndUpdate(req.params.id, { username, firstName, lastName, email }, { new: true });
    if (!updatedStudent) {
      req.flash('error', 'No student found with that ID.');
      return res.redirect('/admin/students');
    }
    req.flash('success', 'Student updated successfully.');
    res.redirect('/admin/students');
  } catch (error) {
    console.error('Error updating student: ', error);
    req.flash('error', 'An error occurred while updating the student details.');
    res.redirect('/admin/students');
  }
};

exports.delete_student = async (req, res) => {
  try {
    const result = await CoachingUser.findByIdAndDelete(req.params.id);
    console.log('Delete result:', result);
    req.flash('success', 'Student deleted successfully.');
    res.redirect('/admin/students');
  } catch (error) {
    console.error('Error deleting student:', error);
    req.flash('error', 'Error deleting student.');
    res.redirect('/admin/students');
  }
};



// List all mentors
exports.list_mentors = async (req, res) => {
  try {
    const mentors = await Mentor.find();
    res.render('admin/mentor', { mentors }); // Notice 'mentors' view is used here
  } catch (error) {
    console.error('Error fetching mentors: ', error);
    res.status(500).send('Error fetching mentors');
  }
};




// Display form to add a new mentor
exports.new_mentor = (req, res) => {
  res.render('admin/new_mentor', {
    messages: {
      error: req.flash('error'),
      success: req.flash('success')
    }
  });
}


// Process form and add a new mentor
exports.create_mentor = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, imageUrl, expertise, bio } = req.body;

  try {
    // Check if email is already taken
    const emailExists = await Mentor.findOne({ email: email });
    if (emailExists) {
      req.flash('error', 'Email is already in use.');
      return res.redirect('/admin/mentor/new');
    }

    // Check if phone number is already taken
    const phoneExists = await Mentor.findOne({ phoneNumber: phoneNumber });
    if (phoneExists) {
      req.flash('error', 'Phone number is already in use.');
      return res.redirect('/admin/mentor/new');
    }

    // If email and phone number are unique, proceed to save new mentor
    let mentor = new Mentor({
      firstName,
      lastName,
      email,
      phoneNumber,
      imageUrl,
      expertise,
      bio
    });

    await mentor.save();
    req.flash('success', 'New mentor added successfully.');
    res.redirect('/admin/mentors');
  } catch (err) {
    console.error('Admin Error - New Mentor:', err);
    if (err.code === 11000) {
      req.flash('error', 'The provided information is already in use.');
    } else {
      req.flash('error', 'An error occurred while adding the new mentor.');
    }
    res.redirect('/admin/mentor/new');
  }
};



// Display a specific mentor's details
exports.get_mentor = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      // Handle case where mentor is not found
      res.render('admin/mentor', { mentor: null });
    } else {
      // Pass the mentor object within an object to the view
      res.render('admin/mentor_details', { mentor: mentor }); // Make sure to use the correct view name here
    }
  } catch (error) {
    console.error('Error fetching mentor details: ', error);
    res.status(500).send('Error fetching mentor details');
  }
};


// Display form to edit a mentor
exports.edit_mentor_get = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      req.flash('error', 'No mentor found with that ID.');
      return res.redirect('/admin/mentors');
    }
    res.render('admin/edit_mentor', { mentor }); // Ensure the view for this exists
  } catch (error) {
    console.error('Error fetching mentor for edit: ', error);
    req.flash('error', 'An error occurred while fetching mentor details.');
    res.redirect('/admin/mentors');
  }
};

// Update a mentor's details
exports.update_mentor = async (req, res) => {
  try {
    // Extract the updated fields from req.body
    const { firstName, lastName, email, phoneNumber, imageUrl, expertise, bio } = req.body;

    // Before updating, check if the email or phone number is being changed to a value that already exists
    // You would have to make sure that the unique email/phone number is not the current mentor's
    const mentorToUpdate = await Mentor.findById(req.params.id);
    if (!mentorToUpdate) {
      req.flash('error', 'No mentor found with that ID.');
      return res.redirect('/admin/mentors');
    }

    if (email !== mentorToUpdate.email) {
      const emailExists = await Mentor.findOne({ email: email, _id: { $ne: req.params.id } });
      if (emailExists) {
        req.flash('error', 'Email is already in use by another mentor.');
        return res.redirect('/admin/mentors');
      }
    }

    if (phoneNumber !== mentorToUpdate.phoneNumber) {
      const phoneExists = await Mentor.findOne({ phoneNumber: phoneNumber, _id: { $ne: req.params.id } });
      if (phoneExists) {
        req.flash('error', 'Phone number is already in use by another mentor.');
        return res.redirect('/admin/mentors');
      }
    }

    // Proceed with updating the mentor
    const updatedMentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        email,
        phoneNumber,
        imageUrl,
        expertise,
        bio
      },
      { new: true }
    );

    req.flash('success', 'Mentor updated successfully.');
    res.redirect('/admin/mentors');
  } catch (error) {
    console.error('Error updating mentor: ', error);
    req.flash('error', 'An error occurred while updating the mentor details.');
    res.redirect('/admin/mentors');
  }
};


// Delete a mentor
exports.delete_mentor = async (req, res) => {
  try {
    await Mentor.findByIdAndRemove(req.params.id);
    req.flash('success', 'Mentor deleted successfully.');
    res.redirect('/admin/mentors');
  } catch (error) {
    console.error('Error deleting mentor:', error);
    req.flash('error', 'Error deleting mentor.');
    res.redirect('/admin/mentors');
  }
};



// Display all mentoring opportunities
exports.display_opportunities = async (req, res) => {
  try {
    // Retrieve all opportunities from the database
    const opportunities = await MentoringOpportunity.find().populate('mentor');

    // Render the opportunities view with the retrieved opportunities
    res.render('admin/opportunities', { opportunities });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    req.flash('error', 'An error occurred while fetching the opportunities.');
    res.redirect('admin/opportunities');
  }
};

// Edit a mentoring opportunity
exports.edit_opportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = await MentoringOpportunity.findById(id);
    const mentors = await Mentor.find(); // Fetch the list of mentors from your database

    if (!opportunity) {
      req.flash('error', 'Opportunity not found.');
      return res.redirect('/admin/opportunities'); // Ensure the path is absolute
    }

    // Render edit form with opportunity and mentors list
    res.render('admin/edit_opportunity', { opportunity, mentors });
  } catch (error) {
    console.error('Error fetching opportunity for edit:', error);
    req.flash('error', 'An error occurred while fetching the opportunity for edit.');
    res.redirect('/admin/opportunities'); // Ensure the path is absolute
  }
};


// Function to display the new opportunity form
exports.new_opportunity_get = async (req, res) => {
  try {
    // Render the new opportunity view with any necessary context
    const mentors = await Mentor.find().select('firstName lastName _id').lean();
    res.render('admin/new_opportunity', { mentors });
  } catch (error) {
    console.error('Error displaying new opportunity form:', error);
    req.flash('error', 'An error occurred while loading the form to add a new opportunity.');
    res.redirect('admin/opportunities');
  }
};


// Update a mentoring opportunity
exports.update_opportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, description, mentorId, date } = req.body;

    const updatedOpportunity = await MentoringOpportunity.findByIdAndUpdate(id, {
      category,
      description,
      mentor: mentorId,
      date
    }, { new: true });

    if (!updatedOpportunity) {
      req.flash('error', 'Opportunity not found.');
      return res.redirect('admin/opportunities');
    }

    req.flash('success', 'Opportunity updated successfully.');
    res.redirect('/admin/opportunities');
  } catch (error) {
    console.error('Error updating opportunity:', error);
    req.flash('error', 'An error occurred while updating the opportunity.');
    res.redirect('/admin/opportunities');
  }
};

exports.create_opportunity = async (req, res) => {
  try {
    const { category, description, mentorId, date } = req.body;
    let opportunity = new MentoringOpportunity({
      category,
      description,
      mentor: mentorId,
      date
    });

    await opportunity.save();
    req.flash('success', 'New mentoring opportunity added successfully.');

    res.redirect('/admin/opportunities');

  } catch (err) {
    console.error('Admin Error - New Opportunity:', err);
    req.flash('error', 'An error occurred while adding the new opportunity.');

    res.redirect('/admin/opportunity/new');
  }
};


// Delete a mentoring opportunity
exports.delete_opportunity = async (req, res) => {
  try {
    await MentoringOpportunity.findByIdAndRemove(req.params.id);
    req.flash('success', 'Mentoring opportunity deleted successfully.');
    res.redirect('/admin/opportunities');
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    req.flash('error', 'Error deleting opportunity.');
    res.redirect('/admin/opportunities');
  }
};

module.exports = exports;
