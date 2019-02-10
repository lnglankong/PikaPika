import React from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'

import firebase from './Firebase.js'

export default class Loading extends React.Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
     // this.props.navigation.navigate(user ? 'Main' : 'Login')
     this.props.navigation.navigate('Login')
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Your page is loading! uwu</Text>
        <ActivityIndicator size="large" />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})