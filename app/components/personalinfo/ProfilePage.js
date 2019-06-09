import React, {Component} from 'react';
import {
    Image,
    StyleSheet,
    View,
    Dimensions,
    TouchableOpacity,
    Text,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import asyncStorageUtil from "../../utils/AsyncStorageUtil";
import {HTTP_REQUEST, SAVE_USER_INFO} from "../../utils/config";
import Toast from 'react-native-easy-toast';
import BaseComponent from "../../views/BaseComponent";

const {width} = Dimensions.get('window');

/**
 * 个人信息页面
 */
export default class ProfilePage extends BaseComponent {

    constructor(props) {
    super(props);
    this.state = {
        accessToken:'',
        headImage:'http://192.168.0.6/image/woyaozai.jpg',
        nickname: '',
        birthday:'',
        sex:'',
    };
    this.openPic.bind(this);
  }

  componentWillUnmount(){
      if(this.props.navigation.state.params.update != null){
          this.props.navigation.state.params.update();
      }
  }

  componentDidMount(){
     super.componentDidMount();
      if(this.props.navigation.state.params.userInfo != null){
        let userInfo = JSON.parse(this.props.navigation.state.params.userInfo);
        this.setState({
            headImage:userInfo.headImage,
            nickname:userInfo.nickname,
            birthday:userInfo.birthday,
            sex:userInfo.sex=='MALE'?'男':'女',
        });
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({accessToken: data,});
        });
      }
  }

  render() {
    return (
        <View style={{flex:1,backgroundColor:'#F5F5F5'}}>
          <TouchableOpacity style={styles.profile_item} onPress={() => this.openPic()}>
             <Text style={styles.profile_item_name}>头像</Text>
             <Image style={styles.profile_head_img} source={{uri:this.state.headImage}}/>
             <Image style={styles.enter_icon} source={{uri:"http://qnm.laykj.cn/image/member_more.png"}}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profile_item} onPress={() => this.toSetPage("修改昵称",1)}>
             <Text style={styles.profile_item_name}>昵称</Text>
             <Text style={styles.profile_item_value}>{this.state.nickname}</Text>
             <Image style={styles.enter_icon} source={{uri:"http://qnm.laykj.cn/image/member_more.png"}}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profile_item} onPress={() => this.toSetPage("修改生日",2)}>
             <Text style={styles.profile_item_name}>生日</Text>
             <Text style={styles.profile_item_value}>{this.state.birthday}</Text>
             <Image style={styles.enter_icon} source={{uri:"http://qnm.laykj.cn/image/member_more.png"}}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profile_item} onPress={() => this.toSetPage("修改性别",3)}>
             <Text style={styles.profile_item_name}>性别</Text>
             <Text style={styles.profile_item_value}>{this.state.sex}</Text>
             <Image style={styles.enter_icon} source={{uri:"http://qnm.laykj.cn/image/member_more.png"}}/>
          </TouchableOpacity>

            <Toast
                ref="toast"
                style={{backgroundColor:'gray'}}
                position='bottom'
                positionValue={300}
                textStyle={{color:'white'}}
            />
        </View>
    );
  }

  /**
   * 跳转到个人信息修改页面
   * @param title 页面标题
   * @param type 页面类型
   */
  toSetPage(title,type){
     this.props.navigation.navigate(
         'SetProfilePage',
         {
             title:title,
             type:type,
             returnPara: (type,para) => {
                 if(type === 1){
                     this.setState({nickname: para});
                 }else if(type === 2){
                     this.setState({birthday: para});
                 }else if(type === 3){
                     this.setState({sex: para});
                 }
             },
         })
  }

  /**
   * 打开图片选择器
   */
  openPic(){
      ImagePicker.openPicker({
          width: 300,
          height: 300,
          cropping: true
      }).then(image => {
          this.updateLoadImg(image['path'])
      });
  }

  /**
   * 上传头像
   */
  updateLoadImg(path){
      let formData = new FormData();
      formData.append("headFile",{
          type : 'multipart/form-data',
          uri : path,
          name: 'image.jpg'
      });
      fetch(HTTP_REQUEST.Host + SAVE_USER_INFO,{
          method: 'POST',
          headers: {
              'accessToken':this.state.accessToken
          },
          body: formData
      })
      .then((response) => response.json())
      .then((responseJson) => {
         // alert("头像更新成功！");
          this.refs.toast.show("头像更新成功！",1000)
          this.setState({
              headImage:responseJson.data.headImage,
          });
      })
      .catch((error) =>{
          console.error(error);
      })
  }
}

const styles = StyleSheet.create({
    profile_item: {
      borderTopWidth: 0, 
      borderBottomWidth: 0.5, 
      borderBottomColor: '#D9D9D9',
      flexDirection:'row',
      alignItems:'center',
      width: width,
      height:60,
      backgroundColor:'#FFF',
    },
    profile_item_name: {
      position:'absolute',
      fontSize:18,
      left:10
    },
    profile_item_value: {
      position:'absolute',
      fontSize:16,
      right:35
    },
    profile_head_img: {
      position:'absolute',
      width: 50,
      height:50,
      borderRadius:90,
      right:35
    },
    enter_icon: {
      position:'absolute',
      width: 15,
      height:15,
      resizeMode:'contain',
      left: width-25
    },
});
