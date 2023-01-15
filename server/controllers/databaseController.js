const sqlDB = require('../database/dndModels');

const SALT_WORK_FACTOR = 10;
const bcrypt = require('bcryptjs');

const databaseController = {};

databaseController.addUser = async (req, res, next) => {
  let { username, password } = res.locals;

  const query = `
  INSERT INTO users (username, password)
  VALUES ($1, $2)
  RETURNING player_id;`;

  try {
    const hash = await bcrypt.hash(password, SALT_WORK_FACTOR);
    const params = [username, hash];
    const newUser = await sqlDB.query(query, params);

    res.locals.newUser = newUser;
    res.locals.id = newUser.rows[0].player_id;

    return next();
  } catch (err) {
    return next({
        log: 'Express error handler caught databaseController.addUser error',
        message: { err: err },
        redirect: '/signup'
      })
  }
};

databaseController.getUser = async (req, res, next) => {
    let { username, password } = res.locals;
    const params = [username];

    bcrypt.hash(password, SALT_WORK_FACTOR, (err, hash) => {
      if (err) return next(err);
      password = hash;
  });
  
    const query = `SELECT player_id, password FROM users WHERE username = $1`;
  
    try {
      const data = await sqlDB.query(query, params);
      if (data.rows.length === 0) throw "User not found!"

      console.log(data.rows[0]);

      const databasePassword = data.rows[0].password;

      const id = data.rows[0].player_id;

      if (databasePassword !== password) throw "Password incorrect!";

      else {
        res.locals.id = id;
        return next()
      };
    } catch (err) {
      if (err === "Password incorrect!") {
        return next({
            log: 'Express error handler caught databaseController.getUser error',
            message: { err: err },
            redirect: '/'
          })
      }

      return next({
        log: 'Express error handler caught databaseController.getUser error',
        message: { err: err },
        redirect: '/'
      })
    }
};

databaseController.startSession = async (req, res, next) => {
  const params = [res.locals.user.id]; // need to set this value somewhere else

  const query = `INSERT INTO sessions (cookieId) VALUE $1`;

  try {
    const data = await sqlDB.query(query, params);
    return next();
  } catch (err) {
    return next({
      log: 'Express error handler caught databaseController.startSession error',
      message: { err: err },
      redirect: true
    })
  }
};

  databaseController.isLoggedIn = async (req, res, next) => {
    const params = [req.cookies.ssid];
  
    const query = `SELECT cookieId FROM sessions WHERE cookieId = $1`;
  
    try {
      const data = await sqlDB.query(query, params);

      if (params !== data) res.redirect('/signup');
      else return next();
    } catch (err) {
      return next({
        log: 'Express error handler caught databaseController.isLoggedIn error',
        message: { err: err },
        redirect: '/'
      })
    }
};


module.exports = databaseController;
