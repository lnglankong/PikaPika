import React from 'react'
import { StyleSheet, Text, TextInput, View, Button} from 'react-native'

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
        <Text>Login</Text>
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
        <Button title="Login" onPress={this.handleLogin} />
        <Button
          title="Don't have an account? Sign Up"
          onPress={() => this.props.navigation.navigate('SignUp')}
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
