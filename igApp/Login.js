import React from 'react'
import { Platform, StyleSheet, Text, TextInput, View, TouchableWithoutFeedback, Keyboard,AsyncStorage} from 'react-native'
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
    fontLoaded: false,
    email: '',
    password: '',
    errorMessage: null
  }

  //Load correct font for android
  async componentDidMount() {


    await Expo.Font.loadAsync({
      'Chalkboard SE': require('./assets/fonts/ChalkboardSE.ttf')
    }).then(() => {
      this.setState({ fontLoaded: true });
    })

    await Expo.Font.loadAsync({
      'Noteworthy': require('./assets/fonts/Noteworthy-Lt.ttf')
    }).then(() => {
      this.setState({ fontLoaded: true });
    })

  }

  handleLogin = () => {

    const { email, password } = this.state
    console.log("handle login")
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => this.storeAndLogin(email))
      .catch(error => this.setState({ errorMessage: error.message }))

    //find login ID of user by looping through all users in database
    userRef.orderByChild("email").equalTo(email).on("child_added", function(snapshot) {
        //export the userID, email, and password of logged in user.
        module.exports.loggedInUser = snapshot.key;
        module.exports.password = password;
        module.exports.email = email;
      });
  }

  async storeItem(key, item) {
    try {
        console.log('I am storing')
        //we want to wait for the Promise returned by AsyncStorage.setItem()
        //to be resolved to the actual value before returning the value
        var jsonOfItem = await AsyncStorage.setItem(key, JSON.stringify(item));
        return jsonOfItem;
    } catch (error) {
      console.log(error.message);
    }
  }


  storeData = async (key,value) => {
    try {
      console.log('recording the data')
      await AsyncStorage.setItem(key, value);
      this.props.navigation.navigate('Main')
    } catch (error) {
      console.log(error)
    }
  };

  storeAndLogin = (email) =>{

    var userId
    console.log('I am in store and login function ');
    userRef.orderByChild("email").equalTo(email).on("child_added", function(snapshot) {
      console.log('I am in firebase')
     userId = snapshot.key
    })
    this.storeData("authToken",userId)

   // this.props.navigation.navigate('Main')
  }



  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Text style = {Platform.OS === 'ios' ? styles.textPika : (this.state.fontLoaded == true ? styles.textPika : '')}>PikaPika</Text>
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
      </TouchableWithoutFeedback>
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
