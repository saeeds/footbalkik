'use strict';

const passport = require('passport');
const User = require('../models/user');
const loaclStrategy = require('passport-local').Strategy;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use('local.signup', new loaclStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, done) => {
  User.findOne({ 'email': email }, (err, user) => {
    //check if there is error
    if (err) {
      return done(err);
    }
    //check if there is user in the database
    if (user) {
      return done(null, false, req.flash('error', 'User with email alreay exsit'));
    }
    //Create new user object 
    const newUser = new User();
    newUser.username = req.body.username;
    newUser.email = req.body.email;
    newUser.password = newUser.encryptPassword(req.body.password);
    //save the user to database
    newUser.save((err) => {
      done(null, newUser);
    });

  });
}));


passport.use('local.login', new loaclStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, done) => {
  User.findOne({ 'email': email }, (err, user) => {
    //check if there is error
    if (err) {
      return done(err);
    }
    //validate the user
    const messages = [];
    if (!user || !user.validUserPassword(password)) {
      messages.push('Email Does Not Exit or Password is Invalid')
      return done(null, false, req.flash('error', messages));
    }
    //if the user valid
    return done(null, user);
  });
}));