const admin = require('firebase-admin');

const getProfile = async (req, res, next) => {
  const idToken = req.headers.authorization.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userRecord = await admin.auth().getUser(decodedToken.uid);
    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  const { uid, displayName, photoURL } = req.body;
  try {
    await admin.auth().updateUser(uid, {
      displayName: displayName,
      photoURL: photoURL
    });
    res.status(200).send("Profil pengguna berhasil diperbarui.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile
};
