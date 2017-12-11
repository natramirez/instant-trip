const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');
// const config = require('./config');

var dbUri = 'mongodb://react-auth:react123@ds135522.mlab.com:35522/react-auth-example';
// connect to the database and load models
require('./server/models').connect(dbUri);

const app = express();
// tell the app to look for static files in these directories
app.use(express.static('./server/static/'));
app.use(express.static('./client/dist/'));
// tell the app to parse HTTP body messages
app.use(bodyParser.urlencoded({ extended: true }));

// pass the passport middleware
app.use(passport.initialize());

// load passport strategies
const localSignupStrategy = require('./server/passport/local-signup');
const localLoginStrategy = require('./server/passport/local-login');
passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

// pass the authorization checker middleware
const authCheckMiddleware = require('./server/middleware/auth-check');
app.use('/api', authCheckMiddleware);

// routes
const authRoutes = require('./server/routes/auth');
const apiRoutes = require('./server/routes/api');
const planRoutes = require('./server/routes/plan');

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/plan', planRoutes);
app.get('*', function (request, response){
  response.sendFile(path.join(__dirname, '/server','/static', 'index.html'));
})



// start the server
var port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port number ${port}`);
});
