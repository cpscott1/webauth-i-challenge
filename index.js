const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs')

const db = require('./data/dbConfig.js');
const Users = require('./users/user-model.js');

const server = express();

server.use(helmet());
server.use(express.json());

server.get('/', (req, res ) => {
  res.send('<h2>Yo Yo Yo!!!</h2>')
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
        res.status(200).json({ message: `Welcome ${user.username}` })
      } else {
        res.status(401).json({ message: 'Invalid Credentials' })
      }
    })
})

server.get('/api/users', (req, res) => {
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
