import React, {Component} from "react";
import {View, Text, StyleSheet, Image, Button,TouchableOpacity, ScrollView} from "react-native";
import firebase from './Firebase'

//The reference to the root of the database, which is "Users"
const rootRef = firebase.database().ref();

class ProfileTab extends Component{
  constructor(props){
    super(props);
    this.state = {
      //Initialize the state "displayName" to nothing for now
      //we want to eventually print "Hello <displayName>"
      displayName: "",
      displayBio: ""
    }
  }


  componentDidMount(){
    //get logged-in user
    var loginFile = require('./Login');

    //get reference to the logged in user from database
    const userRef = rootRef.child('Users/' + loginFile.loggedInUser);

    userRef.on("value", (childSnapshot) => {
      this.setState({
        displayName: childSnapshot.val().first_name + " " + childSnapshot.val().last_name, 
        profilePicture: childSnapshot.val().profile_picture,
        displayBio: childSnapshot.val().biography
      })
    })
  }

  render(){
    return(
    <View style={styles.container}>
    <View style={{ paddingTop: 30 }}>

    {/** User Photo Stats**/}
    <View style={{ flexDirection: 'row' }}>

        {/**User photo takes 1/3rd of view horizontally **/}
        <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
            <Image source={{uri: this.state.profilePicture}}
                style={styles.profilePicture} />

        </View>

        {/**User Stats take 2/3rd of view horizontally **/}
        <View style={{ flex: 3 }}>

            {/** Stats **/}
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'flex-end',
                    marginLeft:10
                }}>
                <View style={{ alignItems: 'center' }}>
                    <Text>20</Text>
                    <Text style={{ fontSize: 15, color: 'grey',fontFamily:"Noteworthy" }}>Posts</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text>205</Text>
                    <Text style={{ fontSize: 15, color: 'grey',fontFamily:"Noteworthy" }}>Followers</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text>167</Text>
                    <Text style={{ fontSize: 15, color: 'grey',fontFamily:"Noteworthy" }}>Following</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.editBackground} onPress={() => this.props.navigation.navigate('EditProfile')}> 
                <Text style={{color: "black",textAlign:'center', fontFamily:'Chalkboard SE'}}> 
                    Edit Profile
                </Text>
            </TouchableOpacity>

        </View>
    </View>

    <View style={{ marginTop:10, paddingBottom: 10 }}>
        <View style={{ paddingHorizontal: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>Zekai Zhao</Text>
            <Text>I love Pika Pika</Text>
        </View>
    </View>
</View>

</View> 
    
    )
  }

}

export default ProfileTab

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // alignItems: 'center',
        // justifyContent: 'center'
    },

    profilePicture:{
        width: 100, 
        height: 100, 
        marginLeft: 10, 
        borderWidth: 1.5, 
        borderRadius: 50
    },
    editBackground:{
      flex: 1, 
      marginLeft: '10%', 
      marginRight:'10%',
      marginTop:20,
      borderWidth: 1.5,
      borderRadius: 15,
      justifyContent: 'center', 
      height: 30 ,  
      backgroundColor:"#F7D2F7"
    }
});
