const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const mustacheExpress = require('mustache-express');
require('dotenv').config();
const passport = require('passport');
const flash = require('connect-flash');




const app = express();
const PORT = process.env.PORT || 3000;

// Mongoose connection to MongoDB
const URI = process.env.MONGODB_URI || 'your_default_local_db_uri';

mongoose.set("strictQuery", false);
mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { console.log("Successfully connected to MongoDB."); })
    .catch((error) => { console.error("Error connecting to MongoDB: " + error); });

// Set Mustache as the view engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: 'very secret',
  resave: false,
  saveUninitialized: true
}));

// Initialize flash
app.use(flash());

// Make flash messages available to all templates
app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Require your passport configuration somewhere here
require('./config/passport')(passport);

// Define routes after initializing flash and passport
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const generalRoutes = require('./routes/generalRoutes');
const isAdmin = require('./middleware/isAdmin');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const methodOverride = require('method-override');

// Use routes
app.use(methodOverride('_method'));
app.use('/admin', adminRoutes);
app.use('/student', studentRoutes);
app.use('/', generalRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
