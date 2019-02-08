import Loading from './Loading'
import Login from './Login'
import Main from './Main'

import { createSwitchNavigator, createAppContainer } from 'react-navigation'

const App = createAppContainer(createSwitchNavigator (
  {
    Loading,
    Login,
    Main
  },
  {
    initialRouteName: 'Loading'
  }
));

export default App
