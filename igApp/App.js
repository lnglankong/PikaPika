import Loading from './Loading'
import Login from './Login'
import Main from './Main'
import SignUp from './SignUp'
import MainStackNavigator from './MainStackNavigator'

import { createSwitchNavigator, createAppContainer } from 'react-navigation'

export const App = createAppContainer(createSwitchNavigator (
  {
    Loading:{
      screen:Loading
    },
    Login:{
      screen: Login
    },
    SignUp:{
      screen:SignUp
    },
   // MainStackNavigator,
    Main:{
      screen:Main
    }
  },
  {
    initialRouteName: 'Loading'
  }
));
console.disableYellowBox = true;
export default App
