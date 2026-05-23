const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth',    require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/lessons', require('./routes/lessonRoutes'));
app.use('/api/tasks',   require('./routes/taskRoutes'));
app.use('/api/users',   require('./routes/userRoutes'));
app.use('/api/achievements', require('./routes/achievementRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;