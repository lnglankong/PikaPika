import React, {Component} from "react";
import {View, Text, Image, StyleSheet, FlatList, TouchableOpacity} from "react-native";
import {SearchBar, ListItem} from 'react-native-elements';
import { Card, CardItem, Thumbnail, Body, Left, Right, Icon } from 'native-base'
import { Constants } from 'expo'
import { HeaderBackButton } from 'react-navigation';

import firebase from './Firebase.js'
// reference to Hashtag branch
const hashtagRef = firebase.database().ref("Hashtag/");

import PostFeed from './PostFeed.js';

class HashtagTab extends Component {
  constructor(props) {
    super(props);
    this.params = this.props.navigation.state.params;
    this.postIDs = []

    this.state = {posts: []}
  }

  // Add all post IDs associated with the hashtag to this.postIDs array
  getPostIDsFromHashtag() {
    return hashtagRef.child(this.params.hashtag).once('value', (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        this.postIDs.push(childSnapshot.key)
      })
    })
  }

  componentDidMount() {
    console.log('HashtagTab mounted')
    this.getPostIDsFromHashtag().then(() => {
      console.log('getPostIDsFromHashtag() succeeded')
      this.setState({posts: this.postIDs})
    })
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: <HeaderBackButton onPress={() => navigation.goBack(null)} />,
      title: '#' + navigation.getParam('hashtag')
    }
  };

  render(){
    console.log('HashtagTab rendering')
    if (this.state.posts.length == 0) {
      return (
        <View/>
      )
    }
    console.log(this.state.posts)
    return(
      <PostFeed
        postIDs = {this.state.posts}
        navigation = {this.props.navigation}/>
    )
  }
}
export default HashtagTab
