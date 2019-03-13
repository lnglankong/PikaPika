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

  componentDidMount(){
    console.log("hello");

    const loginFile = require('./HomeTab');

    //get reference to the logged in user from database
    const userRef = firebase.database().ref().child('Users/' + loginFile.loggedInUser);
    this.setState({ LoggedInUserID: userRef.key });
    console.log('userrefkey', userRef.key);
    console.log('user id is ', this.state.LoggedInUserID);

    firebase.database().ref('Notifications/' + userRef.key).once('value', (childSnapshot) => {
      console.log("I have notifications")
      //if(childSnapshot.exists()){
        var notificationsArray = [];
        var followerUsername = "";
        var followerProfilePicture = "";

        childSnapshot.forEach((notification) => {
          //get username and profile picture of new follower
          firebase.database().ref('Users/' + notification.val().follower).once('value', (snapshot) => {
            followerUsername = snapshot.val().username;
            followerProfilePicture = snapshot.val().profile_picture;
          
            notificationsArray.push({
              action: "follow",
              actor: followerUsername,
              actorImage: followerProfilePicture,
              notifKey: notification.key,
            })
  
            this.setState({notifications: notificationsArray});
          })
        })
     // }
    })
  }

  render(){
    return(
      <View style={styles.flatListContainer}>
      <FlatList
        data = {this.state.notifications}
        renderItem={({item}) =>
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
        }
        /*  { this.renderCard*/
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
