
// SignUp.js
import React from 'react';
import { StyleSheet, Text, View, Image, TextInput } from 'react-native';
import { Button } from 'react-native-elements';

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
          style={styles.firstTextInput}
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
        <Button 
          buttonStyle ={styles.loginBackground}
          title="Join Now" 
          onPress={this.handleSignUp} 
        />
        <Button
          type = "clear"
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
    alignItems: 'center',
    backgroundColor:'#F7D2F7' 
  },
  textPika: {
    fontSize: 20,
    fontFamily:"Chalkboard SE",
    marginTop:120
  },
  firstTextInput:{
    height: 45,
    width: 320,
    borderColor: 'black',
    backgroundColor:'#FFFFFF',
    borderWidth: 1,
    marginTop: 160
  },
  textInput: {
    height: 45,
    width: 320,
    borderColor: 'black',
    backgroundColor:'#FFFFFF',
    borderWidth: 1,
    marginTop: 30
  },
  loginText:{
    color:'#fff',
    textAlign:'center',
    paddingLeft : 10,
    paddingRight : 10
  },
  loginBackground:{
    height: 45,
    width: 320,
    backgroundColor:'#A5E7FF',
    borderWidth: 1,
    marginTop:30
  }
})
