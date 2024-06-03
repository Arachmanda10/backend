const admin = require('firebase-admin');
const axios = require('axios');

const signup = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password
    });
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    res.json({ token: customToken });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`, {
      email: email,
      password: password,
      returnSecureToken: true
    });
    const idToken = response.data.idToken;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const customToken = await admin.auth().createCustomToken(decodedToken.uid);
    res.json({ token: customToken });
  } catch (error) {
    next(error);
  }
};

const googleLogin = async (req, res, next) => {
  const { idToken } = req.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const customToken = await admin.auth().createCustomToken(decodedToken.uid);
    res.json({ token: customToken });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  googleLogin
};
