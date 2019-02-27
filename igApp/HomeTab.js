import React, {Component} from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  Button,
  TouchableOpacity,
  ScrollView} from "react-native";
import { Constants, AppLoading } from 'expo'
import SafeAreaView from 'react-native-safe-area-view';
import { withNavigation } from 'react-navigation';
import firebase from './Firebase.js';
import { Card, CardItem, Thumbnail, Body, Left, Right, Icon } from 'native-base'
import update from 'immutability-helper';

//The reference to the root of the database
const rootRef = firebase.database().ref();

class HomeTab extends Component{

  state = {
    loaded: false,
    data: null,
    usersFollowed: [],
    followingPosts: [],
    feedPosts: [],
    feedPostsArray: [],
    isFetching: false,
    SampleProfilePic: ''
  }

  getUsersFollowed(){

    //get logged-in user
    var loginFile = require('./Login');

    var usersFollowed = [];

    firebase.database().ref('Following/' + loginFile.loggedInUser).once('value', (childSnapshot) => {

      if(childSnapshot.exists()){ //if user is following people ... get the following IDs

        let followingKeys = Object.keys(childSnapshot.val());

        followingKeys.forEach((currentFollowingUserID) => {
          usersFollowed.push(currentFollowingUserID);

          this.setState({usersFollowed: usersFollowed});

          //console.log("Following: " + currentFollowingUserID);
        })
      }
    })

  }

  getFollowingPosts(){

    //console.log("Users Followed: " + this.state.usersFollowed);

    this.state.usersFollowed.forEach((userFollowed) => {

      //console.log("Checking " + userFollowed + " posts");

      firebase.database().ref('PostByUserID/' + userFollowed).once('value', (childSnapshot2) => {

        if(childSnapshot2.exists()){ //if following user has posts...get their posts
          let postByUserIDKeys = Object.keys(childSnapshot2.val());

          postByUserIDKeys.forEach((currentPostByUserID) => {
            this.state.followingPosts.push(currentPostByUserID);

            //console.log("Has post: " + currentPostByUserID)
          })
        }
      })
    })
  }

  getFeedPosts(){
    //Get the all the posts from the current postID

    //console.log("called");
    firebase.database().ref('Post/').orderByChild('date').once('value', (childSnapshot3) => {
      //this.state.feedPosts.push(post);
      var feedList = [];

      let postCount = 0;

      childSnapshot3.forEach((post) => {

        //console.log("checking if includes: " + post.key);

        if(this.state.followingPosts.includes(post.key)){


          console.log("Looking for post: " + post.key);

          let username = '';
          let profilePicture = '';
          let commentsCount = 0;

          //get username of poster
          firebase.database().ref('Users/' + post.val().userID).once('value', (childSnapshot4) => {
            username = childSnapshot4.val().username;
          })

          //get profile picture of poster
          firebase.database().ref('Users/' + post.val().userID).once('value', (childSnapshot4) => {
            profilePicture = childSnapshot4.val().profile_picture;
          })

          //get profile picture of poster
          firebase.database().ref('Post/' + post.key + '/comments').once('value', (childSnapshot4) => {
            //commentsCount = childSnapshot4.numChildren();
            childSnapshot4.forEach((comment) => {
              commentsCount++;
            })
          })

          feedList.push({
               caption: post.val().caption,
               commments: post.val().comments,
               date: post.val().date,
               hashtag: post.val().hashtag,
               likes: post.val().likes,
               picture: post.val().picture,
               username: username,
               profile_picture: profilePicture,
               commentsCount: commentsCount,
               likesPicture: require('./assets/images/likeIcon.png'),
               userLiked: false,
               postIndex: postCount,
               key: post.key
          });

          postCount++;
          //console.log("PostCount: " + postCount);

          this.setState({feedPostsArray: feedList});
          //console.log("Current postsarray: " + this.state.feedPostsArray);
        }
      })
      //console.log("posts: " + this.state.feedPosts);
    })
  }

  setSampleProfilePic(){
    firebase.database().ref('Users/userID1').on('value', (childSnapshot) => {
      this.setState({SampleProfilePic: childSnapshot.val().profile_picture});
    })
  }

  async onRefresh(){
    console.log("Attempting to refresh");
    this.setState({isFetching: true})
    this.getUsersFollowed();
    await new Promise(resolve => { setTimeout(resolve, 200); });
    this.getFollowingPosts();
    await new Promise(resolve => { setTimeout(resolve, 200); });
    this.getFeedPosts();
    await new Promise(resolve => { setTimeout(resolve, 200); });
    this.setSampleProfilePic();
    this.setState({loaded: true});


    // Sleep for half a second
    await new Promise(resolve => { setTimeout(resolve, 200); });

    this.setState(this.state.feedPosts);
    this.setState({isFetching: false});
  }

