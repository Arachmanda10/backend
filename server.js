require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const predictionRoutes = require('./routes/predict');
const errorHandler = require('./utils/errorHandler');

const serviceAccount = require('./service-accounts.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "equilibrare-425011.appspot.com"
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/predict', predictionRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
