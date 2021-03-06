import React, {Component} from "react";
import {View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList,Alert,AsyncStorage} from "react-native";
import { Card, CardItem, Thumbnail, Body, Left, Right, Button, Icon } from 'native-base';
import update from 'immutability-helper';
import firebase from './Firebase';
import { Constants,Permissions, Notifications } from 'expo';
//import PushNotification from 'react-native-push-notification';
import NotifService from './Notifications';

//The reference to the root of the database, which is "Users"
const rootRef = firebase.database().ref();


class ProfileTab extends Component{
  constructor(props){
    super(props);
    this.params = this.props.navigation.state.params;
    this.state = {
      //Initialize the state "displayName" to nothing for now
      //we want to eventually print "Hello <displayName>"
      displayName: "",
      displayBio: "",
      followersNum:0,
      followingNum:0,
      postsByID: [],
      isFetching: false,
      posts: [],
      likedPosts: [],
      postsNum:0,
      isDeleteButton: true,
      currentUser: '',
      commentsCountArray: [],
      comments: [],
      follow:"Follow",
      LoggedInUserID:"",
      displayUserID:"",
      profilePicture: '',
    }
  }

  handleFollow =() =>{
      if(this.state.follow == "Follow"){

          this.handleFollowing()
      }else{
          this.handleUnFollow()
      }
      console.log("I am in handle follow")
  }

  handleFollowing =() =>{
    //console.log(this.params.username)

   // var loginFile = require('./Login');

    const followingRef = rootRef.child('Following/' + this.state.LoggedInUserID);

    var userId
    var followerRef

    rootRef.child('Usernames/'+this.params.username).on("value",(snapshot) => {
        userId = snapshot.val();
        followerRef = rootRef.child('Followers/' + userId);
        followingRef.update({[userId]: true });
        followerRef.update({[this.state.LoggedInUserID]:true})
        this.setState({follow:"Unfollow"})
    })

    //add a "follow" notification to Notifications branch
    rootRef.child('Notifications/' + userId +'/' + Date.now()).update({
      'action': 'follow',
      'follower': this.state.LoggedInUserID,
    })
  }

  handleUnFollow =() =>{
    //console.log("I am in unfollow")
    //var loginFile = require('./Login');

    const followingRef = rootRef.child('Following/' + this.state.LoggedInUserID);

    var userId
    var followerRef

    rootRef.child('Usernames/'+this.params.username).on("value",(snapshot) => {
        userId = snapshot.val();
        followerRef = rootRef.child('Followers/' + userId);
        followingRef.update({[userId]: null });
        followerRef.update({[this.state.LoggedInUserID]:null})
        this.setState({follow:"Follow"})

    })
  }

  handleDelete =(postID) => {
    console.log("the photo is going to delete is " + postID)

    //var loginFile = require('./Login');

    const postRef = rootRef.child('Post/')
    const postByUserIDRef = rootRef.child('PostByUserID/' + this.state.LoggedInUserID)

    postRef.update({[postID]: null});
    postByUserIDRef.update({[postID]:null});

    this.onRefresh(this.state.LoggedInUserID)
  }

