import React, {Component} from "react";
import {View, Text, StyleSheet} from "react-native";

class SearchTab extends Component{
  render(){
    return(
      <View style = {styles.container}>
        <Text>SearchTab</Text>
      </View>
    )
  }

}

export default SearchTab

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
