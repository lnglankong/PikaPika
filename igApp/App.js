import { SwitchNavigator } from 'react-navigation'
import * as firebase from 'firebase'

import Loading from './Loading'
import Login from './Login'
import Main from './Main'

// Initialize firebase
const firebaseConfig = {
  apiKey: "AIzaSyBF1_cjUctLu7QtlOh-T-3xpaePS_8So5U",
  authDomain: "ecs165a.firebaseapp.com",
  databaseURL: "https://ecs165a.firebaseio.com",
  storageBucket: "ecs165a.appspot.com",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const App = SwitchNavigator (
  {
    Loading,
    Login,
    Main
  },
  {
    initialRouteName: 'Loading'
  }
)

export default App
