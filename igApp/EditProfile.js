import React, {Component} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  TextInput,
  Button,
  Dimensions,
  FlatList,
  Image,
  Alert,
  findNodeHandle } from "react-native";
import { Card, CardItem, Thumbnail, Body, Left, Right, Icon } from 'native-base';
import { ImagePicker, Permissions } from "expo";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import firebase from './Firebase.js'

//The reference to the root of the database
const rootRef = firebase.database().ref();

class EditProfile extends Component{
  state =
  {
    first_name: '',
    last_name: '',
    email: '',
    biography: '',
    username: '',
    userProfilePicture: '',
    cancelled: '',
    uri: '',
    newProfilePicture: false,
    errorMessage: null
  }

  async componentWillMount(){

    var loginFile = require('./HomeTab');

    //get user's profile picture
    firebase.database().ref('Users/' + loginFile.loggedInUser).on('value', (childSnapshot) => {
      var profilePicture = '';
      profilePicture = childSnapshot.val().profile_picture;
      this.setState({userProfilePicture: profilePicture});
    })

    await new Promise(resolve => { setTimeout(resolve, 200); });

  }

  //choose a picture from user's camera roll to upload
  selectPicture = async () => {

    // ------ IOS ---------
    if(Platform.OS === 'ios'){ //ios, camera roll permission needed
      const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL)

      if(status !== 'granted'){ //user doesn't give camera roll permissions
        alert('You must enable permissions in order to change your profile picture!');
      }else{ //user gives camera roll permissions
        const { cancelled, uri } = await ImagePicker.launchImageLibraryAsync({
          aspect: [12,12],
          allowsEditing: true,
        });
        this.setState({
          cancelled: cancelled,
          uri: uri,
          newProfilePicture: true,
        });
        if(!cancelled){
          this.setState({userProfilePicture: uri});
        }
      }

    //------ ANDROID ---------
    }else{ //android, no camera roll permission needed

      const { cancelled, uri } = await ImagePicker.launchImageLibraryAsync({
        aspect: [12,12],
        allowsEditing: true,
      });
      this.setState({cancelled: cancelled, uri: uri, newProfilePicture: true});
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

  //save profile edits
  handleProfileEdit = async () => {
    //get logged-in user
    var loginFile = require('./HomeTab');

    console.log("Starting profile edit...");
    //get reference to the logged in user from database
    const userRef = rootRef.child('Users/' + loginFile.loggedInUser);

    //if first_name was edited, update firebase
    if(this.state.first_name != ''){
      //update first name on firebase database
      userRef.update({first_name: this.state.first_name});
    }

    //if last_name was edited, update firebase
    if(this.state.last_name != ''){
      //update last name on firebase database
      userRef.update({last_name: this.state.last_name});
    }

    //if biography was edited, update firebase
    if(this.state.biography != ''){
      userRef.update({biography: this.state.biography});
    }

    //if email was edited, update firebase
    if(this.state.email != ''){
      //update email on firebase authentication
      firebase.auth()
          .signInWithEmailAndPassword(loginFile.email, loginFile.password)
          .then((userCredential) => {
              userCredential.user.updateEmail(this.state.email)
          })

      //update email on firebase database
      userRef.update({email: this.state.email});
    }

    //if username was edited, update firebase

    if(this.state.username != ''){

      //get old username
      var oldUsername = userRef.username;

      var newUsername = this.state.username;

      //update username under Users branch
      userRef.update({username: this.state.username});

      const usernameRef = rootRef.child('Usernames/');

      //remove old username saved under Usernames branch
      usernameRef.update({[oldUsername]: null})

      //add new username under Usernames branch
      usernameRef.update({[newUsername]: loginFile.loggedInUser})

    }

    //if a new profile picture was provided, upload and update profile picture
    if(this.state.newProfilePicture == true){

      if (!this.state.cancelled) {
        try {
          // upload image using current time as unique photo ID in storage
          const currentTime = Date.now();
          console.log("uploading: " + this.state.uri)
          const uploadUrl = await this.uploadImage(this.state.uri, currentTime);
          userRef.update({profile_picture: uploadUrl})
        }
        catch (error) {
          Alert.alert("Error: " + error);
        }
      }
      this.setState({newProfilePicture: false});
    }


    this.props.navigation.goBack(null);
  }

  render(){
    return(
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        contentContainerStyle={styles.scrollViewContainer}
        scrollEnabled={true}
        extraScrollHeight={Platform.OS === 'ios' ? 50 : -50}
        enableOnAndroid={true}
      >
        <View style={styles.addCommentContainer}>
          <Image source={{uri: this.state.userProfilePicture}}
              style={styles.profilePicture} />
        </View>

        <TouchableOpacity onPress={this.selectPicture}>
          <View>
            <Text style={styles.changePictureButton}> {"Change Photo"} </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.customTextContainer}>Change first name:</Text>
        <TextInput
          placeholder="First Name"
          autoCapitalize="none"
          style={styles.customTextInputContainer}
          onChangeText={first_name => this.setState({ first_name })}
          value={this.state.first_name}
        />
        <Text style={styles.customTextContainer}>Change last name:</Text>
        <TextInput
          placeholder="Last Name"
          autoCapitalize="none"
          style={styles.customTextInputContainer}
          onChangeText={last_name => this.setState({ last_name })}
          value={this.state.last_name}
        />
        <Text style={styles.customTextContainer}>Change biography:</Text>
        <TextInput
          placeholder="Biography"
          autoCapitalize="none"
          style={styles.customTextInputContainer}
          onChangeText={biography => this.setState({ biography })}
          value={this.state.biography}
        />
        <Text style={styles.customTextContainer}>Change email:</Text>
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          style={styles.customTextInputContainer}
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <Text style={styles.customTextContainer}>Change username:</Text>
        <TextInput
          placeholder="Username"
          autoCapitalize="none"
          style={styles.customTextInputContainer}
          onChangeText={username => this.setState({ username })}
          value={this.state.username}
        />

        <Button title="Save Changes" onPress={this.handleProfileEdit} />
      </KeyboardAwareScrollView>
    )
  }
}

export default EditProfile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    profilePicture:{
        width: 200,
        height: 200,
        marginTop: 10,
        borderWidth: 1.5,
        borderRadius: 100
    },
    changePictureButton:{
      fontSize: 20,
      color: "#FFB6C1"
    },
    customTextContainer:{
      alignSelf: 'flex-start',
      marginLeft: 10
    },
    customTextInputContainer: {
      alignSelf: 'flex-start',
      marginLeft: 10
    },
    scrollViewContainer: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
});
