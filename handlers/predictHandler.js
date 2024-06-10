const tf = require('@tensorflow/tfjs-node');
const admin = require('firebase-admin');
const sw = require('stopword');
const natural = require('natural');

let model;

// Load the model
const loadModel = async () => {
  model = await tf.loadLayersModel('https://storage.googleapis.com/equilibrare-425011.appspot.com/Model%20Prediction%20Equilibrare/model.json');
  console.log('Model loaded successfully');
};

loadModel();

// Function to preprocess text input
const preprocessText = (text) => {
  console.log('Original text:', text);

  // Remove punctuation
  let cleanText = text.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ");
  console.log('Text after removing punctuation:', cleanText);

  // Remove numbers
  cleanText = cleanText.replace(/[0-9]/g, '');
  console.log('Text after removing numbers:', cleanText);

  // Convert to lowercase
  cleanText = cleanText.toLowerCase();
  console.log('Text after converting to lowercase:', cleanText);

  // Tokenize
  const tokenizer = new natural.WordTokenizer();
  let tokens = tokenizer.tokenize(cleanText);
  console.log('Tokenized text:', tokens);

  // Remove stopwords
  tokens = sw.removeStopwords(tokens, sw.id);
  console.log('Text after removing stopwords:', tokens);

  // Convert tokens to tensor (This is an example, actual implementation depends on your model's requirements)
  const inputTensor = tf.tensor2d([tokens.map(token => token.charCodeAt(0))], [1, tokens.length]);
  console.log('Input tensor:', inputTensor);

  return inputTensor;
};

const predict = async (req, res) => {
  const idToken = req.headers.authorization.split('Bearer ')[1];
  const { text } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Preprocess the text input
    const inputTensor = preprocessText(text);

    // Make the prediction
    const prediction = model.predict(inputTensor).dataSync()[0];
    console.log('Prediction:', prediction);

    // Determine the label
    const label = prediction > 0.5 ? "terdeteksi anxieaty" : "normal";
    console.log('Label:', label);

    // Save the prediction to Firestore
    const db = admin.firestore();
    await db.collection('predictions').add({
      uid: uid,
      text: text,
      prediction: prediction,
      label: label,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ prediction: prediction, label: label });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

const getHistories = async (req, res) => {
  const idToken = req.headers.authorization.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const db = admin.firestore();
    const querySnapshot = await db.collection('predictions').where('uid', '==', uid).orderBy('timestamp', 'desc').limit(30).get();

    const histories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(histories);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  predict,
  getHistories
};
