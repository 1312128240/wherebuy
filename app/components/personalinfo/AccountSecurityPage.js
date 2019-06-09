import React, {Component} from 'react';
import {Image,StyleSheet,View,Dimensions,TouchableOpacity,Text,FlatList} from 'react-native';
import BaseComponent from "../../views/BaseComponent";

const {width} = Dimensions.get('window');

const item_data=[
  {key:"1",value: 'ChangePhoneNumPage',tip:'修改手机号'},
  {key:"2",value: 'ChangePWDPage',tip:'设置登录密码'},
  {key:"3",value: 'UnsubscribePage',tip:'注销账户'},
];

/**
 * 账户安全设置
 */
export default class AccountSecurityPage extends BaseComponent{
  
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
        <View>
          <FlatList
            style={styles.other_area}
            data={item_data}
            renderItem={this.renderView.bind(this)}
          />
        </View>
    );
  }

  renderView({item}) {
    return (
      <TouchableOpacity style={styles.task_item} onPress={() => this.props.navigation.navigate(item.value)}>
          <Text style={styles.task_text}>{item.tip}</Text>
          <Image style={styles.task_icon} source={{uri:"http://qnm.laykj.cn/image/member_more.png"}}/>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
    task_item: {
      borderTopWidth: 0, 
      borderBottomWidth: 0.5, 
      borderBottomColor: '#D9D9D9',
      flexDirection:'row',
      alignItems:'center',
      width: width,
      height:60,
    },
    task_text: {
      position:'absolute',
      fontSize:16,
      left:15
    },
    task_icon: {
      position:'absolute',
      width: 15,
      height:15,
      resizeMode:'contain',
      left:width-30
    },
});
