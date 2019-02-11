import React from 'react';
import { StyleSheet, Text, View, Image, Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator, createAppContainer, HeaderBackButton } from 'react-navigation'

import AddMediaTab from './AddMediaTab'
import HomeTab from './HomeTab'
import LikesTab from './LikesTab'
import ProfileTab from './ProfileTab'
import SearchTab from './SearchTab'
import EditProfile from './EditProfile'

export default class Main extends React.Component {

  render() {
    //const profilePictureURL = this.state.profilePicture;
    return (
      <AppTabNavigator />
    );
  }
}

const navigationOptionsEditProfile = ({ navigation }) => ({
    headerLeft: <HeaderBackButton onPress={() => navigation.goBack(null)} />,
})

const ProfileTabStackNavigator = createAppContainer(createStackNavigator(
  {
    ProfileTab:{
      screen: ProfileTab,
      navigationOptions: {
        headerTitleStyle: { alignSelf: 'center', flex:1 },
        title: 'Profile',
      },
    },

    EditProfile:{
      screen: EditProfile,
      navigationOptionsEditProfile
    }
  }
));

const LikesTabStackNavigator = createAppContainer(createStackNavigator(
  {
    LikesTab:{
      screen: LikesTab,
      navigationOptions: {
        title: 'Likes',
        headerTitleStyle: { alignSelf: 'center', flex:1 },
      }
    }
  }
));

const HomeTabStackNavigator = createAppContainer(createStackNavigator(
  {
    HomeTab:{
      screen: HomeTab,
      navigationOptions: {
        title: 'Home',
        headerTitleStyle: { alignSelf: 'center', flex:1 },
      }
    }
  }
));

const SearchTabStackNavigator = createAppContainer(createStackNavigator(
  {
    SearchTab:{
      screen: SearchTab,
      navigationOptions: {
        title: 'Search',
        headerTitleStyle: { alignSelf: 'center', flex:1 },
      }
    }
  }
));

const AddMediaTabStackNavigator = createAppContainer(createStackNavigator(
  {
    AddMediaTab:{
      screen: AddMediaTab,
      navigationOptions: {
        title: 'Media',
        headerTitleStyle: { alignSelf: 'center', flex:1},
      }
    }
  }
));

const AppTabNavigator = createAppContainer(createBottomTabNavigator(
    {

      HomeTab: {
          screen: HomeTabStackNavigator,
      },
      SearchTab: {
          screen: SearchTabStackNavigator,
      },
      AddMediaTab: {
          screen: AddMediaTabStackNavigator,
      },
      LikesTab: {
          screen: LikesTabStackNavigator,
      },
      ProfileTab: {
          screen: ProfileTabStackNavigator,
      }

    }
), {
        animationEnabled: true,
        swipeEnabled: true,
        tabBarPosition: "bottom",
        tabBarOptions: {
            style: {
                ...Platform.select({
                    android: {
                        backgroundColor: '#FFB6C1'
                    }
                })
            },
            activeTintColor: '#000',
            inactiveTintColor: '#d1cece',
            showLabel: false,
            showIcon: true
        }
    })

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFB6C1',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
