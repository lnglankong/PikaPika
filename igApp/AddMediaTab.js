import React, { Component } from "react";
import { View, StyleSheet, Image, Alert, Platform, Text, TouchableOpacity} from "react-native";
import { ImagePicker, Permissions } from "expo";

import firebase from './Firebase.js'

class AddMediaTab extends Component{
  state = {
    userID: "",
    picture: null,
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
            this.setState({ picture: uploadUrl });
            this.props.navigation.navigate('CreatePost', {
              picture: this.state.picture,
            })
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
          this.props.navigation.navigate('CreatePost', {
            picture: this.state.picture,
          })
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
          this.props.navigation.navigate('CreatePost', {
            picture: this.state.picture,
          })
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
        this.props.navigation.navigate('CreatePost', {
          picture: this.state.picture,
        })
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
    return (
      <View style = {styles.container}>
        <Image style={styles.picture} source={{uri: "https://firebasestorage.googleapis.com/v0/b/ecs165a.appspot.com/o/hellokittycamera.png?alt=media&token=d52362c9-ee95-43f8-8e53-243615bdd2de"}}/>
        <TouchableOpacity style={styles.button} onPress={this.selectPicture}>
          <Text style={styles.buttonText}>
            Upload From Gallery
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={this.takePicture}>
          <Text style={styles.buttonText}>
            Take Photo
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

}

export default AddMediaTab

const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    picture: {
      height: 370, 
      width: 370, 
      marginTop: 15,
      borderRadius: 20,
    },
    textInput: {
      height: 50,
      width: 320,
      borderColor: 'black',
      backgroundColor:'#FFFFFF',
      borderWidth: 1,
      marginTop: 10
    },
    buttonText: {
      color: "black",
      textAlign:'center',
      fontSize: 20,
      fontFamily:"Chalkboard SE",
    },
    button:{
      marginLeft: '10%',
      marginRight:'10%',
      marginTop:15,
      borderWidth: 1.5,
      borderRadius: 15,
      justifyContent: 'center',
      height: 50,
      width: 370,
      backgroundColor:"#F7D2F7"
    }
});
