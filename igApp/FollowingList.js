import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  AsyncStorage } from "react-native";
import { Card, CardItem, Thumbnail, Body, Left} from 'native-base';

import firebase from './Firebase.js'


export default class FollowingList extends Component{
  state = {
    userID: "",
    notifications: [],
    usersFollowing: [],
    followingInfoList: [],
  };

  async getUsersFollowing(){

    var userID = this.params.userID
    this.setState({userID: userID});


    var usersFollowing = [];

    firebase.database().ref('Following/' + userID).once('value', (childSnapshot) => {

      if(childSnapshot.exists()){ //if user is following people ... get the following IDs

        let followingKeys = Object.keys(childSnapshot.val());

        followingKeys.forEach((userID) => {
          usersFollowing.push(userID);
        })
        this.setState({usersFollowing: usersFollowing});
      }
    })

  }

  async getFollowingUserInfo(){
    //Get the all the following user id from the current postID
    var followingInfoList = []

    this.state.usersFollowing.forEach(async (userFollowed) => {
        let username = '';
        let profilePicture = '';
        console.log('userFollowed is',userFollowed)
        firebase.database().ref('Users/' + userFollowed).once('value', async (childSnapshot) => {
            username = childSnapshot.val().username;
            console.log('user name is ', username)
            // await profilePicture = childSnapshot.val().profile_picture;
            await followingInfoList.push({
                username: childSnapshot.val().username,
                profile_picture: childSnapshot.val().profile_picture,
             });
            // console.log('finished push')
             this.setState({followingInfoList:followingInfoList})
             //this.forceUpdate()
          })
    })
  }

  async componentWillMount(){
    this.params = this.props.navigation.state.params;
    await this.getUsersFollowing()
   // await new Promise(resolve => { setTimeout(resolve, 500); });
    console.log('finished get user following')
    await this.getFollowingUserInfo()
    //await new Promise(resolve => { setTimeout(resolve, 500); });
    console.log('finished get user following info')
    
  }

  // return different jsx depending on if notif is follow, like, or comment
  renderItem = ({item}) => {
    console.log("item user name is ",item.username);
      return (
        <View>
            <Card style={{ flex: 1}}>
              <CardItem>
                <Left>
                    <Thumbnail source={{uri: item.profile_picture}} style={{borderWidth: 2, borderColor:'#d3d3d3'}}/>
                    <Body>
                        <Text style={{ fontWeight: "900" }}>{item.username + " "} </Text>
                    </Body>
                </Left>
              </CardItem>

            </Card>
          </View>
      )
    }

  render(){
    return(
      <View style={styles.flatListContainer}>
      <FlatList
        data = {this.state.followingInfoList}
        renderItem={this.renderItem}
      />
    </View>
    )
  }

}



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
