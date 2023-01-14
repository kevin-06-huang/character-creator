require('dotenv').config();

const path = require('path');
const express = require('express');

const userController = require('./controllers/userController');
const cookieController = require('./controllers/cookieController');
const sessionController = require('./controllers/sessionController');

const app = express();
const PORT = process.env.PORT || 3000;

const { json, urlencoded } = require('express');

app.use(json());
app.use(urlencoded({ extended: true }));

// landing page route for signing in for existing users
app.get('/', (req, res) => res.status(200).sendFile(path.join(__dirname, '../client', 'login', 'login.html')));

// route for post for login in (when user click login button with login info)
app.post('/login',
  userController.verifyUser,
  sessionController.startSession,
  cookieController.setSSIDCookie,
  (req, res) => {
    res.redirect('/app');
  });

// route for new users to sign up
app.get('/signup', 
  (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'login', 'signup.html'));
  });

// route for post for sign up (when user sign up with sign up info)
app.post('/signup', 
  userController.createUser,
  sessionController.startSession,
  cookieController.setSSIDCookie,
  (req, res) => {
    res.redirect('/app');
});

// if user is logged in/signed up (which means they will have a valid session), they will be served the index.html
// which is entry point for app
app.get('/app',
  sessionController.isLoggedIn,
  (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'index.html'));
});

/**
 * 404 handler - catch all for all invalid route
 */
app.use('*', 
  (req,res) => {
    res.status(404).send('Not Found');
});

// default error handler
app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 400,
    message: { err: 'An error occurred' }
  };
  const errorObj = Object.assign({}, defaultErr, {message: {err: err}});
  console.log(`${errorObj.log}`);
  
  return res.status(errorObj.status).json(errorObj.message);
});
  
  /**
   * start server
   */
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
  
module.exports = app;
