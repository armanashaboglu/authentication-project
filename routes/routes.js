const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var SHA3 = require("crypto-js/sha3");

const db = "mongodb://127.0.0.1:27017/authentication";
var authenticationToken = null;

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));


const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  }
});

const User = mongoose.model('User', UserSchema);

const TaskSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  tasks: [{
    taskId: {
      type: String,
      required: true,
      unique: true
    },
    text: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  }]
});

const Task = mongoose.model('Task', TaskSchema);


var login = function (req, res) {
  // res.redirect('/login');
  // res.set('Access-Control-Allow-Origin', 'http://localhost:3005');
  console.log(req.session.message);
  if (authenticationToken != null) {
    req.session.message = "You have already logged in. Logout first.";
    res.redirect('/home');
  } else {
    res.render('../views/login2.ejs', { message: req.session.message });
  }
};

var signUp = function (req, res) {
  // res.set('Access-Control-Allow-Origin', 'http://localhost:3005');
  req.session.message = null;
  res.render("../views/signup.ejs")
};

var home = function (req, res) {
  // res.set('Access-Control-Allow-Origin', 'http://localhost:3005');
  console.log(authenticationToken);
  if (authenticationToken == null) {
    req.session.message = "Please login in first.";
    res.redirect('/');
  } else {
    res.render("../views/home.ejs",{ message: req.session.message });
  }
};

var createAccount = function (req, res) {
  // res.set('Access-Control-Allow-Origin', 'http://localhost:3005');
  console.log("Creating account...");
  console.log("email: " + req.body.email + " username: " + req.body.username + " password: " + req.body.password );

  if (!req.body.email || !req.body.username) {
    res.render("../views/home.ejs",{ message: 'Both email and username are required.' });
    return;
  }
  if (!req.body.password) {
    res.render("../views/home.ejs",{ message: 'Enter a password.' });
    return;
  }

  User.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] })
    .then(user => {
      if (user) {
        return res.status(400).json({ message: 'Email or Username already exists' });
      }
      var hashedPassword = SHA3(req.body.password).toString();
      
      const newUser = new User({
        email: req.body.email,
        username: req.body.username,
        password: hashedPassword
      });
      newUser.save()
        .then(user => {
          console.log("we created the new user, redirecting back to login");
          res.json({ success: true, redirectTo: '/' });
        })
        .catch(err => res.status(400).json(err));
    });
};


var checkLogin = function (req, res) {
  console.log("made it to checklogin");
  // res.set('Access-Control-Allow-Origin', 'http://localhost:3005');
  var emaiL = req.body.email;
  var userName = req.body.username;
  var passworD = SHA3(req.body.password).toString();
  
  User.findOne({email: emaiL, username: userName, password: passworD}
  ).then((data) => {
    if (!data) {
      // res.send("User not found.")
      res.json({ success: false, message: 'Invalid login' });
    } else {
      console.log("Logged in successfully");
      authenticationToken = 1;
      res.json({ success: true, username: userName, email: emaiL, password: passworD });
    }
  })
};

var addAccountOAuth2 = function (profile, token) {
  // res.set('Access-Control-Allow-Origin', 'http://localhost:3005');
  console.log("starting the log in");
  var username = profile.given_name + profile.family_name;
  var email = profile.email;
  authenticationToken = token;

  User.findOne({ $or: [{ email: email }, { username: username }] })
    .then(user => {
      if (user) {
        console.log("user already exists, no need to re-add, letting through");
        return null;
      }
      
      const newUser = new User({
        email: email,
        username: username
      });

      newUser.save()
        .then(user => console.log(user))
        .catch(err => console.log('Error saving user:', err));
      console.log("You are logged in!");
    });
}

var logout = function (req, res) {
  // res.set('Access-Control-Allow-Origin', 'http://localhost:3005');
  authenticationToken = null;
  req.session.message = null;
  req.session.destroy((err) => {
      if (err) {
          console.log('Error while destroying session:', err);
      } else {
          req.logout(() => {
              console.log('You are logged out');
              res.redirect('/');
          });
      }
  });
}

