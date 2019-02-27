import React, {Component} from "react";
import {View, Text, StyleSheet, Image, TouchableOpacity, ScrollView} from "react-native";
import { Card, CardItem, Thumbnail, Body, Left, Right, Button, Icon } from 'native-base';
import firebase from './Firebase';


//The reference to the root of the database, which is "Users"
const rootRef = firebase.database().ref();

class ProfileTab extends Component{
  constructor(props){
    super(props);
    this.params = this.props.navigation.state.params;
    this.state = {
      //Initialize the state "displayName" to nothing for now
      //we want to eventually print "Hello <displayName>"
      displayName: "",
      displayBio: "",
      followersNum:0,
      followingNum:0,
      postsNum:0,
      follow:"Follow"
    }
  }

  handleFollow =() =>{
      if(this.state.follow == "Follow"){

          this.handleFollowing()
      }else{
          this.handleUnFollow()
      }
  }

  handleFollowing =() =>{
    console.log(this.params.username)
    var loginFile = require('./Login');
    const followingRef = rootRef.child('Following/' + loginFile.loggedInUser);


    var userId
    var followerRef
    
    rootRef.child('Usernames/'+this.params.username).on("value",(snapshot) => {
        userId = snapshot.val();
        followerRef = rootRef.child('Followers/' + userId);
        followingRef.update({[userId]: true });
        followerRef.update({[loginFile.loggedInUser]:true})
        this.setState({follow:"Unfollow"})
        
    })
  }

  handleUnFollow =() =>{
    console.log("I am in unfollow")
    var loginFile = require('./Login');
    const followingRef = rootRef.child('Following/' + loginFile.loggedInUser);


    var userId
    var followerRef
    
    rootRef.child('Usernames/'+this.params.username).on("value",(snapshot) => {
        userId = snapshot.val();
        followerRef = rootRef.child('Followers/' + userId);
        followingRef.update({[userId]: null });
        followerRef.update({[loginFile.loggedInUser]:null})
        this.setState({follow:"Follow"})
        
    })
  }



  componentWillMount(){

    if (this.params == null){ // if the profile is for the login user
        //get logged-in user
        var loginFile = require('./Login');

        //get reference to the logged in user from database
        const userRef = rootRef.child('Users/' + loginFile.loggedInUser);
        const followingRef = rootRef.child('Following/' + loginFile.loggedInUser);
        const followerRef = rootRef.child('Followers/' + loginFile.loggedInUser);
        const postRef = rootRef.child('PostByUserID/' + loginFile.loggedInUser);

        userRef.on("value", (childSnapshot) => {
        this.setState({
            displayName: childSnapshot.val().first_name + " " + childSnapshot.val().last_name, 
            profilePicture: childSnapshot.val().profile_picture,
            displayBio: childSnapshot.val().biography
        })
        })


        followingRef.on("value", (snapshot) => {
            this.setState({followingNum:snapshot.numChildren() })
        })

        followerRef.on("value", (snapshot) => {
            this.setState({followersNum:snapshot.numChildren() })
        })

        postRef.on("value", (snapshot) => {
            this.setState({postsNum:snapshot.numChildren() })
        })
    }
    else{
        var loginFile = require('./Login');
        var userId
         rootRef.child('Usernames/'+this.params.username).on("value",(snapshot) => {
            userId = snapshot.val();
         //   console.log(this.params.username)
            console.log(userId)
            //get reference to the logged in user from database

        


         const userRef = rootRef.child('Users/' + userId);
         const followingRef = rootRef.child('Following/' + userId);
         const followerRef = rootRef.child('Followers/' + userId);
         const postRef = rootRef.child('PostByUserID/' + userId);
            
         rootRef.child('Following/' + loginFile.loggedInUser +'/'+userId).once("value",snapshot => {
            if (snapshot.exists()){
                this.setState({follow: 'Unfollow'});
                console.log("login user is following this user!");
            }else{
                this.setState({follow: 'Follow'});
                console.log("login user is not following this user!");
            }
        }); // check if login user is following this user 

         userRef.on("value", (childSnapshot) => {
           //  if(childSnapshot.exists()){
         this.setState({
             displayName: childSnapshot.val().first_name + " " + childSnapshot.val().last_name, 
             profilePicture: childSnapshot.val().profile_picture,
             displayBio: childSnapshot.val().biography
         })//}
         })
 
         followingRef.on("value", (snapshot) => {
             this.setState({followingNum:snapshot.numChildren() })
         })
 
         followerRef.on("value", (snapshot) => {
             this.setState({followersNum:snapshot.numChildren() })
         })
 
         postRef.on("value", (snapshot) => {
             this.setState({postsNum:snapshot.numChildren() })
         })
         })


         
    }
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
                    {this.params?// check if it is other's profile tab
                            <TouchableOpacity style={styles.editBackground} onPress={this.handleFollow}> 
                                <Text style={{color: "black",textAlign:'center', fontFamily:'Chalkboard SE'}}> 
                                    {this.state.follow}
                                </Text>
                            </TouchableOpacity>:
                        <TouchableOpacity style={styles.editBackground} onPress={() => this.props.navigation.navigate('EditProfile')}> 
                            <Text style={{color: "black",textAlign:'center', fontFamily:'Chalkboard SE'}}> 
                                Edit Profile
                            </Text>
                        </TouchableOpacity>}

                </View>
            </View>

            <View style={{ marginTop:10, paddingBottom: 10 }}>
                <View style={{ paddingHorizontal: 10 }}>
                    <Text style={{ fontWeight: 'bold' }}>{this.state.displayName}</Text>
                    <Text>{this.state.displayBio}</Text>
                </View>
            </View>
        </View>

        <ScrollView>
            <Card>
                    <CardItem>
                        <Left>
                            <Thumbnail source={{uri: this.state.profilePicture}} />
                            <Body>
                                <Text>{this.state.displayName} </Text>
                                <Text note>Jan 15, 2018</Text>
                            </Body>
                        </Left>
                    </CardItem>
                    <CardItem cardBody>
                        <Image source={{uri: this.state.profilePicture}} style={{ height: 200, width: null, flex: 1 }} />
                    </CardItem>
                    <CardItem style={{ height: 45 }}>
                        <Left>
                            {/* <Button transparent>
                                <Icon name="ios-heart-outline" style={{ color: 'black' }} />
                            </Button>
                            <Button transparent>
                                <Icon name="ios-chatbubbles-outline" style={{ color: 'black' }} />
                            </Button>
                            <Button transparent>
                                <Icon name="ios-send-outline" style={{ color: 'black' }} />
                            </Button> */}


                        </Left>
                    </CardItem>

                    <CardItem style={{ height: 20 }}>
                        <Text>{this.props.likes} likes</Text>
                    </CardItem>
                    <CardItem>
                        <Body>
                            <Text>
                                <Text style={{ fontWeight: "900" }}>{this.state.displayName}  </Text>
                                    hello world!
                                </Text>
                        </Body>
                    </CardItem>
            </Card>
        </ScrollView>
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
