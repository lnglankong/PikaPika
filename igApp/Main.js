import React from 'react';
import { StyleSheet, Text, View, Image, Platform } from 'react-native';
import { createSwitchNavigator, createBottomTabNavigator, createAppContainer } from 'react-navigation'

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

const ProfileTabStackNavigator = createAppContainer(createSwitchNavigator(
  {
    ProfileTab:{
      screen: ProfileTab
    },

    EditProfile:{
      screen: EditProfile
    }
  }
));

const AppTabNavigator = createAppContainer(createBottomTabNavigator(
    {

      HomeTab: {
          screen: HomeTab
      },
      SearchTab: {
          screen: SearchTab

      },
      AddMediaTab: {
          screen: AddMediaTab
      },
      LikesTab: {
          screen: LikesTab
      },
      ProfileTab: {
          screen: ProfileTabStackNavigator
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