var logout2 = (req, res) => {
    // req.logout(function(err) {
    //   if (err) { return next(err); }
    //   res.redirect('/');
    // });
    
    res.clearCookie('username');
    console.log('cookies cleared');
    // console.log(req.cookies);
    res.json({ success: true, message: 'Logged out successfully.' });
};

var addTask = function (req, res) {
  // res.set('Access-Control-Allow-Origin', 'http://localhost:3005');
    const username = req.body.username;
    const task = req.body.task;
    const taskId = req.body.taskId;

  // Find the user by username
  Task.findOne({ username: username })
    .then(user => {
      // If user exists, push the new task to their tasks array
      if (user) {
        console.log('Adding task to ' + username + 's tasks');
        console.log(user.tasks);
        console.log(task);
        user.tasks.push({text: task, completed: false, taskId: taskId });
        console.log(user.tasks);
        user.save()
          .then(() => res.json({ success: true, message: 'Task added successfully.' }))
          .catch(err => {
            console.error("Save Error:", err);
            res.json({ success: false, message: 'Error saving task.', error: err });
          });
      } else {
        // If user doesn't exist, create a new user with the task
        console.log('user does not exist in task db from add task');
        console.log('adding them with username: ' + username);
        const newUser = new Task({
          username: username,
          tasks: [{text: task, completed: false, taskId: taskId}]
        });
        newUser.save()
          .then(() => res.json({ success: true, message: 'User and task created successfully.' }))
          .catch(err => res.json({ success: false, message: 'Error creating user and task.', error: err }));
      }
    })
    .catch(err => res.json({ success: false, message: 'Error adding task.', error: err }));
};

var deleteTask = function (req, res) {
  // res.set('Access-Control-Allow-Origin', 'http://localhost:3005');
    const { username, taskId } = req.body;

    Task.findOne({ username })
        .then(userTasks => {
            if (userTasks) {
              console.log('deleting task  ' + taskId + ' from ' + username + 's tasks');
                userTasks.tasks = userTasks.tasks.filter(task => task.taskId !== taskId);
                console.log(userTasks.tasks);
                userTasks.save()
                    .then(() => res.json({ success: true }))
                    .catch(err => res.status(500).json({ success: false, error: err.message }));
            } else {
              console.log('we could not find user in task db to delete task');
                res.status(404).json({ success: false, message: "User not found" });
            }
        })
        .catch(err => res.status(500).json({ success: false, error: err.message }));
};

// var deleteTask = (req, res) => {
//   const taskId = req.body.taskId;
//   Task.findByIdAndRemove(taskId, (err) => {
//     if (err) {
//       return res.json({ success: false, message: 'Error deleting task.' });
//     }
//     return res.json({ success: true, message: 'Task deleted successfully.' });
//   });
// };

var getTasks = (req, res) => {
  // res.set('Access-Control-Allow-Origin', 'http://localhost:3005');
  const username = req.body.username;

    Task.findOne({ username: username })
    .then(user => {
      // If user exists, return their tasks
      if (user) {
        console.log('The user already has existing tasks in get tasks');
        console.log(user.tasks);
        return res.json({ success: true, tasks: user.tasks });
      } else {
        // If user doesn't exist, create a new user with an empty tasks array
        console.log('The user does not exist in tasks db from get tasks');
        const newUser = new Task({
          username: username,
          tasks: []
        });
        newUser.save()
          .then(() => res.json({ success: true, tasks: [] }))  // Return an empty tasks array
          .catch(err => res.json({ success: false, message: 'Error creating user.', error: err }));
      }
    })
    .catch(err => res.json({ success: false, message: 'Error fetching tasks.', error: err }));

};





var routes = {
  signup: signUp,
  login: login,
  home: home,
  checkLogin: checkLogin,
  createAccount: createAccount,
  addAccountOAuth2: addAccountOAuth2,
  logout: logout2,
  addTask: addTask,
  deleteTask: deleteTask,
  getTasks: getTasks,
};

module.exports = routes;