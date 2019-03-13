import React, {Component} from "react";
import {View, Text, Image, StyleSheet, FlatList, TouchableOpacity} from "react-native";
import {SearchBar, ListItem} from 'react-native-elements';
import { Card, CardItem, Thumbnail, Body, Left, Right, Icon } from 'native-base'
import { Constants } from 'expo'
import { HeaderBackButton } from 'react-navigation';

import firebase from './Firebase.js'

// reference to Hashtag branch
const hashtagRef = firebase.database().ref("Hashtag/");
// reference to Post branch
const postRef = firebase.database().ref("Post/");
// reference to Users branch
const usersRef = firebase.database().ref("Users/");
// information of currently logged in user
const loginFile = require('./Login');

class HashtagTab extends Component {
  constructor(props) {
    super(props);
    this.params = this.props.navigation.state.params;
    this.state = {
      posts: []
    }
    this.postIDs = []
    this.postInfo = []
  }

  // Add all post IDs associated with the hashtag to this.postIDs array
  getPostIDsFromHashtag() {
    const promise = hashtagRef.child(this.params.hashtag).once('value', (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        this.postIDs.push(childSnapshot.key)
      })
    })
    return promise
  }

  // get all post info from each post ID
  getPostInfo() {
    // Sort by 'date' branch for chronological order
    postRef.orderByChild('date').once('value', (snapshot) => {

      let postCount = 0;

      snapshot.forEach((post) => {
        // Check if current post is in our list of post IDs
        if(this.postIDs.includes(post.key)) {

          let username = '';
          let profilePicture = '';
          let commentsCount = 0;
          let liked = false;
          let likesPicture = require('./assets/images/likeIcon.png');

          // get username and profile picture of post's user
          let promise = usersRef.child(post.val().userID).once('value', (userSnapshot) => {
            username = userSnapshot.val().username;
            profilePicture = userSnapshot.val().profile_picture;
          });

          // get number of comments in each post
          commentsCount = post.child('comments').numChildren();

          // checking if user has already liked this post
          post.child('usersLiked').forEach((likedUser) => {
            // Comparing user ID to list of user IDs that liked the post
            if (likedUser.key == loginFile.loggedInUser) {
              liked = true;
              likesPicture = require('./assets/images/likeFilledIcon.png');
              return true; // returning true breaks out of forEach enumeration
            }
          });

          // saving all of post info to postInfo array after promise resolves
          promise.then(() => {
            this.postInfo.push({
               caption: post.val().caption,
               commments: post.val().comments,
               date: post.val().date,
               picture: post.val().picture,
               username: username,
               likes: post.val().likes,
               commentsCount: commentsCount,
               profile_picture: profilePicture,
               likesPicture: likesPicture,
               userLiked: liked,
               postIndex: postCount,
               key: post.key,
          })
          postCount++
        })
        }
      })
    }).then(this.setState({posts: this.postInfo}))
  }

  componentDidMount() {
    this.getPostIDsFromHashtag().then(this.getPostInfo())
  }

  handleLikePress(item) {
    this.setState((prevState, props) =>{
      //if user has not liked post
      if (item.userLiked == false) {
        // item.userLiked = true
        this.postInfo[item.postIndex].userLiked = true

        //switch like icon to filled in heart
        this.postInfo[item.postIndex].likesPicture = require('./assets/images/likeFilledIcon.png')

        // increment number of likes
        // item.likes = item.likes + 1
        this.postInfo[item.postIndex].likes += 1
        postRef.child(item.key).update({likes: this.postInfo[item.postIndex].likes})

        // add user's ID to usersLiked branch
        postRef.child(item.key + '/usersLiked/' + loginFile.loggedInUser).set(true)

      }
      // if user has already liked post, and wants to unlike the post
      else {
        // item.userLiked = false
        this.postInfo[item.postIndex].userLiked = false

        //switch like icon to empty heart
        this.postInfo[item.postIndex].likesPicture = require('./assets/images/likeIcon.png')

        // decrement number of likes
        // item.likes = item.likes - 1
        this.postInfo[item.postIndex].likes -= 1
        postRef.child(item.key).update({likes: this.postInfo[item.postIndex].likes})

        // remove user's ID from usersLiked branch
        postRef.child(item.key + '/usersLiked/' + loginFile.loggedInUser).remove()
      }
      return {posts: this.postInfo}
    })
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: <HeaderBackButton onPress={() => navigation.goBack(null)} />,
      title: '#' + navigation.getParam('hashtag')
    }
  };

  render(){
    return(
          <FlatList
            data = {this.state.posts}
            renderItem={({item}) =>
              <View>

                {/* profile pitcure, username, and date UI */}
                <Card style={{ height: 610 }}>
                  <CardItem>
                    <Left>
                        <Thumbnail source={{uri: item.profile_picture}} style={{borderWidth: 2, borderColor:'#d3d3d3'}}/>
                        <Body>
                            <Text style={{ fontWeight: "900" }}>{item.username} </Text>
                            <Text style={{color: '#FFB6C1'}} note>{item.date}</Text>
                        </Body>
                    </Left>
                  </CardItem>

                  {/* picture of post UI */}
                  <CardItem cardBody>
                    <Image source={{uri: item.picture}} style={{ height: 400, width: null, flex: 1,borderRadius: 20 }} />
                  </CardItem>

                  {/* likes UI */}
                  <CardItem style={{ height: 60 }}>
                    <Body>
                      <TouchableOpacity onPress={() => this.handleLikePress(item)}>
                        <Image
                        style={{width: 30 , height: 30 ,}}
                        source={item.likesPicture}
                        >
                        </Image>
                        <Text style={{ fontWeight: "900" }}> {item.likes + " likes"} </Text>
                      </TouchableOpacity>
                    </Body>
                  </CardItem>

                  {/* post's caption UI */}
                  <CardItem style={{ height: 1, flex: 1 }}>
                    <Body>
                      <Text>
                        <Text style={{ fontWeight: "900" }}>{item.username + " "}
                        </Text>
                        {item.caption}
                      </Text>
                    </Body>
                  </CardItem>

                  {/* comments UI */}
                  <CardItem style={{ height: 1, flex: 1}}>
                    <Body>
                      <TouchableOpacity onPress={() => this.props.navigation.navigate('ViewComment', {
                        commentsObject: item.comments,
                        postID: item.key
                      })}>
                        <Text style={{color: '#FFB6C1'}}>{"View " + item.commentsCount + " comments"} </Text>
                      </TouchableOpacity>
                    </Body>
                  </CardItem>
                </Card>

              </View>
            }
            /*  { this.renderCard*/
            keyExtractor={(item) => item.key}
          />

    )
  }
}


export default HashtagTab

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  commentPoster: {
    flexDirection: 'row',
    fontWeight: "bold",
    padding: 10,
    paddingLeft: 15,
    borderBottomWidth: 1,
    borderColor: '#d8d8d8',
  },
  viewComment: {
    flexDirection: 'row',
    padding: 10,
    paddingLeft: 15,
    borderBottomWidth: 1,
    color: '#696969'
  },
  comment: {
    flexDirection: 'row',
    padding: 10,
    paddingLeft: 15,
    borderBottomWidth: 1,
    borderColor: '#d8d8d8',
  },
  commentText: {
    paddingRight: 15,
    fontWeight: 'bold',
  }
});
