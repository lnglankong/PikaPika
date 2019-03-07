import React, {Component} from "react";
import {View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList,Alert} from "react-native";
import { Card, CardItem, Thumbnail, Body, Left, Right, Button, Icon } from 'native-base';
import firebase from './Firebase';


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
      postsNum:0,
      isDeleteButton: true,
      currentUser: '',
      follow:"Follow"
    }
  }

  handleFollow =() =>{
      if(this.state.follow == "Follow"){

          this.handleFollowing()
      }else{
          this.handleUnFollow()
      }
  }

  handleFollowing =() =>{
    //console.log(this.params.username)
    var loginFile = require('./Login');
    const followingRef = rootRef.child('Following/' + loginFile.loggedInUser);


    var userId
    var followerRef

    rootRef.child('Usernames/'+this.params.username).on("value",(snapshot) => {
        userId = snapshot.val();
        followerRef = rootRef.child('Followers/' + userId);
        followingRef.update({[userId]: true });
        followerRef.update({[loginFile.loggedInUser]:true})
        this.setState({follow:"Unfollow"})

    })
  }

  handleUnFollow =() =>{
    //console.log("I am in unfollow")
    var loginFile = require('./Login');
    const followingRef = rootRef.child('Following/' + loginFile.loggedInUser);

    var userId
    var followerRef

    rootRef.child('Usernames/'+this.params.username).on("value",(snapshot) => {
        userId = snapshot.val();
        followerRef = rootRef.child('Followers/' + userId);
        followingRef.update({[userId]: null });
        followerRef.update({[loginFile.loggedInUser]:null})
        this.setState({follow:"Follow"})

    })
  }

  handleDelete =(postID) => {
    console.log("the photo is going to delete is " + postID)

    var loginFile = require('./Login');
    const postRef = rootRef.child('Post/')
    const postByUserIDRef = rootRef.child('PostByUserID/' + loginFile.loggedInUser) 

    postRef.update({[postID]: null});
    postByUserIDRef.update({[postID]:null});

  }

  async onRefresh(userID){
    //console.log("profile tab Attempting to refresh");
    this.setState({isFetching: true})

    this.getPostsByUserID(userID)
    this.getFeedPosts()
    await new Promise(resolve => { setTimeout(resolve, 200); });

    // Sleep for half a second
    await new Promise(resolve => { setTimeout(resolve, 200); });
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

  getFeedPosts(){
    //Get the all the posts from the current postID
    firebase.database().ref('Post/').orderByChild('date').once('value', (snapshot) => {
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

          //get username of poster
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

          feedList.push({
               postID: post.key,
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

          this.setState({posts: feedList});
          //console.log("profile tab Current postsarray: " + this.state.posts);
        }
      })
      //console.log("posts: " + this.state.feedPosts);
    })
  }



  async componentWillMount(){

    if (this.params == null){ // if the profile is for the login user
        //get logged-in user
        var loginFile = require('./Login');

        //get reference to the logged in user from database
        const userRef = rootRef.child('Users/' + loginFile.loggedInUser);
        const followingRef = rootRef.child('Following/' + loginFile.loggedInUser);
        const followerRef = rootRef.child('Followers/' + loginFile.loggedInUser);
        const postRef = rootRef.child('PostByUserID/' + loginFile.loggedInUser);

        userRef.on("value", (childSnapshot) => {
          this.setState({
              displayName: childSnapshot.val().first_name + " " + childSnapshot.val().last_name,
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

        this.getPostsByUserID(loginFile.loggedInUser);
        await new Promise(resolve => { setTimeout(resolve, 200); });

    }
    else{ // if this profile is for other users
        var loginFile = require('./Login');
        var userId
         rootRef.child('Usernames/'+this.params.username).on("value",(snapshot) => {
            userId = snapshot.val();
         //   console.log(this.params.username)
            console.log(userId)
            //get reference to the logged in user from database

             const userRef = rootRef.child('Users/' + userId);
             const followingRef = rootRef.child('Following/' + userId);
             const followerRef = rootRef.child('Followers/' + userId);
             const postRef = rootRef.child('PostByUserID/' + userId);

             rootRef.child('Following/' + loginFile.loggedInUser +'/'+userId).once("value",snapshot => {
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


         await new Promise(resolve => { setTimeout(resolve, 200); });

    }

    this.getFeedPosts();
    await new Promise(resolve => { setTimeout(resolve, 200); });
  }

  render(){
    return(
        <View style={styles.container}>
            <View style={{ paddingTop: 30 }}>

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
                            <Text style={{ fontSize: 15, color: 'grey',fontFamily:"Noteworthy" }}>Followers</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text>{this.state.followingNum}</Text>
                            <Text style={{ fontSize: 15, color: 'grey',fontFamily:"Noteworthy" }}>Following</Text>
                        </View>
                    </View>
                    {this.params?// check if it is other's profile tab
                            <TouchableOpacity style={styles.editBackground} onPress={this.handleFollow}>
                                <Text style={{color: "black",textAlign:'center', fontFamily:'Chalkboard SE'}}>
                                    {this.state.follow}
                                </Text>
                            </TouchableOpacity>:
                        <TouchableOpacity style={styles.editBackground} onPress={() => this.props.navigation.navigate('EditProfile')}>
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
                      <Thumbnail source={{uri: item.profile_picture}} />
                      <Body>
                          <Text style={{ fontWeight: "900" }}>{item.username} </Text>
                          <Text note>{item.date}</Text>
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
                    })}>
                      <Text>{"View " + item.commentsCount + " comments"} </Text>
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
