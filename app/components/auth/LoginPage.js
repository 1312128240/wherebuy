import React, {Component} from 'react';
import {Image,StyleSheet,TextInput,View,Dimensions,TouchableOpacity,Text,ActivityIndicator} from 'react-native';
import asyncStorageUtil from '../../utils/AsyncStorageUtil'
import {HTTP_REQUEST,LOGIN} from '../../utils/config'
import Toast from "react-native-easy-toast";

const {width,height} = Dimensions.get('window');
/**
 * 登录页
 */
export default class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user_name: '',
      password: '',
      showLoading: false,
    };
  }

  render() {
    if(this.state.showLoading){
      return(
        <View style={{flex: 1, padding: 20}}>
          <ActivityIndicator/>
        </View>
      )
    }
    return (
        <View style={{alignItems:"center",flex:1}}>
          <Image style={styles.logo_img} source={{uri:'http://qnm.laykj.cn/image/login-logo.png'}}/>   
          <View style={styles.user_name_view}>
            <Text style={styles.user_name_86}>+86</Text>
            <TextInput
                keyboardType={'numeric'}
                ref={'UserNameInput'}
                value={this.state.user_name}
                style={styles.user_name_input}
                onChangeText={(user_name) => this.setState({user_name})}
                placeholder="请输入您的账号">
            </TextInput>
          </View>
          <View style={styles.password_view}>
            <Image
                style={styles.password_img}
                source={{uri:"http://qnm.laykj.cn/image/login-pwa.png"}}
             />
            <TextInput
                ref={'PassWordInput'}
                secureTextEntry={true}
                value={this.state.password}
                style={styles.password_input}
                onChangeText={(password) => this.setState({password})}
                placeholder="请输入您的密码">
            </TextInput>
          </View>
          <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate('ForgetPasswordPage');
                this.setState({
                  user_name: '',
                  password: '',
                })
              }}
              style={styles.forget_view}>
            <Text style={styles.forget_text}>忘记密码</Text>
          </TouchableOpacity>
          <TouchableOpacity
              activeOpacity={0.7}
              style={styles.login_button}
              onPress={() => this.login()}>
            <Text style={styles.login_text}>登录</Text>
          </TouchableOpacity>
          <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate('RegistrationPage');
                this.setState({
                  user_name: '',
                  password: '',
                })
              }}
              style={styles.registration_view}>
            <Text style={styles.registration_text}>注册账号</Text>
          </TouchableOpacity>
          <Toast
              ref="toast"
              style={{backgroundColor: 'gray'}}
              position='bottom'
              positionValue={200}
              textStyle={{color: 'white'}}/>
        </View>
    );
  }

  //验证手机号码
  checkMobile() {
    const reg = /^((1[3-9][0-9])+\d{8})$/;
    return reg.test(this.state.user_name)
  }

  //登录
  login(){
    this.refs.UserNameInput.blur();
    this.refs.PassWordInput.blur();
    if(this.state.user_name === ''){
      this.refs.toast.show('请输入手机号码！',1000);
      return
    }
    if(!this.checkMobile()){
      this.refs.toast.show('手机号码格式不正确！',1000);
      return
    }
    if(this.state.password === ''){
      this.refs.toast.show('请输入密码！',1000);
      return
    }
    this.setState({
      showLoading: true,
    });
    fetch(HTTP_REQUEST.Host + LOGIN,{
      method: 'POST',
      headers: {
        'Content-Type': HTTP_REQUEST.contentType,
      },
      body: JSON.stringify({
        mobile: this.state.user_name,
        password: this.state.password,
      }),
    })
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        showLoading: false,
      });
      if(responseJson.respCode !== 'S'){
        if(responseJson.errorCode === "2000") {
          this.refs.toast.show('账号/密码错误！',1000)
        }else if(responseJson.errorCode === "1914") {
          this.refs.toast.show('用户名不存在，请先注册！',1000)
        }else{
          this.refs.toast.show(responseJson.errorMsg,1000)
        }
      }else{
          asyncStorageUtil.putLocalData("accessToken",responseJson.data);
          this.props.navigation.navigate('AppStackNavigator')
      }
    })
    .catch((error) =>{
      console.error(error);
    })
  }
}

const styles = StyleSheet.create({
  logo_img: {
    width: 160,
    height: 100,
    top:10,
    resizeMode :'stretch',
  },
  login_button: {
    width:width*0.9,
    height:40,
    backgroundColor:"#EC7E2D",
    borderRadius:5,
    justifyContent:"center",
    alignItems:'center'
  },
  login_text: {
    fontSize:16,
    color:"white"
  },
  user_name_view: {
    height:50,
    width:width*0.95,
    marginTop:30,
    borderColor:'#EC7E2D',
    borderTopWidth:0.5
  },
  user_name_86: {
    position:'absolute',
    textAlign:'center',
    textAlignVertical:'center',
    height:50,
    width:50,
    fontSize:18,
    color:"#EC7E2D",
    left:10
  },
  user_name_input: {
    position:'absolute',
    left:60,
    height:50,
    width:width*0.7,
    borderColor:'#EC7E2D',
    borderLeftWidth:0.5
  },
  password_view: {
    height:50,
    width:width*0.95,
    justifyContent:'center',
    borderColor:'#EC7E2D',
    borderTopWidth:0.5,
    borderBottomWidth:0.5
  },
  password_img: {
    position:'absolute',
    resizeMode:'contain',
    height:25,
    width:25,
    left:20
  },
  password_input: {
    position:'absolute',
    left:60,
    height:50,
    width:width*0.7,
    borderColor:'#EC7E2D',
    borderLeftWidth:0.5
  },
  forget_view: {
    width:width*0.9,
    height:40,
    marginTop:15
  },
  forget_text: {
    position:'absolute',
    right:15,
    fontSize:16,
    color:"#EC7E2D"
  },
  registration_view: {
    width:width*0.9,
    height:40,
    marginTop:15
  },
  registration_text: {
    textAlign:'center',
    textAlignVertical:'center',
    fontSize:18,
    color:"#EC7E2D"
  },
});
