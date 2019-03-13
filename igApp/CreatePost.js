import React, { Component } from "react";
import { StyleSheet, Image, TextInput, Keyboard, TouchableWithoutFeedback, Text, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import firebase from './Firebase.js'

class CreatePost extends Component{
  //snapshot of image uri is in prop picture

  state = {
    userID: "",
    caption: "",
  };

  componentDidMount(){
    //get logged-in user
    const loginFile = require('./Login');

    //get reference to the logged in user from database
    const userRef = firebase.database().ref().child('Users/' + loginFile.loggedInUser);
    this.setState({ userID: userRef.key });
  }

  //add a new post to the database
  createPost = () => {
    //Add post to Post table with a unique key
    const postID = firebase.database().ref('Post/').push({
      'caption': this.state.caption,
      'date': new Date().toLocaleString(),
      'likes': 0,
      'picture': this.props.navigation.state.params.picture,
      'userID': this.state.userID
    })

    //add post to PostByUserID table
    firebase.database().ref().child('PostByUserID/' + this.state.userID + '/' + postID.key).set(true);

    // Hashtag feature
    var tokens = this.state.caption.split(' ')
    for (var i in tokens) {
      if(tokens[i].startsWith('#') && tokens[i].length > 1) {
        // hashtags cannot contain ".", "#", "$", "[", or "]"
        // add hashtag to Hashtag branch
        firebase.database().ref().child('Hashtag/' + tokens[i].substring(1) + '/' + postID.key).set(true);
      }
    }

    this.props.navigation.navigate('ProfileTab')
  }


  render(){
    return(
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAwareScrollView
          resetScrollToCoords={{ x: 0, y: 0 }}
          contentContainerStyle={styles.container}
          scrollEnabled={false}
        >
          <Image style={styles.picture} source={{uri: this.props.navigation.state.params.picture}}/>
            <TextInput
              style={styles.textInput}
              placeholder="Write a caption..."
              autoCapitalize="none"
              onChangeText={caption => this.setState({ caption })}
              value={this.state.caption}
              multiline={true}
            />
          <TouchableOpacity style={styles.button} onPress={this.createPost}>
            <Text style={styles.buttonText}>
              Share
            </Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    )
  }
}

export default CreatePost

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    picture: {
      height: 370,
      width: 370,
      marginTop: 10,
      borderRadius: 20,
    },
    textInput: {
      height: 80,
      width: 370,
      borderColor: 'black',
      backgroundColor:'#FFFFFF',
      borderWidth: 1,
      marginTop: 15
    },
    buttonText: {
      color: "black",
      textAlign:'center',
      fontSize: 20,
      fontFamily:"Chalkboard SE",
    },
    button:{
      marginLeft: '10%',
      marginRight:'10%',
      marginTop:15,
      borderWidth: 1.5,
      borderRadius: 15,
      justifyContent: 'center',
      height: 50,
      width: 370,
      backgroundColor:"#F7D2F7"
    }
});
