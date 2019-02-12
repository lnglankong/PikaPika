
// SignUp.js
import React from 'react';
import { StyleSheet, Text, View, Image, TextInput, Button } from 'react-native';

import firebase from './Firebase.js'

export default class SignUp extends React.Component {
  state = { email: '', password: '', errorMessage: null }
  
  //Constructor for new user in database
  createUser(email){
    firebase.database().ref('Users/').push({
      'biography': '',  
      email,
      'first_name': '',
      'last_name': '',
      'profile_picture': ''
    }).then((data)=>{
      //success callback
      console.log('data ' , data)
    }).catch((error)=>{
      //error callback
      console.log('error ' , error)
    })
  }

  // Adds email and password to firebase authentication
  handleSignUp = () => {
    this.createUser(this.state.email)
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => this.props.navigation.navigate('Main'))
      .catch(error => this.setState({ errorMessage: error.message }))
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Sign Up</Text>
        {this.state.errorMessage &&
          <Text style={{ color: 'red' }}>
            {this.state.errorMessage}
          </Text>}
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <TextInput
          secureTextEntry
          placeholder="Password"
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={password => this.setState({ password })}
          value={this.state.password}
        />
        <Button title="Sign Up" onPress={this.handleSignUp} />
        <Button
          title="Already have an account? Login"
          onPress={() => this.props.navigation.navigate('Login')}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textInput: {
    height: 40,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 8
  }
})