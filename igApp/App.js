import React from 'react';
import * as firebase from 'firebase'
import { StyleSheet, Text, View } from 'react-native';


// Initialize firebase
const firebaseConfig = {
  apiKey: "AIzaSyBF1_cjUctLu7QtlOh-T-3xpaePS_8So5U",
  authDomain: "ecs165a.firebaseapp.com",
  databaseURL: "https://ecs165a.firebaseio.com",
  storageBucket: "ecs165a.appspot.com",
};
const firebaseApp = firebase.initializeApp(firebaseConfig);
this.itemsRef = firebaseApp.database().ref();


export default class App extends React.Component {

  //get firebase information
  listenForItems(itemsRef) {
    itemsRef.on('value', (snap) => {

      // get children as an array
      var items = [];
      snap.forEach((child) => {
        items.push({
          title: child.val().title,
          _key: child.key
        });
      });

      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(items)
      });

    });
  }
  componentDidMount() {
    this.listenForItems(this.itemsRef);
  }


  render() {
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
