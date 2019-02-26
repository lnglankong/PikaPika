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
      displayBio: "",
      followersNum:0,
      followingNum:0,
      postsNum:0,
    }
  }




  componentWillMount(){
    //get logged-in user
    var loginFile = require('./Login');

    //get reference to the logged in user from database
    const userRef = rootRef.child('Users/' + loginFile.loggedInUser);
    const followingRef = rootRef.child('Following/' + loginFile.loggedInUser);
    const followerRef = rootRef.child('Followers/' + loginFile.loggedInUser);
    const postRef = rootRef.child('PostByUserID/' + loginFile.loggedInUser);




    //   followingRef.child("Following").onWrite(event => {
    //     return event.data.ref.parent.once("value", (snapshot) => {
    //       const count = snapshot.numChildren();
    //       return event.data.ref.update({ count });
    //     });
    // })

    userRef.on("value", (childSnapshot) => {
      this.setState({
        displayName: childSnapshot.val().first_name + " " + childSnapshot.val().last_name, 
        profilePicture: childSnapshot.val().profile_picture,
        displayBio: childSnapshot.val().biography
      })
    })

    followingRef.on("value", (snapshot) => {
       // console.log("There are "+snapshot.numChildren()+" messages");
        this.setState({followingNum:snapshot.numChildren() })
    })

    followerRef.on("value", (snapshot) => {
        // console.log("There are "+snapshot.numChildren()+" messages");
        this.setState({followersNum:snapshot.numChildren() })
    })

    postRef.on("value", (snapshot) => {
        // console.log("There are "+snapshot.numChildren()+" messages");
        this.setState({postsNum:snapshot.numChildren() })
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
                    <Text>{this.state.postsNum}</Text>
                    <Text style={{ fontSize: 15, color: 'grey',fontFamily:"Noteworthy" }}>Posts</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text>{this.state.followersNum}</Text>
                    <Text style={{ fontSize: 15, color: 'grey',fontFamily:"Noteworthy" }}>Followers</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text>{this.state.followingNum}</Text>
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
            <Text style={{ fontWeight: 'bold' }}>{this.state.displayName}</Text>
            <Text>{this.state.displayBio}</Text>
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
