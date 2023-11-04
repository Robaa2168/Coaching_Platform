//controllers/authController.js

const bcrypt = require('bcryptjs');
const passport = require('passport');
const CoachingUser = require('../models/coachingUser');

// Display the signup form
exports.signup_get = (req, res) => {
    res.render('signup');
};

// Handle the signup form submission
exports.signup_post = async (req, res) => {
    try {
        const { username, password, firstName, lastName, email, phoneNumber } = req.body;
        let user = await CoachingUser.findOne({ $or: [{ username: username }, { email: email }] });

        if (user) {
            req.flash('error', 'Username or Email already exists.');
            return res.redirect('/auth/signup');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new CoachingUser({
            username: username,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName,
            email: email,
            phoneNumber: phoneNumber,
            role: 'student' // Default role is student, could be changed during creation or by an admin later
        });

        await user.save();
        req.flash('success', 'You are now registered and can log in.');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.redirect('/auth/signup');
    }
};

// Display the login form
exports.login_get = (req, res) => {
    res.render('login');
};

// Handle the login form submission
exports.login_post = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            req.flash('error', err.message);
            return next(err);
        }
        if (!user) {
            req.flash('error', info.message);
            return res.redirect('/auth/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                req.flash('error', err.message);
                return next(err);
            }
            // User is authenticated, now you can check the role and redirect accordingly
            switch (user.role) {
                case 'admin':
                    return res.redirect('/admin/dashboard');
                case 'student':
                    return res.redirect('/student/dashboard');
                case 'mentor':
                    return res.redirect('/mentor/dashboard');
                // Add more roles and their redirects as needed
                default:
                    req.flash('error', 'Role not recognized, contact support.');
                    return res.redirect('/auth/login');
            }
        });
    })(req, res, next);
};

// Handle logout with a callback
exports.logout_get = (req, res) => {
    req.logout(function (err) {
        if (err) { 
            return next(err); 
        }
        req.flash('success', 'You are logged out.');
        res.redirect('/');
    });
};

