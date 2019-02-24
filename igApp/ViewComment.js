import React, {Component} from "react";
import {View, Text, StyleSheet} from "react-native";

import firebase from './Firebase.js'

//The reference to the root of the database
const rootRef = firebase.database().ref();

class ViewComment extends Component{
  render(){
    return(
      <View style={styles.container}>
        <Text>ViewComment</Text>
      </View>
    )
  }
}

export default ViewComment

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
