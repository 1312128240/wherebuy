import React, {Component} from 'react';
import {
    Image,
    StyleSheet,
    View,
    Text,
    FlatList
} from 'react-native';
import {HTTP_REQUEST} from "../../utils/config";
import asyncStorageUtil from "../../utils/AsyncStorageUtil";

/**
 * 周边超市列表
 */
export default class AroundSupermarket extends Component {

  constructor(props) {
    super(props);
    this.state = {
        accessToken: "",
        item_data:[]
    };
  }

  componentDidMount(){
      asyncStorageUtil.getLocalData("accessToken").then(data => {
          this.setState({
              accessToken: data,
          }, () => {
              this.getSupermarketList();
          });
      });
  }

  render() {
    return (
        <View>
          <FlatList
            data={this.state.item_data}
            renderItem={this.renderSupermarketView}
            keyExtractor={(item,index) => index.toString()}/>
        </View>
    );
  }

  renderSupermarketView({item}) {
    return (
      <View style={styles.supermarket_item}>
          <Image style={styles.supermarket_img} source={{uri:item.logo}}/>
          <Text ellipsizeMode='tail' numberOfLines={1} style={styles.supermarket_name}>{item.name}</Text>
          <Text ellipsizeMode='tail' numberOfLines={2} style={styles.supermarket_addr}>{item.address}</Text>
      </View>
    );
  }

  getSupermarketList(){
    fetch(HTTP_REQUEST.Host + '/goods/goods/supermarket.do',{
        method: 'POST',
        headers: {
            'Content-Type': HTTP_REQUEST.contentType,
            'accessToken':this.state.accessToken
        },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        if(responseJson.respCode !== 'S'){
            return;
        }
        this.setState({
            item_data:responseJson.data
        })
    })
    .catch((error) =>{
        console.error(error);
    })
  }
}

const styles = StyleSheet.create({
    supermarket_item: {
      borderTopWidth: 0,
      borderBottomWidth: 0.5,
      borderBottomColor: 'grey',
      alignItems:'center',
      height:100,
    },
    supermarket_img: {
      position:'absolute',
      resizeMode:'contain',
      width: 100,
      height: 80,
      left:10
    },
    supermarket_name: {
      position:'absolute',
      fontSize:20,
      left:120,
      top:15
    },
    supermarket_addr: {
      position:'absolute',
      fontSize:16,
      left:120,
      right:10,
      top:55
    },
});