  handleLikePress(item){
    //check if user already liked this post
    if(item.userLiked == false){ //not liked yet
      item.userLiked = true


      //switch like icon to filled in heart
      this.setState({
        posts: update(this.state.posts, {
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
      this.setState({likesPosts: likesArray});

      
    }else{ //already liked
      item.userLiked = false

      //switch like icon to empty heart and decrease number of likes
      this.setState({
        posts: update(this.state.posts, {
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

  async onRefresh(userID){
    //console.log("profile tab Attempting to refresh");
    this.setState({isFetching: true})

    this.getPostsByUserID(userID)
    await new Promise(resolve => { setTimeout(resolve, 100); });
    this.getComments()
    await new Promise(resolve => { setTimeout(resolve, 100); });
    this.getFeedPosts()
    await new Promise(resolve => { setTimeout(resolve, 100); });

    //reverse order of posts
    var feedList = this.state.posts;
    feedList.reverse();
    this.setState({posts: feedList, loaded: true});


    this.setState({isFetching: false});
  }


  getPostsByUserID(userID){

    firebase.database().ref('PostByUserID/' + userID).once('value', (childSnapshot) => {

      if(childSnapshot.exists()){ //if following user has posts...get their posts
        let postByUserIDKeys = Object.keys(childSnapshot.val());

        postByUserIDKeys.forEach((currentPostByUserID) => {
          this.state.postsByID.push(currentPostByUserID);

          //console.log("Has post: " + currentPostByUserID)
        })
      }
    })
  }

  getComments(){
    //firebase.database().ref('Post/').orderByChild('date').once('value', (snapshot) => {
    firebase.database().ref('Post/').once('value', (snapshot) => {

      var commentsCountList = []; //array of # of comments per post
      var commentsList = []; //array of comment snapshots per post

      snapshot.forEach((post) => {

        if(this.state.postsByID.includes(post.key)){
          var commentsCount = 0;

          //get profile picture of poster
          firebase.database().ref('Post/' + post.key + '/comments').once('value', (childSnapshot) => {

            childSnapshot.forEach((comment) => {
              commentsCount++;
            })

            commentsCountList.push(commentsCount);
            commentsList.push(childSnapshot);

            this.setState({commentsCountArray: commentsCountList});
            this.setState({comments: commentsList});
          })


        }
      })
    })
  }

  getFeedPosts(){
    //Get the all the posts from the current postID
    //firebase.database().ref('Post/').orderByChild('date').once('value', (snapshot) => {
    firebase.database().ref('Post/').once('value', (snapshot) => {
      //this.state.feedPosts.push(post);
      var feedList = [];

      let postCount = 0;

      snapshot.forEach((post) => {

        //console.log("profile tab checking if includes: " + post.key);
        if(this.state.postsByID.includes(post.key)){


          //console.log("profile tab Looking for post: " + post.key);

          let username = '';
          let profilePicture = '';
          let commentsCount = 0;

          //get username and profile picture of poster
          firebase.database().ref('Users/' + post.val().userID).once('value', (childSnapshot) => {
            username = childSnapshot.val().username;
            profilePicture = childSnapshot.val().profile_picture;
          })

          // //get profile picture of poster
          // firebase.database().ref('Users/' + post.val().userID).once('value', (childSnapshot) => {
          //   profilePicture = childSnapshot.val().profile_picture;
          // })

          //get profile picture of poster
          firebase.database().ref('Post/' + post.key + '/comments').once('value', (childSnapshot) => {
            //commentsCount = childSnapshot4.numChildren();
            childSnapshot.forEach((comment) => {
              commentsCount++;
            })
          })

          var liked = false;
          var likesPicture = require('./assets/images/likeIcon.png');

          // check whether or not user already liked this post
          if(this.state.likedPosts.includes(post.key)){
            // user has already liked this post
            liked = true;
            likesPicture = require('./assets/images/likeFilledIcon.png');
          }

          feedList.push({
               postID: post.key,
               caption: post.val().caption,
               commments: this.state.comments[postCount],
               date: post.val().date,
               hashtag: post.val().hashtag,
               likes: post.val().likes,
               picture: post.val().picture,
               username: username,
               profile_picture: profilePicture,
               commentsCount: this.state.commentsCountArray[postCount],
               likesPicture: likesPicture,
               userLiked: liked,
               postIndex: postCount,
               key: post.key
          });

          postCount++;
          //console.log("PostCount: " + postCount);

          this.setState({posts: feedList});
          //console.log("profile tab Current postsarray: " + this.state.posts);
        }
      })
      //console.log("posts: " + this.state.feedPosts);
    })
  }

  retrieveAuthToken = async () => {
    console.log('attempt  to retrieve')
    try {
      const value = await AsyncStorage.getItem('authToken');
      console.log('retrieved the value, and the value is', value)
      if (value !== null) {
        // We have data!!
        return value;
       // return value
      }else{
        console.log('no value here!')
      }
    } catch (error) {
      console.log(error)
    }
  }

  async componentWillMount(){

    if (this.params == null){ // if the profile is for the login user
        //get logged-in user
       // var loginFile = require('./Login');
       var userID = await this.retrieveAuthToken()
       this.setState({
         LoggedInUserID:userID,
         displayUserID:userID 
        })
       console.log('user id is ', this.state.LoggedInUserID)


        //get reference to the logged in user from database
        const userRef = rootRef.child('Users/' + this.state.LoggedInUserID);
        const followingRef = rootRef.child('Following/' + this.state.LoggedInUserID);
        const followerRef = rootRef.child('Followers/' + this.state.LoggedInUserID);
        const postRef = rootRef.child('PostByUserID/' + this.state.LoggedInUserID);

        userRef.on("value", (childSnapshot) => {
          this.setState({
              displayName: childSnapshot.val().username,
              profilePicture: childSnapshot.val().profile_picture,
              displayBio: childSnapshot.val().biography,
          })
        })


        followingRef.on("value", (snapshot) => {
            this.setState({followingNum:snapshot.numChildren() })
        })

        followerRef.on("value", (snapshot) => {
            this.setState({followersNum:snapshot.numChildren() })
        })

        postRef.on("value", (snapshot) => {
            this.setState({postsNum:snapshot.numChildren() })
        })

        this.getPostsByUserID(this.state.LoggedInUserID);
        await new Promise(resolve => { setTimeout(resolve, 100); });

    }
    else{ // if this profile is for other users
       // var loginFile = require('./Login');
       this.setState({LoggedInUserID:await this.retrieveAuthToken()})
        var userId
         rootRef.child('Usernames/'+this.params.username).on("value",(snapshot) => {
            userId = snapshot.val();
         //   console.log(this.params.username)
            console.log('userId here is ',userId)
            //get reference to the logged in user from database
            this.setState({
              displayUserID:userId 
             })

             const userRef = rootRef.child('Users/' + userId);
             const followingRef = rootRef.child('Following/' + userId);
             const followerRef = rootRef.child('Followers/' + userId);
             const postRef = rootRef.child('PostByUserID/' + userId);

             rootRef.child('Following/' + this.state.LoggedInUserID +'/'+userId).once("value",snapshot => {
                if (snapshot.exists()){
                    this.setState({follow: 'Unfollow'});
                    //console.log("login user is following this user!");
                }else{
                    this.setState({follow: 'Follow'});
                    //console.log("login user is not following this user!");
                }
            }); // check if login user is following this user

             userRef.on("value", (childSnapshot) => {
               //  if(childSnapshot.exists()){
             this.setState({
                 displayName: childSnapshot.val().first_name + " " + childSnapshot.val().last_name,
                 profilePicture: childSnapshot.val().profile_picture,
                 displayBio: childSnapshot.val().biography
             })//}
             })

             followingRef.on("value", (snapshot) => {
                 this.setState({followingNum:snapshot.numChildren() })
             })

             followerRef.on("value", (snapshot) => {
                 this.setState({followersNum:snapshot.numChildren() })
             })

             postRef.on("value", (snapshot) => {
                 this.setState({postsNum:snapshot.numChildren() })
             })
             this.setState({
               currentUser: userId,
               isDeleteButton:false
              });

             this.getPostsByUserID(userId)
         })


         await new Promise(resolve => { setTimeout(resolve, 100); });

    }
    console.log('display user id is ', this.state.displayUserID)
    this.getComments();
    await new Promise(resolve => { setTimeout(resolve, 400); });
    this.getFeedPosts();
    await new Promise(resolve => { setTimeout(resolve, 100); });

    //reverse order of posts
    var feedList = this.state.posts;
    feedList.reverse();
    this.setState({posts: feedList, loaded: true});
  }


 handleNotification() {
     console.warn('ok! got your notif');
  }

async obtainNotificationPermission(){
  console.log("I am in obtain permission")
  let permission = await Permissions.getAsync(Permissions.USER_FACING_NOTIFICATIONS);
  console.log(permissions.status)
  if (permissions.status !== 'granted'){
    console.log(permissions.status)
    permission = await Permissions.askAsync(Permissions.USER_FACING_NOTIFICATIONS);
    if (permissions.status !== 'granted'){
      Alert.alert('Permission not granted to show notifications')
    }
  }
  return permission
}

async presentLocalNotification(){
 // askPermissions()
  Alert.alert('I am in present notification')
  console.log("I am in present local notification")
  await this.obtainNotificationPermission()
  Notifications.presentLocalNotificationAsync({
    title: "hello",
    body:'I am here',
    ios:{
      sound: true
    }
  })
}


  render(){
    return(
        <View style={styles.container}>
            <View style={{ paddingTop: 30 }}>
            {/* <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                <TextInput
                    onSubmitEditing={this.onSubmit}
                    placeholder={'time in ms'}
                />
            </View>  */}
            {/** User Photo Stats**/}
            <View style={{ flexDirection: 'row' }}>

                {/**User photo takes 1/3rd of view horizontally **/}
                <View
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
                    <Image source={{uri: this.state.profilePicture}}
                        style={styles.profilePicture} />
                </View>

                {/**User Stats take 2/3rd of view horizontally **/}
                <View style={{ flex: 3 }}>

                    {/** Stats **/}
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            alignItems: 'flex-end',
                            marginLeft:10
                        }}>
                        <View style={{ alignItems: 'center' }}>
                            <Text>{this.state.postsNum}</Text>
                            <Text style={{ fontSize: 15, color: 'grey',fontFamily:"Noteworthy" }}>Posts</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text>{this.state.followersNum}</Text>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('FollowerList', { userID: this.state.displayUserID })}>
                              <Text style={{ fontSize: 15, color: 'grey',fontFamily:"Noteworthy" }}>Followers</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text>{this.state.followingNum}</Text>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('FollowingList', { userID: this.state.displayUserID })}>
                              <Text style={{ fontSize: 15, color: 'grey',fontFamily:"Noteworthy" }}>Following</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {this.params?// check if it is other's profile tab
                            <TouchableOpacity style={styles.editBackground} onPress={this.handleFollow}>
                                <Text style={{color: "black",textAlign:'center', fontFamily:'Chalkboard SE'}}>
                                    {this.state.follow}
                                </Text>
                            </TouchableOpacity>:
                        <TouchableOpacity style={styles.editBackground} onPress={() => this.props.navigation.navigate('EditProfile', {
                          profilePicture: this.state.profilePicture,
                        })}>
                            <Text style={{color: "black",textAlign:'center', fontFamily:'Chalkboard SE'}}>
                                Edit Profile
                            </Text>
                        </TouchableOpacity>}

                </View>
            </View>

            <View style={{ marginTop:10, paddingBottom: 10 }}>
                <View style={{ paddingHorizontal: 10 }}>
                    <Text style={{ fontWeight: 'bold' }}>{this.state.displayName}</Text>
                    <Text>{this.state.displayBio}</Text>
                </View>
            </View>
        </View>

          <FlatList
            data = {this.state.posts}
            onRefresh={async () => this.onRefresh(this.state.currentUser)}
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
                  <Right>
                    {this.state.isDeleteButton? <TouchableOpacity
                      onPress={() => Alert.alert(
                        'Delete the photo?',
                        'deleted photo will not be recovered ',
                        [
                          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                          {text: 'Delete', onPress: () =>  this.handleDelete(item.postID), style: 'destructive'},
                        ],
                        { cancelable: false }
                      )}>
                      <Image
                        style = {{width:30, height:30, marginRight:0}}
                        source={require('./assets/images/delete.png')}
                      />
                    </TouchableOpacity>:null}
                  </Right>
                </CardItem>

                <CardItem cardBody>
                  <Image source={{uri: item.picture}} style={{ height: 400, width: null, flex: 1 ,borderRadius: 20}} />
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
                      postID: item.postID,
                    })}>
                      <Text style={{color: '#FFB6C1'}}>{"View " + item.commentsCount + " comments"} </Text>
                    </TouchableOpacity>
                  </Body>
                </CardItem>

              </Card>
            </View>
          }
            keyExtractor={(item, index) => this.state.posts[index].key}
          />
    </View>

    )
  }

}

export default ProfileTab

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // alignItems: 'center',
        // justifyContent: 'center'
    },

    profilePicture:{
        width: 100,
        height: 100,
        marginLeft: 10,
        borderWidth: 1.5,
        borderRadius: 50
    },
    editBackground:{
      flex: 1,
      marginLeft: '10%',
      marginRight:'10%',
      marginTop:20,
      borderWidth: 1.5,
      borderRadius: 15,
      justifyContent: 'center',
      height: 30 ,
      backgroundColor:"#F7D2F7"
    }
});
