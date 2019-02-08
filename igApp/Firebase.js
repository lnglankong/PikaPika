import * as firebase from 'firebase';

// Initialize firebase
const firebaseConfig = {
  apiKey: "AIzaSyBF1_cjUctLu7QtlOh-T-3xpaePS_8So5U",
  authDomain: "ecs165a.firebaseapp.com",
  databaseURL: "https://ecs165a.firebaseio.com",
  storageBucket: "ecs165a.appspot.com",
};

firebase.initializeApp(firebaseConfig);

export default firebase;
