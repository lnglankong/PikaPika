// SignUp.js
import React from 'react';
import { StyleSheet, Text, View, Image, TextInput } from 'react-native';
import { Button } from 'react-native-elements';

import firebase from './Firebase.js'

export default class SignUp extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      username: '', 
      email: '', 
      password: '', 
      errorMessage: null 
    };
    this.handleSignUp = this.handleSignUp.bind(this);
    this.createUser = this.createUser.bind(this);
  }
  
  //Constructor for new user in database
  createUser(username, email){
    //Add user to User table with a unique key
    const userRef = firebase.database().ref('Users/').push({
      username,
      'biography': '',  
      email,
      'first_name': '',
      'last_name': '',
      'profile_picture': ''
    })
    //Add username to Username table
    firebase.database().ref('Usernames/').update({[username]: userRef.key });
  }

  // Adds email and password to firebase authentication
  handleSignUp() {
    const usersFound = firebase.database().ref('Usernames/').orderByKey().equalTo(this.state.username);
    usersFound.once('value', (snapshot) => {
      if (snapshot.val() !== null) {
        // username already exists, ask user for a different name
        console.log("username already exists");
        this.setState({ errorMessage: "Username already exists" });
      }
      else {
        //username does not yet exist, go ahead and add new user
        console.log("username does not yet exist");
        firebase
          .auth()
          .createUserWithEmailAndPassword(this.state.email, this.state.password)
          .then(() => this.createUser(this.state.username, this.state.email))
          .then(() => this.props.navigation.navigate('Main'))
          .catch(error => this.setState({ errorMessage: error.message }))
      }
    })  
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
          placeholder="Username"
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={username => this.setState({ username })}
          value={this.state.username}
        /> 
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
