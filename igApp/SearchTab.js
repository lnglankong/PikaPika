import React, {Component} from "react";
import {View, Text, Image, StyleSheet, FlatList, TouchableOpacity,TouchableWithoutFeedback,Keyboard} from "react-native";
import {SearchBar, ListItem} from 'react-native-elements';

import firebase from './Firebase.js'

// reference to Users branch
const usersRef = firebase.database().ref("Users/");
// reference to Hashtag branch
const hashtagRef = firebase.database().ref("Hashtag/");

class SearchTab extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userResults: [],
      hashtagResults: [],
      foundSearch: false,
      hashtagMode: false,
    };

    this.allUsers = [];
    this.allHashtags = [];
  }

  /*
  One-time function call whenever SearchTab is opened.
  Function to retrieve user data from database's User branch.
  Retrieves username, first and last name, and profile picture and stores the
  values as an Object in @this.allUsers.
  */
  getAllUsers = () => {
    usersRef.orderByKey().once("value", (snapshot) =>{
      snapshot.forEach((userSnapshot) => {
        this.allUsers.push({username   : userSnapshot.val().username,
                            firstName  : userSnapshot.val().first_name,
                            lastName   : userSnapshot.val().last_name,
                            profilePic : userSnapshot.val().profile_picture});
      })
    })
  }

  getAllHashtags = () => {
    hashtagRef.orderByKey().once("value", (snapshot) => {
      snapshot.forEach((hashtagSnapshot) => {
        this.allHashtags.push(hashtagSnapshot.key)
      })
    })
  }

  /*
  Callback function for SearchBar's onChangeText prop.
  Performs a filter on @this.allUsers based on @text, which is provided by the
  user when they type in SearchBar. Filter is NOT case-sensitive.
  If a user's username or first name or last name contain characters that are
  in @text, then that user will not be filtered out.
  */
  updateSearch = (text) => {
    this.props.navigation.setParams({searchText: text});
    var newData

    // Search posts by hashtag
    if(text.startsWith('#')) {
      this.setState({hashtagMode: true})

      newData = this.allHashtags.filter(item => {
        const itemData = item.toUpperCase()
        const textData = text.substring(1).toUpperCase()

        return itemData.indexOf(textData) > -1
      })
    }
    // Search users by username or first/last name
    else {
      this.setState({hashtagMode: false})

      newData = this.allUsers.filter(item => {
        const itemData = `${item.username.toUpperCase()} ${item.firstName.toUpperCase()} ${item.lastName.toUpperCase()}`;
        const textData = text.toUpperCase();

        return itemData.indexOf(textData) > -1;
      });
    }

    if (newData.length == 0 || text == "" || text == "#") {
      this.setState({foundSearch: false});
    } else {
      this.setState({foundSearch: true});
    }

    // Update search results
    if (this.state.hashtagMode) {
      this.setState({hashtagResults: newData})
    } else {
      this.setState({userResults: newData});
    }

  };

  componentDidMount() {
    this.props.navigation.setParams({ searchFunction:     this.updateSearch,
                                      searchText:         this.state.search,
                                      findUsernameParam:  this.findUsername});
    this.getAllUsers();
    this.getAllHashtags();
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle:
        <SearchBar
          onChangeText={navigation.getParam('searchFunction')}
          value={navigation.getParam('searchText')}
          inputStyle={{backgroundColor: 'white'}}
          searchIcon={false}
          inputContainerStyle={{backgroundColor: 'white', width: '100%', height:'90%', flex:1, marginTop:-4}}
          containerStyle={{backgroundColor: 'white', borderWidth: 1.5, borderRadius: 15, width: '90%', height:'90%'}}
          placeholder={'Search'}
          keyboardType = {'web-search'}
          autoCorrect={false}
        />,
      headerStyle: {
        backgroundColor:'#FFB6C1',
      },
      headerTitleStyle: { alignSelf: 'auto' },
    //   headerLeft:(
    //    // <HeaderBackButton onPress={() => navigation.goBack(null)}/>
    //    <Image
    //    style = {{width:41, height:41,marginLeft:8, marginBottom:8}}
    //    source={require('./assets/images/search_colored.png')}
    //  />
    // //   ),
    //   headerRight:(
    //     <TouchableOpacity
    //     onPress={() =>navigation.goBack(null)}>
    //     <Image
    //       style = {{width:20, height:20, marginRight:15,marginBottom:5}}
    //       source={require('./assets/images/cancel.png')}
    //     />
    //  </TouchableOpacity>

    //   )
    }
  };

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '86%',
          backgroundColor: '#CED0CE',
          marginLeft: '14%',
        }}
      />
    );
  };


  render(){
    if (!this.state.foundSearch) {
      return(
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style = {styles.container}>
          <Text>No users or hashtags found</Text>
        </View>
        </TouchableWithoutFeedback>
      )
    }
    if (this.state.hashtagMode) {
      return(
        <FlatList
          data = {this.state.hashtagResults}
          renderItem = {({item}) => (
            <ListItem
              title= {'#' + item}
              onPress={() => this.props.navigation.navigate('HashtagTab', { hashtag: item })}
              // leftAvatar={{ rounded: true, source: { uri: item.profilePic } }}
              containerStyle={{ borderBottomWidth: 0 }}
            />
          )}
         // keyExtractor={item => item}
         ItemSeparatorComponent={this.renderSeparator}
       />
      )
    }
    return(
      <FlatList
        data = {this.state.userResults}
        renderItem = {({item}) => (
          <ListItem
            title={item.username}
            subtitle={`${item.firstName} ${item.lastName}`}
            onPress={() => this.props.navigation.navigate('ProfileTabInSearch', { username: item.username })}
            leftAvatar={{ rounded: true, source: { uri: item.profilePic } }}
            containerStyle={{ borderBottomWidth: 0 }}
          />
        )}
       keyExtractor={item => item.username}
       ItemSeparatorComponent={this.renderSeparator}
     />
    )}
}

export default SearchTab

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
