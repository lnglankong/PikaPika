import React, {Component} from "react";
import {View, Text, StyleSheet} from "react-native";

class LikesTab extends Component{
  render(){
    return(
      <View style = {styles.container}>
        <Text>LikesTab</Text>
      </View>
    )
  }

}

export default LikesTab

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
