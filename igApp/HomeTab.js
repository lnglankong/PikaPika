import React, {Component} from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  Button,
  TouchableOpacity} from "react-native";
import { Constants, AppLoading } from 'expo'
import SafeAreaView from 'react-native-safe-area-view';
import {
  StreamApp,
  FlatFeed,
  Activity,
  LikeButton,} from 'expo-activity-feed';
import { withNavigation } from 'react-navigation';
import firebase from './Firebase.js'

//The reference to the root of the database
const rootRef = firebase.database().ref();

class HomeTab extends Component{
  state = {
    loaded: false,
    data: null,
    comments: [],
  }

  render(){
    //get logged-in user
    var loginFile = require('./Login');
    var userID = loginFile.loggedInUser;


    return(
      <SafeAreaView style={{flex: 1}} forceInset={{ top: 'always' }}>
        <StreamApp
            apiKey="x5nnxubtv25h"
            appId="48352"
            token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoidXNlci1vbmUifQ.6TZQ4XQfT6is9pOTqQP5AscbNM6YQMIopuTip3atvf0"
        >
            <FlatFeed Activity={(props) => (
              <Activity
                {...props}
                Footer={
                  <View>
                    <LikeButton {...props} />
                    <TouchableOpacity onPress={() => {this.props.navigation.navigate('ViewComment')}}>
                      <Text style={styles.comment}>
                        <Text style={styles.commentPoster}>username</Text>
                        <Text> Test Description</Text>
                      </Text>
                      <Text style={styles.viewComment}>View all 0 comments</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            )}
          />
        </StreamApp>

      </SafeAreaView>
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
})
