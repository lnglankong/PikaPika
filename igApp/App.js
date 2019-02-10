import Loading from './Loading'
import Login from './Login'
import Main from './Main'
import SignUp from './SignUp'

import { createSwitchNavigator, createAppContainer } from 'react-navigation'

const App = createAppContainer(createSwitchNavigator (
  {
    Loading,
    Login,
    SignUp,
    Main
  },
  {
    initialRouteName: 'Loading'
  }
));

export default App
