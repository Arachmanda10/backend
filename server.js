require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const errorHandler = require('./utils/errorHandler');

const serviceAccount = require('service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
