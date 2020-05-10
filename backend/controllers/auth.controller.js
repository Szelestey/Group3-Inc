const authService = require('../services/auth.service');

var inMemJWTs = [];

module.exports = {
  authenticate,
  logout,
  validateJWT,
  addJWT,
  removeJWT
};

// Validates username & password against the database and then issues the user
// a cookie that contains a json web token
async function authenticate(req, res, next) {
  const {username,password} = req.body;
  authService.authenticate(username, password)
  .then(user => {
    if(user) {
      const {username, role, token} = user;
      const cookieConfig = {httpOnly: true, sameSite: true}
      res.cookie('auth', token, cookieConfig);
      inMemJWTs.push(token);
      res.status(200).json({ 'username': username, 'ad-auth': (role === 'admin') });
      next();
    } else {
      res.status(400).json({message: 'Username or password is incorrect'});
    }
  })
  .catch(err => next(err));
}

// Sets the users auth cookie to 'bad', removing their jwt
async function logout(req, res, next) {
  res.cookie('auth', 'bad', {httpOnly: true, sameSite: true});
  res.send();
}


function removeJWT(token) {
  var index = inMemJWTs.indexOf(token);
  if(index !== -1) {
    inMemJWTs.splice(index, 1);
  }
}


function addJWT(token) {
  inMemJWTs.push(token);
}


function validateJWT(token) {
  return inMemJWTs.indexOf(token) >= 0;
}
