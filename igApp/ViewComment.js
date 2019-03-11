import React, {Component} from "react";
import {View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard, TextInput, Button, FlatList} from "react-native";
import { Card, CardItem, Thumbnail, Body, Left, Right, Icon } from 'native-base';

import firebase from './Firebase.js'

//The reference to the root of the database
const rootRef = firebase.database().ref();

class ViewComment extends Component{
  //snapshot of comments is stored in prop commentsObject
  //snapshot of post's key stored in prop postID

  state = {
    comment: "",
    userID: "",
    loaded: false,
    userProfilePicture: "",
    isFetching: false,
    comments: [],
  };

  getCommentData(){

    const loginFile = require('./Login');

    //get reference to the logged in user from database
    firebase.database().ref('Users/' + loginFile.loggedInUser).once('value', (childSnapshot) => {
      this.setState({userProfilePicture: childSnapshot.val().profile_picture});
      this.setState({ userID: childSnapshot.key });
    })

    firebase.database().ref('Post/' + this.props.navigation.state.params.postID + '/comments').once('value', (childSnapshot) => {
      var commentsArray = [];
      var username = '';
      var profilePicture = '';
      var commentText = '';
      var date = '';

      childSnapshot.forEach((comment) => {

        commentText = comment.val().text;
        date = comment.val().date;

        //get username and profile picture of poster
        firebase.database().ref('Users/' + comment.val().userID).once('value', (childSnapshot) => {
          username = childSnapshot.val().username;
          profilePicture = childSnapshot.val().profile_picture;

          commentsArray.push({
            comment: commentText,
            profile_picture: profilePicture,
            username: username,
            date: date,
            key: comment.key
          });

          this.setState({comments: commentsArray});
        })
      })
    })

    const wait = new Promise((resolve) => setTimeout(resolve, 1000));
    wait.then( () => {
        this.flatList.scrollToEnd({ animated: true });
    });

  }

  async componentDidMount(){
    //get logged-in user

    this.getCommentData();

    //await new Promise(resolve => { setTimeout(resolve, 500); });

    //this.flatList.scrollToEnd({ animated: true });
  }

  async onRefresh(){
    //console.log("profile tab Attempting to refresh");
    this.setState({isFetching: true})

    this.getCommentData();
    //await new Promise(resolve => { setTimeout(resolve, 200); });

    //this.flatList.scrollToEnd({ animated: true });

    this.setState({isFetching: false});
  }

  addComment = () => {
    //Add comment to a post with a unique key
    firebase.database().ref().child('Post/' + this.props.navigation.state.params.postID + '/comments').push({
      'date': new Date().toLocaleString(),
      'text': this.state.comment,
      'userID': this.state.userID
    })

    this.textInput.clear()
    this.getCommentData();
  }

  render(){
    return(
      <View style={styles.mainContainer}>
        <View style={{ height: 630 }}>
          <FlatList
            ref={ (ref) => { this.flatList = ref; }}
            data = {this.state.comments}
            onRefresh={async () => this.onRefresh()}
            refreshing={this.state.isFetching}
            renderItem={({item}) =>
              <View>
                <Card style={{ flex: 1}}>
                  <CardItem>
                    <Left>
                        <Thumbnail source={{uri: item.profile_picture}} />
                        <Body>
                            <Text style={{ fontWeight: "900" }}>{item.username + " "} </Text>
                            <Text>{item.comment} </Text>
                            <Text style={{color: 'gray'}}>{item.date}</Text>
                        </Body>
                    </Left>
                  </CardItem>

                </Card>
              </View>
            }
            /*  { this.renderCard*/
            keyExtractor={(item, index) => item.key}
          />
        </View>
        <View style={{ height: 100, flexDirection: 'row' }}>

          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <View style={styles.container}>
                <Thumbnail source={{uri: this.state.userProfilePicture}}/>
                <TextInput
                  ref={input => { this.textInput = input }}
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
                  style={{ height: 100 }}
                />
              </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    )
  }
}

export default ViewComment

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    mainContainer: {
        flex: 1,
    },
    textInput: {
      height: 50,
      width: 250,
      borderColor: 'gray',
      backgroundColor:'#FFFFFF',
      borderWidth: 1,
      marginTop: 10,
      marginLeft: 10
    }
});
