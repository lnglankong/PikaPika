import React from 'react';
import { StyleSheet, Text, View, Image, Platform, Button,TouchableOpacity,AsyncStorage} from 'react-native';
import { createStackNavigator, createBottomTabNavigator, createAppContainer, HeaderBackButton, StackActions } from 'react-navigation'
import { SearchBar } from 'react-native-elements';

import AddMediaTab from './AddMediaTab'
import HomeTab from './HomeTab'
import LikesTab from './LikesTab'
import ProfileTab from './ProfileTab'
import SearchTab from './SearchTab'
import EditProfile from './EditProfile'
import ViewComment from './ViewComment'
import Login from './Login'
import CreatePost from './CreatePost'
import firebase from './Firebase.js'


export default class Main extends React.Component {

  render() {
    //const profilePictureURL = this.state.profilePicture;
    return (
      <AppTabNavigator />
    );
  }
}

// class MySearchBar extends React.Component {
//   state = {
//     search: '',
//   };
//
//   updateSearch = search => {
//     this.setState({ search });
//   };
//
//   render() {
//     const { search } = this.state;
//
//     return (
//       <SearchBar
//        // placeholder="Type Here..."
//         onChangeText={this.updateSearch}
//         value={search}
//        // containerStyle = {{width: '100%'}}
//         inputStyle={{backgroundColor: 'white'}}
//         //lightTheme = {true}
//         searchIcon={false}
//         inputContainerStyle={{backgroundColor: 'white', width: '100%', height:'90%', flex:1, marginTop:-1}}
//         containerStyle={{backgroundColor: 'white', borderWidth: 1.5, borderRadius: 15, width: '100%', height:'95%'}}
//         placeholder={'Search'}
//         keyboardType = {'web-search'}
//       />
//     );
//   }
// }

handleLoggedOut = async (navigation) => {
  // clear the storage and authToken when logged out
  console.log('attemp to logout')
  await AsyncStorage.removeItem('authToken')
  
  firebase.auth().signOut().then(navigation.navigate("Login"))
}

const navigationOptionsEditProfile = ({ navigation }) => ({
    headerLeft: <HeaderBackButton onPress={() => navigation.goBack(null)} />,
})

const navigationOptionsViewComment = ({ navigation }) => ({
    headerLeft: <HeaderBackButton onPress={() => navigation.goBack(null)} />,
})

const navigationOptionsCreatePost = ({ navigation }) => ({
  headerLeft: <HeaderBackButton onPress={() => navigation.goBack(null)} />,
})

const navigationOptionsLogout = ({ navigation }) => ({
  headerRight: <Button title="logout" onPress={() => navigation.navigate('Login')} />,
  headerLeft: <HeaderBackButton onPress={() => navigation.goBack(null)} />,
})

const navigationOptionsOtherProfile = ({ navigation }) => ({
  headerTitleStyle: { alignSelf: 'center', flex:1},
  headerStyle: {
    backgroundColor:'#FFB6C1',
  },
  headerLeft: <HeaderBackButton onPress={() => navigation.goBack(null)} />,
  title: 'Profile',
})

const ProfileTabStackNavigator = createAppContainer(


  createStackNavigator(
  {
    ProfileTab:{ // view for profile
      screen: ProfileTab,
      navigationOptions: ({ navigation, screenProps }) => ({// options for header
        title: 'Profile',
        headerStyle: {
          backgroundColor:'#FFB6C1',
        },
        headerTitleStyle: { alignSelf: 'center', flex:1 },
        headerRight: (
          <TouchableOpacity
            onPress={this.handleLoggedOut}>
            <Image
              style = {{width:35, height:35, marginRight:8}}
              source={require('./assets/images/logout.png')}
            />

         </TouchableOpacity>
        ),
      }),

    },

    EditProfile:{ // view for edit profile, which is inside profile view
      screen: EditProfile,
      navigationOptionsEditProfile
    },
    ViewComment:{ // show comments of a post
      screen: ViewComment,
      navigationOptionsViewComment
    }

  }
)
);


