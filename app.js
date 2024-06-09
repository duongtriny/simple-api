const express = require('express');
const app = express();
const port = 3000;
const jwt = require('jsonwebtoken');
const secret = 'Z34mmvdcmQX9d2oNALG7fmy2Xy4RJ+BdYtRnbkRyjrBf';
const { expressjwt: expressjwt } = require("express-jwt");
const timeOut = 60000;
const v4 = require('uuid').v4;
const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'password',
    database: 'test'
  }
});


app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(expressjwt({
  secret: secret,
  algorithms: ["HS256"]
}).unless({ path: ['/', '/login'] }));

app.get('/', (req, res) => {
  knex.select('*').from('customer').then(data => {
    res.send(data);
  });
  // res.send('Hello World!');
})

app.post('/login', (req, res) => {
  // Mock user
  const users = [{
    id: 1,
    username: 'brad',
    role: 'admin',
    password: '123'
  },
  {
    id: 2,
    username: 'john',
    role: 'member',
    password: '465'
  }
  ];
  const payload = req.body;
  if (payload.username && payload.password) {
    const user = users.find(u => u.username === payload.username);
    if (user && user.password === payload.password) {
      payload.role = user.role;
      delete payload.password;
      const token = jwt.sign(payload, secret, { expiresIn: timeOut, algorithm: "HS256" });
      res.send({ token, timeOut});
    }
  }
  res.status(401).send('Unauthorized');
});

// Protected route
app.get('/protected/admin', (req, res) => {
  if (req.auth.role !== 'admin') {
    res.status(403).send('Forbidden');
    return;
  }
  res.send('You are authorized!');
});

app.get('/protected/member', (req, res) => {
  if (req.auth.role !== 'member') {
    res.status(403).send('Forbidden');
    return;
  }
  res.send('You are authorized!');
});

app.post('/user/create', (req, res) => {
  let payload = {};
  payload.firstName = req.body.lastName;
  payload.lastName = req.body.firstName;
  payload.id = v4();
  knex('customer').insert(payload).then(data => {
    res.status(201).send({ message: 'User created successfully', id: payload.id });
  });
});

app.put('/user/update', (req, res) => {
  let payload = req.body;
  // knex('customer').where('id', req.body.id).update(payload).then(data => {
  //   res.status(200).send({ message: 'User updated successfully' });
  // });
  res.status(200).send({ message: 'User updated successfully' });
});

app.delete('/user/delete/:id', (req, res) => {
  // knex('customer').where('id', req.params.id).del().then(data => {
  //   res.status(200).send({ message: 'User deleted successfully' });
  // });
  res.status(200).send({ message: 'User deleted successfully' });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});