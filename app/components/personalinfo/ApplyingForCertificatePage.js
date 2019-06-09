import React, {Component} from 'react';
import {
    Image,
    StyleSheet,
    View,
    Dimensions,
    TouchableOpacity,
    Text,
    FlatList
} from 'react-native';

const {width} = Dimensions.get('window');
const item_data=[
  {key:"1",value: 'ApplyingForBuyerPage',imgUrl:'http://qnm.laykj.cn/image/caimai.png',tip:'申请成为采买员'},
  {key:"2",value: 'ApplyingForDeliverymanPage',imgUrl:'http://qnm.laykj.cn/image/auth_peisong.png',tip:'申请成为配送员'},
  {key:"3",value: 'ApplyingForShareManPage',imgUrl:'http://qnm.laykj.cn/image/jiagefenxiang.png',tip:'申请成为价格分享员'},
  {key:"4",value: 'ApplyingForFamilyPage',imgUrl:'http://qnm.laykj.cn/image/icon-family.png',tip:'申请成为家庭服务师'},
];

/**
 * 申请认证
 */
export default class ApplyingForCertificatePage extends Component {
  
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
            renderItem={this.renderView.bind(this)}/>
        </View>
    );
  }

  renderView({item}) {
    return (
      <TouchableOpacity style={styles.task_item} onPress={() => this.props.navigation.navigate(item.value)}>
          <Image style={styles.task_img} source={{uri:item.imgUrl}}/>
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
    task_img: {
      position:'absolute',
      width: 35,
      height:35,
      resizeMode:'contain',
      left:10
    },
    task_text: {
      position:'absolute',
      fontSize:16,
      left:55
    },
    task_icon: {
      position:'absolute',
      width: 15,
      height:15,
      resizeMode:'contain',
      left:width-30
    },
});
