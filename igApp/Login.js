import React from 'react'
import { StyleSheet, Text, TextInput, View, TouchableOpacity} from 'react-native'
import { Button } from 'react-native-elements';

import firebase from './Firebase.js'

//root reference of database
const rootRef = firebase.database().ref();

//reference to users branch
const userRef = rootRef.child('Users/');

let loggedInUser = "defaultUser";
let password = "defaultPassword";
let email = "defaultUser";

export default class Login extends React.Component {
  state = {
    email: '',
    password: '',
    errorMessage: null
  }

  handleLogin = () => {

    const { email, password } = this.state

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => this.props.navigation.navigate('Main'))
      .catch(error => this.setState({ errorMessage: error.message }))

    //find login ID of user by looping through all users in database
    userRef.orderByChild("email").equalTo(email).on("child_added", function(snapshot) {
        //export the userID, email, and password of logged in user.
        module.exports.loggedInUser = snapshot.key;
        module.exports.password = password;
        module.exports.email = email;
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style = {styles.textPika}>PikaPika</Text>
        {
          this.state.errorMessage &&
          <Text style={{ color: 'red' }}>
            {this.state.errorMessage}
          </Text>
        }
        <TextInput
          style={styles.textInput}
          autoCapitalize="none"
          placeholder="Email"
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <TextInput
          secureTextEntry
          style={styles.textInput}
          autoCapitalize="none"
          placeholder="Password"
          onChangeText={password => this.setState({ password })}
          value={this.state.password}
        />
       <Button
          title = "login"
          buttonStyle ={styles.loginBackground}
          onPress={this.handleLogin} 
        /> 

        <Button
          title="Don't have an account? Sign Up"
          type = "clear"
          color = "black"
          onPress={() => this.props.navigation.navigate('SignUp')}
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