const HomeTabStackNavigator = createAppContainer(createStackNavigator(
  {
    HomeTab:{
      screen: HomeTab,
      navigationOptions: ({ navigation, screenProps }) => ({// options for header
        title: 'Home',
        headerStyle: {
          backgroundColor:'#FFB6C1',
        },
        headerTitleStyle: { alignSelf: 'center', flex:1 },
        headerRight: (
          <TouchableOpacity
            onPress={() =>navigation.navigate('SearchTab')}>
            <Image
              style = {{width:41, height:41, marginRight:8}}
              source={require('./assets/images/search.png')}
            />
         </TouchableOpacity>
        ),
      })
    },

    ViewComment:{ // show comments of a post
      screen: ViewComment,
      navigationOptionsViewComment
    },

    SearchTab:{
      screen: SearchTab
      },

      ProfileTabInSearch:{ // view for profile
        screen: ProfileTab,
        navigationOptionsOtherProfile,
        navigationOptions:{
          headerTitleStyle: { alignSelf: 'center', flex:1},
          headerStyle: {
            backgroundColor:'#FFB6C1',
          },
          title: 'Profile',
        }
      }

    }


));

// const SearchTabStackNavigator = createAppContainer(createStackNavigator(
//   {
//     SearchTab:{
//       screen: SearchTab,
//       navigationOptions: {// options for header
//         title: 'Search',
//         headerStyle: {
//           backgroundColor:'#FFB6C1',
//         },
//         headerTitleStyle: { alignSelf: 'center', flex:1 },
//       }
//     }
//   }
// ));

const LikesTabStackNavigator = createAppContainer(createStackNavigator(
  {
    LikesTab:{
      screen: LikesTab,
      navigationOptions: {
        title: "Notifications",
        headerStyle: {
          backgroundColor: '#FFB6C1',
        },
        headerTitleStyle: { alignSelf: 'center', flex:1 },
      }
    }
  }
));

const AddMediaTabStackNavigator = createAppContainer(createStackNavigator(
  {
    AddMediaTab:{
      screen: AddMediaTab,
      navigationOptions: {// options for header
        title: 'Media',
        headerBackTitle: 'Back',
        headerStyle: {
          backgroundColor:'#FFB6C1',
        },
        headerTitleStyle: { alignSelf: 'center', flex:1},
      }
    },

    CreatePost:{ 
      screen: CreatePost,
      navigationOptionsCreatePost
    }
  },
));


const AppTabNavigator = createAppContainer(createBottomTabNavigator(
    {

      HomeTab: {
          screen: HomeTabStackNavigator,
          navigationOptions: {
            tabBarIcon: ({focused}) => ( // insert image for the home button
              <Image style={{ width: 58, height: 58, marginTop:15 }}
                     source={focused? require('./assets/images/house_colored.png'): require('./assets/images/house.png')} />
            )
          }
      },


      AddMediaTab: {
          screen: AddMediaTabStackNavigator,
          navigationOptions: {
            tabBarIcon: ({focused}) =>(
              focused?
            <Image style={{ width: 54, height: 54, marginTop:15 }} source={require('./assets/images/camera_colored.png')} />:
            <Image style={{ width: 54, height: 54, marginTop:15 }} source={require('./assets/images/camera.png')} />
            )}
      },

      LikesTab: {
        screen: LikesTabStackNavigator,
      },

      ProfileTab: {
          screen: ProfileTabStackNavigator,

          navigationOptions: {
            tabBarIcon: ({focused}) =>
              <Image style={{ width: 54, height: 54, marginTop:15 }}
                    source={focused? require('./assets/images/profile_colored.png'):require('./assets/images/profile.png')} />,

          },

      }

    },
    {
      animationEnabled: true,
      swipeEnabled: true,
      tabBarPosition: "bottom",
      tabBarOptions: {
          style: {
            backgroundColor:'#FFB6C1',
          },
          inactiveTintColor: '#d1cece',
          showLabel: false,
          showIcon: true
      }
  }
)
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFB6C1',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
