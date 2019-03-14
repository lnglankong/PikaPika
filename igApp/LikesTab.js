import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  AsyncStorage } from "react-native";
import { Card, CardItem, Thumbnail, Body, Left} from 'native-base';

import firebase from './Firebase.js'

class LikesTab extends Component{
  state = {
    LoggedInUserID: "",
    notifications: [],
    isFetching: false,
  };

  getNotificationsData() {
    const loginFile = require('./HomeTab');

    //get reference to the logged in user from database
    const userRef = firebase.database().ref().child('Users/' + loginFile.loggedInUser);
    this.setState({ LoggedInUserID: userRef.key });

    firebase.database().ref('Notifications/' + userRef.key).once('value', (childSnapshot) => {
      if(childSnapshot.exists()){
        var notificationsArray = [];

        childSnapshot.forEach((notification) => {
          if (notification.val().action === "follow") {
            //get username and profile picture of new follower
            firebase.database().ref('Users/' + notification.val().follower).once('value', (snapshot) => {
              notificationsArray.push({
                action: "follow",
                actor: snapshot.val().username,
                actorImage: snapshot.val().profile_picture,
                notifKey: notification.key,
              })
              this.setState({notifications: notificationsArray});
            })
          }
          else if (notification.val().action === "like") {
            //get username and profile picture of new follower
            firebase.database().ref('Users/' + notification.val().liker).once('value', (userSnapshot) => {
              firebase.database().ref('Post/' + notification.val().likedPost).once('value', (postSnapshot) => {
                notificationsArray.push({
                  action: "like",
                  actor: userSnapshot.val().username,
                  actorImage: userSnapshot.val().profile_picture,
                  notifKey: notification.key,
                  postImage: postSnapshot.val().picture,
                });
                this.setState({notifications: notificationsArray});
              })
            })
          }
          else if (notification.val().action === "comment") {
            //get username and profile picture of new follower
            firebase.database().ref('Users/' + notification.val().commenter).once('value', (userSnapshot) => {
              firebase.database().ref('Post/' + notification.val().commentedPost).once('value', (postSnapshot) => {
                notificationsArray.push({
                  action: "comment",
                  actor: userSnapshot.val().username,
                  actorImage: userSnapshot.val().profile_picture,
                  notifKey: notification.key,
                  postImage: postSnapshot.val().picture,
                  comment: notification.val().comment,
                });
                this.setState({notifications: notificationsArray});
              })
            })
          }
        })
      }
    })
  }

  async componentDidMount(){
    this.getNotificationsData();
  }

  async onRefresh(){
    this.setState({isFetching: true})
    await this.getNotificationsData();
    this.setState({isFetching: false});
  }

  // return different jsx depending on if notif is follow, like, or comment
  renderItem = ({item}) => {
    if(item.action === "follow") {
      return (
        <View>
            <Card style={{ flex: 1}}>
              <CardItem>
                <Left>
                    <Thumbnail source={{uri: item.actorImage}} style={{borderWidth: 2, borderColor:'#d3d3d3'}}/>
                    <Body>
                        <Text style={{ fontWeight: "900" }}>{item.actor + " "} </Text>
                        <Text>started following you.</Text>
                    </Body>
                </Left>
              </CardItem>

            </Card>
          </View>
      )
    }
    else if (item.action === "like") {
      return (
        <View>
            <Card style={{ flex: 1}}>
              <CardItem>
                <Left>
                    <Thumbnail source={{uri: item.actorImage}} style={{borderWidth: 2, borderColor:'#d3d3d3'}}/>
                    <Body>
                        <Text style={{ fontWeight: "900" }}>{item.actor + " "} </Text>
                        <Text>liked your post.</Text>
                    </Body>
                    <Thumbnail source={{uri: item.postImage}} style={{borderWidth: 2, borderColor:'#d3d3d3'}} square/>
                </Left>
              </CardItem>

            </Card>
          </View>
      )
    } 
    else if (item.action === "comment") {
      return (
        <View>
            <Card style={{ flex: 1}}>
              <CardItem>
                <Left>
                    <Thumbnail source={{uri: item.actorImage}} style={{borderWidth: 2, borderColor:'#d3d3d3'}}/>
                    <Body>
                        <Text style={{ fontWeight: "900" }}>{item.actor + " "} </Text>
                        <Text>commented: {item.comment}</Text>
                    </Body>
                    <Thumbnail source={{uri: item.postImage}} style={{borderWidth: 2, borderColor:'#d3d3d3'}} square/>
                </Left>
              </CardItem>

            </Card>
          </View>
      )
    }
  }

  render(){
    return(
      <View style={styles.flatListContainer}>
      <FlatList
        data = {this.state.notifications.sort((a, b) => a.notifKey.localeCompare(b.notifKey)).reverse()}
        onRefresh={async () => this.onRefresh()}
        refreshing={this.state.isFetching}
        renderItem={this.renderItem}
        keyExtractor={(item, index) => item.key}
      />
    </View>
    )
  }

}

export default LikesTab

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
