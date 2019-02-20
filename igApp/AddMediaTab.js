import React, { Component } from "react";
import { View, Text, StyleSheet, Button, Image } from "react-native";
import { ImagePicker, Permissions } from "expo";

class AddMediaTab extends Component{
  state = {
    // TODO: Change this default image later
    image: "https://firebasestorage.googleapis.com/v0/b/ecs165a.appspot.com/o/thomas.png?alt=media&token=db4789a0-8dc7-4b71-82a1-233708de941f",
  };

  selectPicture = async () => {
    await Permissions.askAsync(Permissions.CAMERA_ROLL);
    const { cancelled, uri } = await ImagePicker.launchImageLibraryAsync({
      aspect: 1,
      allowsEditing: true,
    });
    if (!cancelled) {
      this.setState({ image: uri });
    }
  }

  takePicture = async () => {
    await Permissions.askAsync(Permissions.CAMERA);
    const { cancelled, uri } = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
    })
    if (!cancelled) {
      this.setState({ image: uri });
    }
  }
  
  render(){
    return(
      <View style = {styles.container}>
        <Text>AddMediaTab</Text>
        <Image style={styles.image} source={{uri: this.state.image}}/>
        <Button title="Gallery" onPress={this.selectPicture} />
        <Button title="Camera" onPress={this.takePicture} />
      </View>
    )
  }

}

export default AddMediaTab

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    image: {
      width: 300, 
      height: 300,
      backgroundColor: 'gray'
    }
});
