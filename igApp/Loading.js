import React from 'react'
import { View, Text, ActivityIndicator, StyleSheet,AsyncStorage} from 'react-native'

import firebase from './Firebase.js'

export default class Loading extends React.Component {
  async componentDidMount() {
    firebase.auth().onAuthStateChanged(async (user) => {
     // this.props.navigation.navigate(user ? 'Main' : 'Login')
     console.log("auth state changes")
     var alreadyLoggedIn = await this.retrieveAuthToken()
     if(!user){
       
       if (alreadyLoggedIn){ // if already logged in 
        this.props.navigation.navigate('Main')
       }else{
          this.props.navigation.navigate('Login')
       }
      }
    })

    var alreadyLoggedIn = await this.retrieveAuthToken()
    if (alreadyLoggedIn){ // if already logged in 
      this.props.navigation.navigate('Main')
    }else{
      this.props.navigation.navigate('Login')
    }

  }

  retrieveAuthToken = async () => {
    console.log('attempt  to retrieve')
    try {
      const value = await AsyncStorage.getItem('authToken');
      console.log('retrieved the value, and the value is', value)
      if (value !== null) {
        // We have data!!
        return true;
       // return value
      }else{
        console.log('no value here!')
        return false;
      }
    } 
    catch (error) {
      console.log(error)
    }
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