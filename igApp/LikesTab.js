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
  };

  /*
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
 */

  async componentDidMount(){
    const loginFile = require('./HomeTab');

    //get reference to the logged in user from database
    const userRef = await firebase.database().ref().child('Users/' + loginFile.loggedInUser);
    this.setState({ LoggedInUserID: userRef.key });

    firebase.database().ref('Notifications/' + userRef.key).once('value', async (childSnapshot) => {
      if(childSnapshot.exists()){
        var notificationsArray = [];

        childSnapshot.forEach((notification) => {
          console.log("notif", notification.val());
          if (notification.val().action === "follow") {
            //get username and profile picture of new follower
            firebase.database().ref('Users/' + notification.val().follower).once('value', async (snapshot) => {
              await notificationsArray.push({
                action: "follow",
                actor: snapshot.val().username,
                actorImage: snapshot.val().profile_picture,
                notifKey: notification.key,
              })
              
              console.log("push follow");
              this.setState({notifications: notificationsArray});
            })
          }
          else if (notification.val().action === "like") {
            //get username and profile picture of new follower
            firebase.database().ref('Users/' + notification.val().liker).once('value', (userSnapshot) => {
              firebase.database().ref('Post/' + notification.val().likedPost).once('value', async (postSnapshot) => {
                await notificationsArray.push({
                  action: "like",
                  actor: userSnapshot.val().username,
                  actorImage: userSnapshot.val().profile_picture,
                  notifKey: notification.key,
                  postImage: postSnapshot.val().picture,
                });
                console.log("push like");

                //this.setState({notifications: notificationsArray});
                //notif = this.state.notifications[0];
                //console.log("notifications[0].notifKey", notif.action);
                let sortedNotifications = notificationsArray.sort((a, b) => {
                  return b.actor - a.actor;
                });
                this.setState({notifications: sortedNotifications});
              })
            })
          }
        })
      }
    })
  }

  // return different jsx depending on if notif is follow, like, or comment
  renderItem = ({item}) => {
    //console.log(item.action);
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
                        <Text style={{color: '#FFB6C1'}}>{item.date}</Text>
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
                        <Text style={{color: '#FFB6C1'}}>{item.date}</Text>
                    </Body>
                    <Thumbnail source={{uri: item.postImage}} style={{borderColor:'#d3d3d3'}}/>
                </Left>
              </CardItem>

            </Card>
          </View>
      )
    }
  }

  render(){
    console.log("notifications array", this.state.notifications);
    //notif = this.state.notifications[0];
    //console.log("notifications[0].notifKey", notif.val());
    /*
    let sortedNotifications = this.state.notifications.sort((a, b) => {
      return b.actor - a.actor;
    });
    console.log('sortedNotifs:', sortedNotifications);
    */
    return(
      <View style={styles.flatListContainer}>
      <FlatList
        data = {this.state.notifications.sort((a, b) => a.notifKey.localeCompare(b.notifKey)).reverse()}
        renderItem={this.renderItem}
        keyExtractor={(item, index) => item.notifKey}
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
