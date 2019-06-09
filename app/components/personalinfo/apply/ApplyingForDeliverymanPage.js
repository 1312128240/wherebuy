import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import Toast from 'react-native-easy-toast';
import ApplySucceedModal from './ApplySucceedModal'
import AddressModal from '../../../views/AddressModal'
import {HTTP_REQUEST,} from "../../../utils/config";
import ImagePicker from "react-native-image-crop-picker";
import asyncStorageUtil from "../../../utils/AsyncStorageUtil";
import BaseComponent from "../../../views/BaseComponent";
import Loading from '../../../views/LoadingModal';

const {width} = Dimensions.get('window');

/**
 * 申请成为配送员
 */
export default class ApplyingForDeliverymanPage extends BaseComponent{

    constructor(props) {
        super(props);
        this.state = {
            name:'',
            address:'请选择您的地址',
            phone:'',
            street_address:'',
            id_card_img_1:'http://qnm.laykj.cn/image/shangchuan.png',
            id_card_img_2:'http://qnm.laykj.cn/image/shangchuan.png',
            file1:'',
            file2:'',
            smallCommunityId:'',
            accessToken:'',
        };
    }

    componentDidMount(): void {
        super.componentDidMount();
        asyncStorageUtil.getLocalData('accessToken').then(data=>{
            this.setState({accessToken:data})
        });
    }

    render() {
        return (
            <ScrollView keyboardShouldPersistTaps ='always'>
                <View style={styles.input_view}>
                    <Text style={styles.input_name}>姓名：</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={(name) => this.setState({name})}
                        placeholder="请输入您的姓名">
                    </TextInput>
                </View>
                <View style={styles.input_view}>
                    <Text style={styles.input_name}>电话：</Text>
                    <TextInput
                        keyboardType={'numeric'}
                        style={styles.input}
                        maxLength={11}
                        onChangeText={(phone) => this.setState({phone})}
                        placeholder="请输入您的电话">
                    </TextInput>
                </View>
                <View style={styles.input_view}>
                    <Text style={styles.input_name}>住址：</Text>
                    <TouchableOpacity onPress={()=>{this.refs.AddressModal.setModalVisibleAddress(true);}}
                        style={styles.input}>
                        <Text style={styles.address_text} numberOfLines={2}>{this.state.address}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.input_view}>
                    <Text style={styles.input_name}>详细住址：</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={(result) => this.setState({street_address:result})}
                        placeholder="请输入您的详细住址">
                    </TextInput>
                </View>
                <Text style={styles.id_card_title}>身份证正面</Text>
                <Text style={{marginLeft:10}}>在有效期内，字迹清晰，没有遮挡、涂抹</Text>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.id_card_view}
                    onPress={()=>this.selectCard(1)}>
                    <Image
                        style={styles.id_card_img}
                        source={{uri:this.state.id_card_img_1}}
                    />
                </TouchableOpacity>
                <Text style={styles.id_card_title}>身份证反面</Text>
                <Text style={{marginLeft:10}}>在有效期内，字迹清晰，没有遮挡、涂抹</Text>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.id_card_view}
                    onPress={()=>this.selectCard(2)}>
                    <Image
                        style={styles.id_card_img}
                        source={{uri:this.state.id_card_img_2}}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={()=>this._submit()}
                    activeOpacity={0.7}
                    style={styles.confirm_button}>
                    <Text style={styles.confirm_text}>提交审核</Text>
                </TouchableOpacity>
                {/* 成功弹窗*/}
                <ApplySucceedModal ref={'ApplySucceed'} navi={this.props.navigation}/>
                {/* 地址弹窗*/}
                <AddressModal ref={'AddressModal'} callback={this.addressCallback.bind(this)}/>
                <Toast
                    ref="toast"
                    style={{backgroundColor:'gray'}}
                    position='bottom'
                    positionValue={300}
                    textStyle={{color:'white'}}
                />
                <Loading ref={'Loading'} hide = {true}/>
            </ScrollView>
        );
    }

    //选择图片
    selectCard(flag){
        ImagePicker.openPicker({
            compressImageQuality:0.7,
            //width: 400,
            //height: 400,
            //cropping: true,
            //includeBase64: true,
        }).then(image => {
            flag===1?
                this.setState({id_card_img_1:image['path'],file1:image['path']})
                :
                this.setState({id_card_img_2:image['path'],file2:image['path']})
        });
    }

    //父组件接收子组件的传值
    addressCallback(address,smallCommunityId){
        this.setState({
            address:address,
            smallCommunityId:smallCommunityId,
        })
    }

    //提交
    _submit(){
      if(this.state.name === ''){
          this.refs.toast.show('请输入姓名', 1000);
          return;
      }
      let myReg = /^((1[3-9][0-9])+\d{8})$/;
      if(this.state.phone === ''){
          this.refs.toast.show('请输入正确的手机号码',1000);
          return;
      }else if(!myReg.test(this.state.phone)){
          this.refs.toast.show('请输入正确的手机号码',1000);
          return;
      }
      if(this.state.smallCommunityId === ''){
          this.refs.toast.show('请选择地址',1000);
          return;
      }
      if(this.state.street_address === ''){
          this.refs.toast.show('请输入详细地址',1000);
          return;
      }
      if(this.state.file1 === ''||this.state.file2 === ''){
          this.refs.toast.show('请选择图片',1000);
          return;
      }
      this.refs.Loading.show();
      let formData = new FormData();
      formData.append("file",{
          type : 'multipart/form-data',
          uri : this.state.id_card_img_1,
          name: 'image.jpg'
      });
      formData.append("file",{
          type : 'multipart/form-data',
          uri : this.state.id_card_img_2,
          name: 'image.jpg'
      });
      formData.append('smallCommunityId',this.state.smallCommunityId);
      formData.append('realName',this.state.name);
      formData.append('mobile',this.state.phone);
      formData.append('address',this.state.address);
      formData.append('supermarketId',this.state.supermarketId);
      fetch( HTTP_REQUEST.Host+'/user/authentication/applyDeliverer.do', {
          method: 'POST',
          headers: {
             accessToken:this.state.accessToken,
          },
          body:formData
     })
     .then((response) => response.json())
     .then((responseJson)=>{
         this.refs.Loading.close();
         if(responseJson.respCode === 'S'){
             this.refs.ApplySucceed.setApplySucceedModal(true);
         }else {
             this.refs.toast.show(responseJson.errorMsg, 1000);
         }
     }).catch((error)=>{
          this.refs.Loading.close();
          this.refs.toast.show('提交失败', 1000);
     });
    }
}

