const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');

dotenv.config();

const app = express();
app.use(express.json());

app.use('',authRoutes);
app.use('',gameRoutes);

const server = app.listen(5000,console.log("Server started at port 5000"));