import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

export class CardComponent extends Component {
  render() {

    const images = {

      "1": require('../assets/posts/valerie.jpg'),
      "2": require('../assets/posts/annie.jpg'),
      "3": require('../assets/posts/alex.jpg')
    }

    return (
      <Card>
      <CardItem>
      <Left>
      <Thumbnail source={require("../assets/posts/valerie.jpg")}/>
      <Body>
        <Text>Kofi</Text>
        <Text note>26 Feb 2018</Text>
      </Body>
      </Left>
      </CardItem>
      <CardItem cardBody>
      <Image source={images[this.props.imageSource]} style={{height: 200, width: null, flex:1}}/>
      </CardItem>
      <CardItem style={{height: 45}}>
      <Left>
      <Button transparent>
      <Icon name="ios-heart-outline" style={{color: 'black'}}/>
      </Button>
      <Button transparent>
      <Icon name="ios-chatbubbles-outline" style={{color: 'black'}}/>
      </Button>
      <Button transparent>
      <Icon name="ios-send-outline" style={{color: 'black'}}/>
      </Button>
      </Left>
      </CardItem>
      <CardItem style={{height: 20}}>
        <Text>{this.props.likes}</Text>
      </CardItem>
      <CardItem>
      <Body>
        <Text><Text style={{fontWeight: '800'}}>kofi </Text>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Asperiores soluta dolor eveniet fugiat rem ullam laudantium, quod accusamus autem numquam maxime tempora nisi commodi unde. Nisi repudiandae culpa omnis doloremque!</Text>
      </Body>
      </CardItem>
      </Card>
    )
  }
}

export class MainScreen extends Component {
  static navigationOptions = {
    headerLeft: <Icon name="ios-camera-outline"  style={{paddingLeft: 10}} />,
    title: "Instagram",
    headerRight: <Icon name="ios-send-outline" style={{paddingRight: 10}}/>
  }
  render() {
    return (
      <AppTabNavigator/>
    )
  }
}

const AppTabNavigator = TabNavigator({
  HomeTab: {
    screen: HomeTab
  },
  SearchTab: {
    screen: SearchTab
  },
  AddMediaTab: {
    screen: AddMediaTab
  },
  LikesTab: {
    screen: LikesTab
  },
  ProfileTab: {
    screen: ProfileTab
  }
}, {
  animationEnabled: true,
  swipeEnabled: true,
  tabBarPosition: "bottom",
  tabBarOptions: {
    style: {
      ...Platform.select({
        android:{
          backgroundColor: 'white'
        }
      })
    },
    activeTintColor: "black",
    inactiveTintColor: "grey",
    showLabel: false,
    showIcon: true
  }
})

export default class App extends React.Component {
  constructor(props){
    super(props);
  }

  render() {
    //const profilePictureURL = this.state.profilePicture;
    return (
      <View style={styles.container}>

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
  }
});
