import React, {Component} from "react";
import {View, Text, Image, TouchableOpacity} from "react-native";
import { Card, CardItem, Thumbnail, Body, Left } from 'native-base'

import firebase from './Firebase.js';
// reference to Post branch
const postRef = firebase.database().ref("Post/");

import likeIcon from './assets/images/likeFilledIcon.png';
import notLikeIcon from './assets/images/likeIcon.png';

class Post extends Component {
  constructor(props) {
    super(props);
    this.state = {
      liked : props.liked,
      likes : props.likes,
      commentsCount : props.commentsCount
    };
  }

  handleLikePress() {
    this.setState((prevState, props) => {
      let numLikes = prevState.likes
      if (prevState.liked == false) {
        // increment number of likes
        numLikes += 1
        postRef.child(props.postID).update({likes: numLikes})
        // add user's ID to usersLiked branch of Post
        postRef.child(props.postID + '/usersLiked/' + props.userID).set(true)
      }
      else {
        // decrement number of likes
        numLikes -= 1
        postRef.child(props.postID).update({likes: numLikes})
        // remove user's ID remove usersLiked branch of Post
        postRef.child(props.postID + '/usersLiked/' + props.userID).remove()
      }

      return { liked : !prevState.liked,
               likes : numLikes}
    })
  }

  render() {
    // console.log('post rendering')
    return (
      <View>
        {/* profile pitcure, username, and date UI */}
        <Card style={{ height: 610 }}>
          <CardItem>
            <Left>
                <Thumbnail
                  source={{uri: this.props.profile_picture}}
                  style={{borderWidth: 2, borderColor:'#d3d3d3'}}
                />
                <Body>
                    <Text style={{ fontWeight: "900" }}>
                      {this.props.username}
                    </Text>
                    <Text style={{color: '#FFB6C1'}} note>
                      {this.props.date}
                    </Text>
                </Body>
            </Left>
          </CardItem>

          {/* picture of post UI */}
          <CardItem cardBody>
            <Image
              source={{uri: this.props.picture}}
              style={{ height: 400, width: null, flex: 1,borderRadius: 20 }}
            />
          </CardItem>

          {/* likes UI */}
          <CardItem style={{ height: 60 }}>
            <Body>
              <TouchableOpacity onPress={() => this.handleLikePress()}>
                <Image
                style={{width: 30 , height: 30 ,}}
                source={this.state.liked ? likeIcon : notLikeIcon}
                >
                </Image>
                <Text style={{ fontWeight: "900" }}> {this.state.likes + " likes"} </Text>
              </TouchableOpacity>
            </Body>
          </CardItem>

          {/* post's caption UI */}
          <CardItem style={{ height: 1, flex: 1 }}>
            <Body>
              <Text>
                <Text style={{ fontWeight: "900" }}>{this.props.username + " "}
                </Text>
                {this.props.caption}
              </Text>
            </Body>
          </CardItem>

          {/* comments UI */}
          <CardItem style={{ height: 1, flex: 1}}>
            <Body>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('ViewComment', {
                commentsObject: this.props.comments,
                postID: this.props.postID
              })}>
                <Text style={{color: '#FFB6C1'}}>{"View " + this.state.commentsCount + " comments"} </Text>
              </TouchableOpacity>
            </Body>
          </CardItem>
        </Card>

      </View>
    )
  }
}

export default Post
