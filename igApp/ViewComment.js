import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  TextInput,
  Button,
  Dimensions,
  FlatList,
  findNodeHandle } from "react-native";
import { Card, CardItem, Thumbnail, Body, Left, Right, Icon } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

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

    const loginFile = require('./HomeTab');

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

    const wait = new Promise((resolve) => setTimeout(resolve, 2000));
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

    //add a "comment" notification to Notifications branch
    firebase.database().ref().child('Post/' + this.props.navigation.state.params.postID).once('value', (snapshot) => {
      rootRef.child('Notifications/' + snapshot.val().userID + '/' + Date.now()).update({
        'action': 'comment',
        'commenter': this.state.userID,
        'commentedPost': this.props.navigation.state.params.postID,
        'comment': this.state.comment,
      })
    })
    
    
    this.textInput.clear()
    this.getCommentData();
  }

  render(){
    return(
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        contentContainerStyle={styles.mainContainer}
        scrollEnabled={false}
        extraScrollHeight={Platform.OS === 'ios' ? 50 : -50}
        enableOnAndroid={true}
      >
        <View style={styles.flatListContainer}>
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
                        <Thumbnail source={{uri: item.profile_picture}} style={{borderWidth: 2, borderColor:'#d3d3d3'}}/>
                        <Body>
                            <Text style={{ fontWeight: "900" }}>{item.username + " "} </Text>
                            <Text>{item.comment} </Text>
                            <Text style={{color: '#FFB6C1'}}>{item.date}</Text>
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
        <View style={styles.addCommentContainer}>
          <Thumbnail source={{uri: this.state.userProfilePicture}} style={styles.profilePictureContainer}/>
          <TextInput
            ref={input => { this.textInput = input }}
            style={styles.textInput}
            placeholder="Add a comment..."
            autoCapitalize="none"
            onChangeText={comment => this.setState({ comment })}
            value={this.state.comment}
            multiline={true}
          />
          <TouchableOpacity onPress={this.addComment} style={styles.postButtonContainer}>
            <Text style={styles.buttonTextContainer}> Post </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    )
  }
}

export default ViewComment

const win = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
      flex: 1,

    },
    mainContainer: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    flatListContainer: {
      flex: 5,
    },
    addCommentContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderColor:'#d3d3d3',
      borderBottomWidth:1,
      borderTopWidth:2
    },
    profilePictureContainer: {
      marginTop: 5,
      marginLeft: 5,
      marginBottom: 5,
      marginRight: 5,
      borderWidth: 2,
      borderColor:'#FFB6C1'
    },
    postButtonContainer: {
      flex: 1
    },
    buttonTextContainer: {
      color: '#FFB6C1'
    },
    textInput: {
      flex: 6,
      borderColor: 'gray',
      backgroundColor:'#FFFFFF',
      borderWidth: 1,
      borderColor: '#fff',
      //marginLeft: 10
    }
});