  handleLikePress(item){
    //check if user already liked this post
    if(item.userLiked == false){
      item.userLiked = true


      //switch like icon to filled in heart
      this.setState({
        feedPostsArray: update(this.state.feedPostsArray, {
          [item.postIndex]: {
            likesPicture: {
              $set: require('./assets/images/likeFilledIcon.png')
            },
            likes: {
              $set: item.likes+1
            },
            userLiked: {
              $set: true
            }
          }
        })
      })

      //update new amount of likes on firebase
      firebase.database().ref("Post/" + item.key).once('value', (snapshot) =>{
        let currentLikes = snapshot.val().likes + 1;

        const postRef = rootRef.child('Post/' + item.key);
        postRef.update({likes: currentLikes});
      })

      /*
      firebase.database().ref("Post/" + item.key).on("value", (childSnapshot5) => {
        currentLikes = childSnapshot5.likes;
      })

      console.log("Mid database");

      firebase.database().ref("Post/" + item.key).child("likes").transaction(function(currentLikes) {
        currentLikes + 1;
      });
      */

    }else{
      item.userLiked = false

      //switch like icon to empty heart and decrease number of likes
      this.setState({
        feedPostsArray: update(this.state.feedPostsArray, {
          [item.postIndex]: {
            likesPicture: {
              $set: require('./assets/images/likeIcon.png')
            },
            likes: {
              $set: item.likes-1
            },
            userLiked: {
              $set: false
            }
          }
        })
      })

      //update new amount of likes on firebase
      firebase.database().ref("Post/" + item.key).once('value', (snapshot) =>{

        let currentLikes = snapshot.val().likes - 1;

        const postRef = rootRef.child('Post/' + item.key);
        postRef.update({likes: currentLikes});
      })

      /*
      let currentLikes = ''
      firebase.database().ref("Post/" + item.key).on("value", (childSnapshot5) => {
        currentLikes = childSnapshot5.likes;
      })

      firebase.database().ref("Post/" + item.key).child("likes").transaction(function(currentLikes) {
        currentLikes - 1;
      });
      */
    }

  }

  async componentDidMount(){
    //console.log("STATE IS: " + this.state.loaded);

    if(this.state.loaded == false){
      //this.getActivityFeedPosts();

      this.getUsersFollowed();
      await new Promise(resolve => { setTimeout(resolve, 100); });
      this.getFollowingPosts();
      await new Promise(resolve => { setTimeout(resolve, 100); });
      this.getFeedPosts();
      await new Promise(resolve => { setTimeout(resolve, 100); });
      this.setSampleProfilePic();
      this.setState({loaded: true});


      // Sleep for half a second
      await new Promise(resolve => { setTimeout(resolve, 100); });

      this.setState(this.state.feedPosts);
      //this.setState({feedPostsArray: Object.values(this.state.feedPosts)});
      //console.log(this.state.feedPostsArray);
      //console.log(this.state.feedPosts[0].val().caption);

      //  console.log(JSON.stringify(this.state.feedPosts[0].val().date));

      //sort activity feed posts array by most recent to oldest
      //this.state.feedPosts.sort(this.custom_sort());

      // Sleep for half a second
      await new Promise(resolve => { setTimeout(resolve, 500); });

      //console.log(this.state.feedPostsArray);
    }
  }


  render(){

    return(

          <FlatList
            data = {this.state.feedPostsArray}
            onRefresh={async () => this.onRefresh()}
            refreshing={this.state.isFetching}
            renderItem={({item}) =>
              <View>
                <Card style={{ height: 610 }}>
                  <CardItem>
                    <Left>
                        <Thumbnail source={{uri: item.profile_picture}} />
                        <Body>
                            <Text>{item.username} </Text>
                            <Text note>{item.date}</Text>
                        </Body>
                    </Left>
                  </CardItem>

                  <CardItem cardBody>
                    <Image source={{uri: item.picture}} style={{ height: 400, width: null, flex: 1,borderRadius: 20 }} />
                  </CardItem>

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

                  <CardItem style={{ height: 1, flex: 1 }}>
                    <Body>
                      <Text>
                        <Text style={{ fontWeight: "900" }}>{item.username + " "}
                        </Text>
                        {item.caption}
                      </Text>
                    </Body>
                  </CardItem>

                  <CardItem style={{ height: 1, flex: 1}}>
                    <Body>
                      <TouchableOpacity onPress={() => this.props.navigation.navigate('ViewComment', {
                        commentsObject: item.comments,
                      })}>
                        <Text>{"View " + item.commentsCount + " comments"} </Text>
                      </TouchableOpacity>
                    </Body>
                  </CardItem>

                </Card>
              </View>
            }
            /*  { this.renderCard*/
            keyExtractor={(item, index) => this.state.feedPostsArray[index].key}
          />

    )
  }

}

export default HomeTab

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
