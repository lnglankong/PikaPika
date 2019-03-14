import React, {Component} from "react";
import { View, FlatList } from "react-native";

import firebase from './Firebase.js'
// reference to Hashtag branch
const hashtagRef = firebase.database().ref("Hashtag/");
// reference to Post branch
const postRef = firebase.database().ref("Post/");
// reference to Users branch
const usersRef = firebase.database().ref("Users/");

// information of currently logged in user
const loginFile = require('./HomeTab');

import Post from './Post.js';

class PostFeed extends Component {
  constructor(props) {
    super(props)
    this.postInfo = []
    this.isRefreshing = false
    this.state = {posts: []}
  }

  // get all post info from each post ID
  getPostInfo() {
    // Sort by 'date' branch for chronological order
    return postRef.orderByChild('date').once('value', (snapshot) => {

      let postCount = 0;

      snapshot.forEach((post) => {
        // Check if current post is in our list of post IDs
        if(this.props.postIDs.includes(post.key)) {

          // let username = '';
          // let profilePicture = '';
          let commentsCount = 0;
          let liked = false;

          // get username and profile picture of post's user
          // usersRef.child(post.val().userID).once('value', (userSnapshot) => {
          //   username = userSnapshot.val().username;
          //   profilePicture = userSnapshot.val().profile_picture;
          // });


          // get number of comments in each post
          commentsCount = post.child('comments').numChildren();

          // checking if user has already liked this post
          post.child('usersLiked').forEach((likedUser) => {
            // Comparing user ID to list of user IDs that liked the post
            if (likedUser.key == loginFile.loggedInUser) {
              liked = true;
              return true; // returning true breaks out of forEach enumeration
            }
          });

          // saving all of post info to postInfo array after promise resolves
          this.postInfo.push({
             caption: post.val().caption,
             commments: post.val().comments,
             date: post.val().date,
             picture: post.val().picture,
             username: post.val().username,
             likes: post.val().likes,
             commentsCount: commentsCount,
             profile_picture: post.val().profilePicture,
             userLiked: liked,
             postIndex: postCount,
             postID: post.key,
        })
        }
      })
    })
  }

  componentDidMount() {
    console.log('PostFeed mounted')
    this.getPostInfo().then(() => {
      console.log('getPostInfo() succeeded')
      this.setState({posts: this.postInfo})
    })
  }

  onRefresh() {
    this.isRefreshing = true
    this.postInfo = []
    this.getPostInfo().then(() => {
      console.log('getPostInfo() succeeded')
      this.setState({posts: this.postInfo})
      this.refreshing = false
    })
  }

  render() {
    console.log('PostFeed rendering')
    console.log(this.state.posts)
    if (this.state.posts.length == 0) {
      return (
        <View/>
      )
    }
    return (
      <FlatList
        onRefresh={() => this.onRefresh()}
        refreshing={this.isRefreshing}
        data = {this.state.posts}
        renderItem={({item}) => (
          <Post
            postID          = {item.postID}
            userID          = {loginFile.loggedInUser}
            profile_picture = {item.profile_picture}
            username        = {item.username}
            date            = {item.date}
            picture         = {item.picture}
            caption         = {item.caption}
            comments        = {item.comments}
            commentsCount   = {item.commentsCount}
            liked           = {item.userLiked}
            likes           = {item.likes}
            navigation      = {this.props.navigation}
          />
        )}
        keyExtractor={(item) => item.postID}
      />
    )
  }
}
export default PostFeed
