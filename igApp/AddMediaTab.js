import React, { Component } from "react";
import { View, Text, StyleSheet, Button, Image, Alert, Platform} from "react-native";
import { ImagePicker, Permissions } from "expo";

import firebase from './Firebase.js'

class AddMediaTab extends Component{
  state = {
    // TODO: Change this default image later
    userID: "",
    image: "https://firebasestorage.googleapis.com/v0/b/ecs165a.appspot.com/o/thomas.png?alt=media&token=db4789a0-8dc7-4b71-82a1-233708de941f",
  };

  componentDidMount(){
    //get logged-in user
    const loginFile = require('./Login');

    //get reference to the logged in user from database
    const userRef = firebase.database().ref().child('Users/' + loginFile.loggedInUser);
    this.setState({ userID: userRef.key });
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
            this.setState({ image: uploadUrl });
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
          this.setState({ image: uploadUrl });
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
          this.setState({ image: uploadUrl });
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
        this.setState({ image: uploadUrl });
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
      <View style = {styles.container}>
        <Text>AddMediaTab</Text>
        <Image style={styles.image} source={{uri: this.state.image}}/>
        <Button title="Gallery" onPress={this.selectPicture} />
        <Button title="Camera" onPress={this.takePicture} />
      </View>
    )
  }

}

export default AddMediaTab

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    image: {
      width: 300,
      height: 300,
      backgroundColor: 'gray'
    }
});
