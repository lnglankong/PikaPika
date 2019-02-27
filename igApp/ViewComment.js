import React, {Component} from "react";
import {View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard, TextInput, Button} from "react-native";

import firebase from './Firebase.js'

//The reference to the root of the database
const rootRef = firebase.database().ref();

class ViewComment extends Component{
  //snapshot of comments is stored in prop commentsObject
  //snapshot of post's key stored in prop postID 
  
  state = {
    comment: "",
    userID: ""
  };

  componentDidMount(){
    //get logged-in user
    const loginFile = require('./Login');

    //get reference to the logged in user from database
    const userRef = firebase.database().ref().child('Users/' + loginFile.loggedInUser);
    this.setState({ userID: userRef.key });
  }

  addComment = () => {
    //Add comment to a post with a unique key
    firebase.database().ref().child('Post/' + this.props.navigation.state.params.postID + '/comments').push({
      'date': new Date().toLocaleString(),
      'text': this.state.comment,
      'userID': this.state.userID
    })
  }

  render(){
    return(
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <TextInput
            style={styles.textInput}
            placeholder="Add a comment..."
            autoCapitalize="none"
            onChangeText={comment => this.setState({ comment })}
            value={this.state.comment}
            multiline={true}
          />
          <Button
            title="Post"
            onPress={this.addComment}
          />
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

export default ViewComment

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }, 
    textInput: {
      height: 50,
      width: 320,
      borderColor: 'black',
      backgroundColor:'#FFFFFF',
      borderWidth: 1,
      marginTop: 10
    }
});
