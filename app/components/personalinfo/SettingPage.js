import React, {Component} from 'react';
import {
    Image,
    StyleSheet,
    View,
    Dimensions,
    TouchableOpacity,
    Text,
} from 'react-native';
import {packageVersion} from 'react-native-update';
import asyncStorageUtil from '../../utils/AsyncStorageUtil'

const {width} = Dimensions.get('window');

/**
 * 设置页面/系统设置
 */
export default class SettingPage extends Component{
  
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillUnmount(){
        if(this.props.navigation.state.params.update != null){
            this.props.navigation.state.params.update();
        }
    }

    render() {
        let userInfo = this.props.navigation.state.params.userInfo;
        return (
            <View style={{flex:1,backgroundColor:'#F5F5F5'}}>
                <TouchableOpacity
                    style={styles.setting_item}
                     onPress={() => this.props.navigation.navigate('ProfilePage', {userInfo:userInfo})}>
                    <Image style={styles.setting_img} source={{uri:"http://qnm.laykj.cn/image/gerenxinxi.png"}}/>
                    <Text style={styles.setting_text}>个人信息</Text>
                    <Image style={styles.enter_icon} source={{uri:"http://qnm.laykj.cn/image/member_more.png"}}/>
                </TouchableOpacity>
                <Text style={styles.version_text} selectable={true}>Version {packageVersion}</Text>
                <TouchableOpacity
                  onPress={()=> this.logout()}
                  activeOpacity={0.7}
                  style={styles.logout_view}>
                  <Text style={styles.logout_text}>退出当前账户</Text>
                </TouchableOpacity>
            </View>
        );
    }

    logout(){
      asyncStorageUtil.putLocalData("accessToken","");
      this.props.navigation.navigate('AppAuthNavigator');
    }
}

const styles = StyleSheet.create({
    setting_item: {
      backgroundColor:'#FFF',
      borderTopWidth: 0,
      borderBottomWidth: 0.5, 
      borderBottomColor: '#D9D9D9',
      flexDirection:'row',
      alignItems:'center',
      width: width,
      height:60,
    },
    setting_img: {
      position:'absolute',
      width: 35,
      height:35,
      resizeMode:'contain',
      left:10
    },
    setting_text: {
      position:'absolute',
      fontSize:16,
      left:55
    },
    enter_icon: {
      position:'absolute',
      width: 15,
      height:15,
      resizeMode:'contain',
      left:width-25
    },
    version_text:{
        position:'absolute',
        width:width,
        height:30,
        bottom:60,
        textAlign: 'center'
    },
    logout_view:{
        position:'absolute',
        width:width,
        height:60,
        bottom:0,
        backgroundColor:"#EC7E2D",
        justifyContent:"center",
        alignItems:'center'
    },
    logout_text:{
        fontSize:20,
        color:"white",
        fontWeight:'bold'
    },
});
