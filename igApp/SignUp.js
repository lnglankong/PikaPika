// SignUp.js
import React from 'react';
import { StyleSheet, Text, View, Image, TextInput, Button } from 'react-native';

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
