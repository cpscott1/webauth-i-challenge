const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const SessionStore = require('connect-session-knex')(session);

const db = require('./data/dbConfig.js');
const Users = require('./users/user-model.js');
const restricted = require('./auth/restricted-middleware.js');
const configureKnex = require('./data/dbConfig.js');

const server = express();

const sessionConfig = {
  name: 'monster',
  secret: 'do not tell anyone',
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 1,
    secure: false,
  },
  resave: false,
  saveUninitialized: false,
  store: new SessionStore({
    knex: configureKnex,
    tablename: 'sessions',
    sidfieldname: 'sid',
    createTable: true,
    clearInterval: 1000 * 60 * 30,
  })
};

server.use(session(sessionConfig));
server.use(helmet());
server.use(express.json());

server.get('/', (req, res ) => {
  res.json({ api: 'up' })
})

server.post('/api/register', (req, res) => {
  let user = req.body;

  const hash = bcrypt.hashSync(user.password, 10);

  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(err => {
      res.status(500).json(err);
    })
})

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        res.status(200).json({ message: `Welcome ${user.username}` })
      } else {
        res.status(401).json({ message: 'Invalid Credentials' })
      }
    })
})

server.get('/api/logout'), (req, res) => {
  if(req.session) {
    req.session.destroy(err => {
      if(err) {
        res.status(500).json({ message: 'you can try to get out but you can not leave' })
      } else {
        res.status(200).json({ message: 'bye, thanks for visitng' })
      }
    })
  } else {
    res.status(200).json({ message: 'bye, thanks for visiting' })
  }
}

server.get('/api/users', restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

const port = 5000;
server.listen(port, () => {
  console.log(`Listening on port ${port}...`)
})
