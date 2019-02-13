import React, {Component} from "react";
import {View, Text, StyleSheet, ScrollView, TextInput, Button} from "react-native";
import firebase from './Firebase.js'

//The reference to the root of the database
const rootRef = firebase.database().ref();

class EditProfile extends Component{
  state =
  {
    first_name: '',
    last_name: '',
    email: '',
    biography: '',
    errorMessage: null
  }

  //save profile edits
  handleProfileEdit = () => {
    //get logged-in user
    var loginFile = require('./Login');

    //get reference to the logged in user from database
    const userRef = rootRef.child('Users/' + loginFile.loggedInUser);

    //if first_name was edited, update firebase
    if(this.state.first_name != ''){
      //update first name on firebase database
      userRef.update({first_name: this.state.first_name});
    }

    //if last_name was edited, update firebase
    if(this.state.last_name != ''){
      //update last name on firebase database
      userRef.update({last_name: this.state.last_name});
    }

    //if email was edited, update firebase
    if(this.state.email != ''){
      //update email on firebase authentication
      firebase.auth()
          .signInWithEmailAndPassword(loginFile.email, loginFile.password)
          .then((userCredential) => {
              userCredential.user.updateEmail(this.state.email)
          })

      //update email on firebase database
      userRef.update({email: this.state.email});


    }
    if(this.state.biography != ''){
      userRef.update({biography: this.state.biography});
    }
    this.props.navigation.goBack(null);
  }

  render(){
    return(
      <ScrollView>
        <Text>Change first name:</Text>
        <TextInput
          placeholder="First Name"
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={first_name => this.setState({ first_name })}
          value={this.state.first_name}
        />
        <Text>Change last name:</Text>
        <TextInput
          placeholder="Last Name"
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={last_name => this.setState({ last_name })}
          value={this.state.last_name}
        />
        <Text>Change email:</Text>
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <Text>Change biography:</Text>
        <TextInput
          placeholder=""
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={biography => this.setState({ biography })}
          value={this.state.biography}
        />
        <View/>
        <Button title="Save Changes" onPress={this.handleProfileEdit} />
      </ScrollView>
    )
  }
}

export default EditProfile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
