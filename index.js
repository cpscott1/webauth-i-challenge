const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs')

const server = express();

server.use(helmet());
server.use(express.json());

server.get('/', (req, res ) => {
  res.send('<h2>Yo Yo Yo!!!</h2>')
})

const port = 5000;
server.listen(port, () => {
  console.log(`Listening on port ${port}...`)
})
