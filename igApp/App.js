import React from 'react';
import * as firebase from 'firebase'
import { StyleSheet, Text, View, Image } from 'react-native';

// Initialize firebase
const firebaseConfig = {
  apiKey: "AIzaSyBF1_cjUctLu7QtlOh-T-3xpaePS_8So5U",
  authDomain: "ecs165a.firebaseapp.com",
  databaseURL: "https://ecs165a.firebaseio.com",
  storageBucket: "ecs165a.appspot.com",
};
const firebaseApp = firebase.initializeApp(firebaseConfig);

//The reference to the root of the database, which is "Users"
const rootRef = firebase.database().ref();

//The reference to the children of "Users", which is "name: Thomas Munduchira"
const userRef = rootRef.child('Users/userID1');

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      //Initialize the state "displayName" to nothing for now
      //we want to eventually print "Hello <displayName>"
      displayName: ""
    }
  }

  componentDidMount(){
    //Get a firebase snapshot of "name: Thomas Munduchira"
    userRef.on("value", (childSnapshot) => {
      this.setState({
        displayName: childSnapshot.val().first_name + " " + childSnapshot.val().last_name, //set displayName to "Thomas Munduchira"
        profilePicture: childSnapshot.val().profile_picture
      })
    })
  }

  render() {
    //const profilePictureURL = this.state.profilePicture;
    return (
      <View style={styles.container}>
        {/* Display "Hello Thomas Munduchira" */}
        <Image style={{width: 200, height: 200}} source={{uri: this.state.profilePicture}}/>
        <Text>Hello {this.state.displayName}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
