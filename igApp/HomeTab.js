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
    SampleProfilePic: ''
  }

  getUsersFollowed(){

    //get logged-in user
    var loginFile = require('./Login');

    firebase.database().ref('Following/' + loginFile.loggedInUser).on('value', (childSnapshot) => {

      let followingKeys = Object.keys(childSnapshot.val());

      followingKeys.forEach((currentFollowingUserID) => {

        this.state.usersFollowed.push(currentFollowingUserID);
      })

    })

  }

  getFollowingPosts(){

    firebase.database().ref('PostByUserID/' + this.state.usersFollowed).on('value', (childSnapshot2) => {

      let postByUserIDKeys = Object.keys(childSnapshot2.val());

      postByUserIDKeys.forEach((currentPostByUserID) => {
        this.state.followingPosts.push(currentPostByUserID);
      })
    })
  }

  getFeedPosts(){
    //Get the all the posts from the current postID
    firebase.database().ref('Post/').orderByChild('date').on('value', (childSnapshot3) => {
      //this.state.feedPosts.push(post);
      var feedList = [];
      childSnapshot3.forEach((post) => {

        let username = '';
        let profilePicture = '';
        let commentsCount = 0;

        //get username of poster
        firebase.database().ref('Users/' + post.val().userID).on('value', (childSnapshot4) => {
          username = childSnapshot4.val().username;
        })

        //get profile picture of poster
        firebase.database().ref('Users/' + post.val().userID).on('value', (childSnapshot4) => {
          profilePicture = childSnapshot4.val().profile_picture;
        })

        //get profile picture of poster
        firebase.database().ref('Post/' + post.key + '/comments').on('value', (childSnapshot4) => {
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
             key: post.key
        });
        this.setState({feedPostsArray: feedList});
        //console.log("Current postsarray: " + this.state.feedPostsArray);
      })
      console.log("posts: " + this.state.feedPosts);

    })
  }

  setSampleProfilePic(){
    firebase.database().ref('Users/userID1').on('value', (childSnapshot) => {

      this.setState({SampleProfilePic: childSnapshot.val().profile_picture});

    })
  }

  async componentDidMount(){

    //this.getActivityFeedPosts();
    this.getUsersFollowed();
    this.getFollowingPosts();
    this.getFeedPosts();
    this.setSampleProfilePic();


    // Sleep for half a second
    await new Promise(resolve => { setTimeout(resolve, 500); });

    this.setState(this.state.feedPosts);
    //this.setState({feedPostsArray: Object.values(this.state.feedPosts)});
    //console.log(this.state.feedPostsArray);
    //console.log(this.state.feedPosts[0].val().caption);

  //  console.log(JSON.stringify(this.state.feedPosts[0].val().date));

    //sort activity feed posts array by most recent to oldest
    //this.state.feedPosts.sort(this.custom_sort());

    // Sleep for half a second
    await new Promise(resolve => { setTimeout(resolve, 500); });

    console.log(this.state.feedPostsArray);


  }


  render(){

    return(
      <ScrollView>
          <FlatList
            data = {this.state.feedPostsArray}
            renderItem={({item}) =>
              <View>
                <Card>

                  <CardItem>
                    <Left>
                        <Thumbnail source={{uri: item.profile_picture}} />
                        <Body>
                            <Text>{item.username} </Text>
                            <Text note>Jan 15, 2018</Text>
                        </Body>
                    </Left>
                  </CardItem>

                  <CardItem cardBody>
                    <Image source={{uri: item.picture}} style={{ height: 400, width: null, flex: 1 }} />
                  </CardItem>

                  <CardItem style={{ height: 45 }}>
                    <Left>
                      <TouchableOpacity onPress={console.log("Like pressed")}>
                        <Image
                        style={{width: 32 , height: 32 ,}}
                        source={require('./assets/images/profile_colored.png')}
                        >
                        </Image>
                        <Text>{item.likes} </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => this.props.navigation.navigate('ViewComment', {
                        commentsObject: item.comments,
                      })}>
                        <Text>{"View " + item.commentsCount + " comments"} </Text>
                      </TouchableOpacity>
                    </Left>
                  </CardItem>

                  <CardItem style={{ height: 20 }}>
                    <Text>{item.likes} </Text>
                  </CardItem>

                  <CardItem>
                    <Body>
                      <Text>
                        <Text style={{ fontWeight: "900" }}>{item.username + " "}
                        </Text>
                        {item.caption}
                      </Text>
                    </Body>
                  </CardItem>

                </Card>
              </View>
            }
            /*  { this.renderCard*/
            keyExtractor={(item, index) => this.state.feedPostsArray[index].key}
          />
      </ScrollView>
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
