import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation'
import Main from './Main.js'

export default class App extends React.Component {

  render() {
    return (
      <AppStackNavigator />
    );
  }

}

const AppStackNavigator = createAppContainer(createStackNavigator(
  {

    Main: {
      screen: Main
    }
  }
));


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFB6C1',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
