/*
 * Handlers for User related API endpoints:  /user/
 * Also contains related functions.
 */
const usersService = require('../services/users.service');
const authService = require('../services/auth.service');


module.exports = {
  getAllUsers,
  removeUser,
  updatePassword,
  createUser,
  getStatus
};

// Returns json of all users (no passwords)
async function getAllUsers(req, res, next) {
  usersService.getAllUsers().then(userArr => {
    userArr ? res.json(userArr) :
        res.status(404).json({message: "No users were found"});
  })
  .catch(err => next(err));
}

// Removes the user with the provided username
async function removeUser(req, res, next) {
  const {username} = req.body;
  usersService.deleteUser(username).then(success => {
    success ? res.status(200).json({message: "User " + username + " deleted"}) :
        res.status(400).json({message: "Error deleting user"});
  })
  .catch(err => next(err));
}

// Updates the users current password
async function updatePassword(req, res, next) {
  const {username, unhashedPassword} = req.body;

  // Hash new password
  const hashedPassword = authService.hashPassword(unhashedPassword);

  if(hashedPassword) {
    usersService.updatePassword(username, hashedPassword).then(success => {
      success ? res.status(200).json({message: "Password updated"}) :
          res.status(400).json({message: "Password could not be updated"});
    })
    .catch(err => next(err));
  } else {
    res.status(400).json({message:'Bad request: expected data missing'});
  }
}

/*
 * Creates a new user for the application.
 */
async function createUser(req, res, next) {
  const unvalidatedUser = {firstname, lastname, username, unhashedPassword, role} = req.body;
  const hashedPassword = authService.hashPassword(unhashedPassword);
  const user = {firstname, lastname, username, hashedPassword, role};

  var badParams = validateInputLength(unvalidatedUser);

  if(Object.keys(badParams).length > 0) {
    res.status(422).json(badParams);
    return;
  }

  if(hashedPassword) {
    usersService.insertUser(user).then(success => {
      success ? res.status(200).json({message: "user successfully created"}) :
          res.status(400).json({message: "error creating user"});
    })
    .catch(err => {
      if(err.code === 'ER_DUP_ENTRY') {
        console.log("ERROR HANDLED");
        res.status(409).json({message: "Username already exists"});
      } else {
        res.status(400).json({message: "error creating user"});
      }
    });
  } else {
    res.status(400).json({message: "Bad request: expected data missing"});
  }
}

/*
 * Validates fields for new user.
 */
function validateInputLength(user) {
  var badParams = {};

  if(user.firstname.length > 30) {
    badParams.firstname = 30;
  }

  if(user.lastname.length > 30) {
    badParams.lastname = 30;
  }

  if(user.username.length > 25) {
    badParams.username = 25;
  }

  if(user.unhashedPassword.length > 30) {
    badParams.password = 30;
  }

  return badParams;
}

/*
 * Gets the total number of each user type (admin, user)
 */
async function getStatus(req, res, next) {
  usersService.getStatus().then(status => {
    res.status(200).json(status);
  })
  .catch(err => next(err));
}
