import React, { Component } from "react";
import { View, StyleSheet, Button, Image, Alert, Platform, TextInput, Keyboard, TouchableWithoutFeedback} from "react-native";
import { ImagePicker, Permissions } from "expo";

import firebase from './Firebase.js'

class AddMediaTab extends Component{
  state = {
    // TODO: Change this default image later
    userID: "",
    caption: "",
    picture: "https://firebasestorage.googleapis.com/v0/b/ecs165a.appspot.com/o/default_profile_pic.png?alt=media&token=fd2ec8c0-97a0-4dca-9170-cd6c4bf6efd3",
  };

  componentDidMount(){
    //get logged-in user
    const loginFile = require('./Login');

    //get reference to the logged in user from database
    const userRef = firebase.database().ref().child('Users/' + loginFile.loggedInUser);
    this.setState({ userID: userRef.key });
  }

  //add a new post to the database
  createPost = async () => {
    //Add post to Post table with a unique key
    const postID = firebase.database().ref('Post/').push({
      'caption': this.state.caption,
      'date': new Date().toLocaleString(),
      'likes': 0,
      'picture': this.state.picture,
      'userID': this.state.userID
    })

    //add post to PostByUserID table
    firebase.database().ref().child('PostByUserID/' + this.state.userID + '/' + postID.key).set(true);

    // Hashtag feature
    var tokens = this.state.caption.split(' ')
    for (var i in tokens) {
      if(tokens[i].startsWith('#')) {
        // add hashtag to Hashtag branch
        firebase.database().ref().child('Hashtag/' + tokens[i].substring(1) + '/' + postID.key).set(true);
      }
    }
  }

  //choose a picture from user's camera roll to upload
  selectPicture = async () => {

    // ------ IOS ---------
    if(Platform.OS === 'ios'){ //ios, camera roll permission needed
      const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL)

      if(status !== 'granted'){ //user doesn't give camera roll permissions
        alert('You must enable camera permissions in order to upload an image');
      }else{ //user gives camera roll permissions
        const { cancelled, uri } = await ImagePicker.launchImageLibraryAsync({
          aspect: [12,12],
          allowsEditing: true,
        });
        if (!cancelled) {
          try {
            // upload image using current time as unique photo ID in storage
            const currentTime = Date.now();
            const uploadUrl = await this.uploadImage(uri, currentTime);
            this.setState({ picture: uploadUrl });
            Alert.alert("Success");
          }
          catch (error) {
            Alert.alert(error);
          }
        }
      }

    //------ ANDROID ---------
    }else{ //android, no camera roll permission needed

      const { cancelled, uri } = await ImagePicker.launchImageLibraryAsync({
        aspect: [12,12],
        allowsEditing: true,
      });
      if (!cancelled) {
        try {
          // upload image using current time as unique photo ID in storage
          const currentTime = Date.now();
          const uploadUrl = await this.uploadImage(uri, currentTime);
          this.setState({ picture: uploadUrl });
          Alert.alert("Success");
        }
        catch (error) {
          Alert.alert(error);
        }
      }
    }

    console.log("status: " + status);
    if(status !== 'granted' || ''){ //user doesn't give camera roll permissions
      alert('You must enable camera permissions in order to upload an image');
    }else{ //user gives camera roll permissions
      const { cancelled, uri } = await ImagePicker.launchImageLibraryAsync({
        aspect: [12,12],
        allowsEditing: true,
      });
      if (!cancelled) {
        try {
          // upload image using current time as unique photo ID in storage
          const currentTime = Date.now();
          const uploadUrl = await this.uploadImage(uri, currentTime);
          this.setState({ picture: uploadUrl });
          Alert.alert("Success");
        }
        catch (error) {
          Alert.alert(error);
        }
      }
    }

  }

  //take a picture from user's phone
  takePicture = async () => {
    await Permissions.askAsync(Permissions.CAMERA);
    const { cancelled, uri } = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
    })
    if (!cancelled) {
      try {
        // upload image using current time as unique photo ID in storage
        const currentTime = Date.now();
        const uploadUrl = await this.uploadImage(uri, currentTime);
        this.setState({ picture: uploadUrl });
        Alert.alert("Success");
      }
      catch (error) {
        Alert.alert(error);
      }
    }
  }

  //upload image to firebase in the current user's folder
  uploadImage = async (uri, imageName) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        resolve(xhr.response);
      };
      xhr.onerror = (e) => {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    // put image in folder labeled with current user's ID
    // imageName is the current time
    const ref = firebase.storage().ref()
      .child(this.state.userID + "/" + imageName);

    const snapshot = await ref.put(blob);

    // We're done with the blob, close and release it
    blob.close();

    return await snapshot.ref.getDownloadURL();
  }

  render(){
    return(
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style = {styles.container}>
          <Image style={styles.picture} source={{uri: this.state.picture}}/>
          <TextInput
            style={styles.textInput}
            placeholder="Write a caption..."
            autoCapitalize="none"
            onChangeText={caption => this.setState({ caption })}
            value={this.state.caption}
            multiline={true}
          />
          <Button
            title="Share"
            onPress={this.createPost}
          />
          <Button title="Gallery" onPress={this.selectPicture} />
          <Button title="Camera" onPress={this.takePicture} />
        </View>
      </TouchableWithoutFeedback>
    )
  }

}

export default AddMediaTab

const styles = StyleSheet.create({
    container: {
        //flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    picture: {
      width: 320,
      height: 320,
      backgroundColor: 'gray'
    },
    textInput: {
      height: 50,
      width: 320,
      borderColor: 'black',
      backgroundColor:'#FFFFFF',
      borderWidth: 1,
      marginTop: 10
    },
});