const styles = StyleSheet.create({
    input_view: {
        height:50,
        borderColor:'gray',
        borderBottomWidth:0.5
    },
    input: {
        position:'absolute',
        left:100,
        right:6,
        height:50,
    },
    input_name: {
        position:'absolute',
        textAlignVertical:'center',
        height:50,
        width:100,
        fontSize:18,
        left:10
    },
    address_text: {
        height:50,
        left:6,
        color:'gray',
        fontSize:14,
        textAlignVertical:'center'
    },
    supermarket_text: {
        position:'absolute',
        left:108,
        height:50,
        color:'gray',
        fontSize:14,
        textAlignVertical:'center'
    },
    confirm_button: {
        width:width*0.9,
        height:45,
        left:width*0.05,
        marginTop:40,
        marginBottom:40,
        backgroundColor:"#EC7E2D",
        borderRadius:5,
        justifyContent:"center",
        alignItems:'center'
    },
    confirm_text: {
        fontSize:16,
        color:"white"
    },
    id_card_title: {
        fontSize:18,
        marginTop:15,
        marginLeft:10
    },
    id_card_view: {
        width:width*0.9,
        height:200,
        left:20,
        right:20,
        top:15,
        borderRadius:5,
        borderColor:'gray',
        borderWidth:0.5
    },
    id_card_img: {
        width:width*0.9,
        height:200,
        resizeMode:'center'
    },
});
