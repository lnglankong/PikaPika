import Loading from './Loading'
import Login from './Login'
import Main from './Main'
import SignUp from './SignUp'
import MainStackNavigator from './MainStackNavigator'

import { createSwitchNavigator, createAppContainer } from 'react-navigation'

const App = createAppContainer(createSwitchNavigator (
  {
    Loading,
    Login,
    SignUp,
    MainStackNavigator,
    Main
  },
  {
    initialRouteName: 'Loading'
  }
));
console.disableYellowBox = true;
export default App
