const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const CoachingUser = require('../models/coachingUser'); // Adjust the path as necessary

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
      // Match user
      CoachingUser.findOne({
        username: username
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That username is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            console.log('Database password:', user.password);
            console.log('Entered password hash:', bcrypt.hashSync(password, 10));
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: 'Password incorrect' });
            }
          });
          
      });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    CoachingUser.findById(id)
      .then(user => {
        done(null, user); // null for the error argument, because there is no error
      })
      .catch(err => {
        done(err, null); // pass the error to done
      });
  });
  
};
