import React, {Component} from "react";
import {View, Text, Image, StyleSheet, FlatList, TouchableOpacity} from "react-native";
import {SearchBar, ListItem} from 'react-native-elements';

import firebase from './Firebase.js'
import profileTab from './ProfileTab'

// reference to Users branch
const usersRef = firebase.database().ref("Users/");

class SearchTab extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userInfo: [],
      foundUser: false,
    };

    this.allUsers = [];
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

  /*
  Callback function for SearchBar's onChangeText prop.
  Performs a filter on @this.allUsers based on @text, which is provided by the
  user when they type in SearchBar. Filter is NOT case-sensitive.
  If a user's username or first name or last name contain characters that are
  in @text, then that user will not be filtered out.
  */
  updateSearch = (text) => {
    this.props.navigation.setParams({searchText: text});

    const newData = this.allUsers.filter(item => {
      const itemData = `${item.username.toUpperCase()} ${item.firstName.toUpperCase()} ${item.lastName.toUpperCase()}`;
      const textData = text.toUpperCase();

      return itemData.indexOf(textData) > -1;
    });

    if (newData.length == 0 || text == "") {
      this.setState({foundUser: false});
    } else {
      this.setState({foundUser: true});
    }

    this.setState({userInfo: newData});

  };

  componentDidMount() {
    this.props.navigation.setParams({ searchFunction:     this.updateSearch,
                                      searchText:         this.state.search,
                                      findUsernameParam:  this.findUsername});
    this.getAllUsers();
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle:
        <SearchBar
          onChangeText={navigation.getParam('searchFunction')}
          value={navigation.getParam('searchText')}
          inputStyle={{backgroundColor: 'white'}}
          searchIcon={false}
          inputContainerStyle={{backgroundColor: 'white', width: '100%', height:'90%', flex:1, marginTop:-1}}
          containerStyle={{backgroundColor: 'white', borderWidth: 1.5, borderRadius: 15, width: '100%', height:'95%'}}
          placeholder={'Search'}
          keyboardType = {'web-search'}
          autoCorrect={false}
        />,
      headerStyle: {
        backgroundColor:'#FFB6C1',
      },
      headerTitleStyle: { alignSelf: 'auto' },
      headerLeft:(
       // <HeaderBackButton onPress={() => navigation.goBack(null)}/>
       <Image
       style = {{width:41, height:41,marginLeft:8, marginBottom:8}}
       source={require('./assets/images/search_colored.png')}
     />
      ),
      headerRight:(
        <TouchableOpacity
        onPress={() =>navigation.goBack(null)}>
        <Image
          style = {{width:20, height:20, marginRight:15,marginBottom:5}}
          source={require('./assets/images/cancel.png')}
        />
     </TouchableOpacity>
      
      )
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
    if (!this.state.foundUser) {
      return(
        <View style = {styles.container}>
          <Text>No users found</Text>
        </View>
      )
    }
    return(
      <FlatList
        data = {this.state.userInfo}
        renderItem = {({item}) => (
          <ListItem
            title={item.username}
            subtitle={`${item.firstName} ${item.lastName}`}
            onPress={() => this.props.navigation.navigate('ProfileTab', { username: item.username })}
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
