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
  ScrollView,
  AsyncStorage} from "react-native";
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
    //data: null,
    usersFollowing: [],
    followingPosts: [],
    feedPosts: [],
    feedPostsArray: [],
    commentsCountArray: [],
    likedPosts: [],
    getusersFollowingLoaded: false,
    getFollowingPostsLoaded: false,
    getCommentsLoaded: false,
    getFeedPostsLoaded: false,
    LoggedInUserID: "",
    isFetching: false
  }


  retrieveAuthToken = async () => {
    console.log('attempt  to retrieve')
    try {
      const value = await AsyncStorage.getItem('authToken');
      console.log('retrieved the value, and the value is', value)
      if (value !== null) {
        // We have data!!

        //export the userID, email, and password of logged in user.
        module.exports.loggedInUser = value;

        return value;
       // return value
      }else{
        console.log('no value here!')
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  async getusersFollowing(){

    //get logged-in user
    var loggedInUserID = await this.retrieveAuthToken();
    this.setState({LoggedInUserID: loggedInUserID});


    var usersFollowing = [];


    await firebase.database().ref('Following/' + loggedInUserID).once('value', async (childSnapshot) => {

      if(childSnapshot.exists()){ //if user is following people ... get the following IDs

        let followingKeys = Object.keys(childSnapshot.val());

        await followingKeys.forEach( (currentFollowingUserID) => {
          usersFollowing.push(currentFollowingUserID);
        })
        await this.setState({usersFollowing: usersFollowing});
      }
    })




  }

  async getFollowingPosts(){

    var followingPosts = []

    await this.state.usersFollowing.forEach( (userFollowed) => {

      firebase.database().ref('PostByUserID/' + userFollowed).once('value', async (childSnapshot2) => {

        if(childSnapshot2.exists()){ //if following user has posts...get their posts
          let postByUserIDKeys = Object.keys(childSnapshot2.val());

          await postByUserIDKeys.forEach(async (currentPostByUserID) => {
          await followingPosts.push(currentPostByUserID);
          await this.state.followingPosts.push(currentPostByUserID);
          })
        }
      })
    })


  }

  async getComments(){
    //return new Promise(function (resolve, reject) {
      await firebase.database().ref('Post/').once('value', async (snapshot) => {

        var commentsList = [];
        await snapshot.forEach( (post) => {

          if(this.state.followingPosts.includes(post.key)){
            var commentsCount = 0;

          firebase.database().ref('Post/' + post.key + '/comments').once('value', async (childSnapshot) => {

              childSnapshot.forEach( async (comment) => {
                commentsCount++;
              })
              commentsList.push(commentsCount);
              this.setState({commentsCountArray: commentsList});
            })
          }
        })
      })
    //  resolve(commentsList)

    //})


  }

  async getFeedPosts(){
    //Get the all the posts from the current postID

    await firebase.database().ref('Post/').once('value', async (snapshot) => {

      var feedList = [];

      let postCount = 0;

        await snapshot.forEach( (post) => {

          //check if the user is following this post...
          if(this.state.followingPosts.includes(post.key)){

            let username = '';
            let profilePicture = '';
            let commentsCount = '';
            var liked = false;
            var likesPicture = require('./assets/images/likeIcon.png');


            //get username of poster
             firebase.database().ref('Users/' + post.val().userID).once('value', (childSnapshot) => {
              username = childSnapshot.val().username;
              profilePicture = childSnapshot.val().profile_picture;
            }).then( async () => {
              // check whether or not user already liked this post
              if(this.state.likedPosts.includes(post.key)){
                // user has already liked this post
                liked = true;
                likesPicture = require('./assets/images/likeFilledIcon.png');
              }
            }).then(async () => {
              //... get the post information
              await feedList.push({
                   caption: post.val().caption,
                   commments: post.val().comments,
                   date: post.val().date,
                   picture: post.val().picture,
                   username: username,
                   likes: post.val().likes,
                   commentsCount: this.state.commentsCountArray[postCount],
                   profile_picture: profilePicture,
                   likesPicture: likesPicture,
                   userLiked: liked,
                   postIndex: postCount,
                   key: post.key,
              });

              postCount++;

              await this.setState({feedPostsArray: feedList.reverse()});
            })

          }
        })
    })
  }

  async onRefresh(){
    await this.setState({isFetching: true})
    await this.getusersFollowing();
    await this.getFollowingPosts();
    await this.getComments();
    await this.getFeedPosts();

    //reverse order of posts
    var feedList = this.state.feedPostsArray.reverse();

    await this.setState({feedPostsArray: feedList, loaded: true});

    this.setState({isFetching: false});
  }

  handleLikePress(item){
    //check if user already liked this post
    if(item.userLiked == false){ //not liked yet
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

      //update firebase posts branch and notification branch with new likes
      firebase.database().ref("Post/" + item.key).once('value', (snapshot) =>{
        //update new amount of likes on firebase
        let currentLikes = snapshot.val().likes + 1;
        const postRef = rootRef.child('Post/' + item.key);
        postRef.update({likes: currentLikes});

        //add a "like" notification to Notifications branch
        const likedPostUserID = snapshot.val().userID;
        rootRef.child('Notifications/' + likedPostUserID + '/' + Date.now()).update({
          'action': 'like',
          'liker': this.state.LoggedInUserID,
          'likedPost': item.key,
        })
      })

      //add post ID to list of user's liked posts in state
      var likesArray = this.state.likedPosts;
      likesArray.push(item.key);
      this.setState({likedPosts: likesArray});

    }else{ //already liked
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

      //remove post ID to list of user's liked posts in state
      var likesArray = this.state.likedPosts;
      likesArray.splice(likesArray.indexOf(item.key), 1);
      this.setState({likesPosts: likesArray});

    }

  }

  async componentWillMount(){

    if(this.state.loaded == false){

      await this.getusersFollowing();
      await this.getFollowingPosts();
      await this.getComments();
      await this.getFeedPosts();
      await this.setState({loaded: true})

    }

  }


  render(){

    if (!this.state.loaded) {
          return <View />
    }
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
                        <Thumbnail source={{uri: item.profile_picture}} style={{borderWidth: 2, borderColor:'#d3d3d3'}}/>
                        <Body>
                            <Text style={{ fontWeight: "900" }}>{item.username} </Text>
                            <Text style={{color: '#FFB6C1'}} note>{item.date}</Text>
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
