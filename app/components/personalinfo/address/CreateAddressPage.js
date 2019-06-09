import React,{Component} from 'react';
import {View, Text, TouchableOpacity, Image, TextInput,StyleSheet} from 'react-native';
import Toast from "react-native-easy-toast";
import AddressModal from '../../../views/AddressModal'
import AsyncStorageUtil from "../../../utils/AsyncStorageUtil";
import {HTTP_REQUEST} from "../../../utils/config";
import BaseComponent from '../../../views/BaseComponent'

export default class CreateAddressPage extends BaseComponent{

    constructor(){
        super();
        this.state={
            name:'',
            phone:'',
            address:'省 市 区 街道信息',
            smallCommunityId:'',
            detailAddress:'',
            sex:'MALE',
            accessToken:'',
        }
    }

    render(): React.ReactNode {
        return (
            <View style={{flex:1,backgroundColor:'#F4F3F1'}}>

                <View style={{backgroundColor:'#FFF'}}>
                    <View style={writeInforStyle.layout}>
                        <Text style={writeInforStyle.title}>联系人:</Text>
                        <TextInput
                            onChangeText={(name) => this.setState({name:name})}
                            placeholderTextColor='#757575'
                            placeholder="请填写收货人">
                        </TextInput>
                    </View>


                    <View  style={{flexDirection:'row',alignItems:'center',marginLeft:120,height:55,}}>
                        <TouchableOpacity onPress={()=>this.setState({sex:'MALE'})}>
                            <Image style={{width:18,height:18}}
                                   source={this.state.sex==='MALE'? require('../../../img/selected.png') : require('../../../img/unselected.png')}/>
                        </TouchableOpacity>
                        <Text style={{marginLeft:15,color:'#303030'}}>先生</Text>

                        <TouchableOpacity onPress={()=>this.setState({sex:'FEMALE'})}>
                            <Image style={{marginLeft:90,width:18,height:18}}
                                   source={this.state.sex==='FEMALE'? require('../../../img/selected.png') : require('../../../img/unselected.png')}/>
                        </TouchableOpacity>
                        <Text style={{marginLeft:15,color:'#303030'}}>女士</Text>
                    </View>

                    <View style={[writeInforStyle.layout,{borderTopColor: '#D9D9D9',borderTopWidth: 0.5}]}>
                        <Text style={writeInforStyle.title}>手机号:</Text>
                        <TextInput
                            maxLength={11}
                            keyboardType={'numeric'}
                            onChangeText={(vaule) => this.setState({phone:vaule})}
                            placeholderTextColor='#757575'
                            placeholder="请填写手机号">
                        </TextInput>
                    </View>

                    <TouchableOpacity style={writeInforStyle.layout} onPress={()=>this.refs.AddressModal.setModalVisibleAddress(true)}>
                        <Text style={[writeInforStyle.title,{fontSize:19}]}>收货地址:</Text>
                        <Text style={{paddingLeft:5,paddingRight:5,flex:1,lineHeight:25}} numberOfLines={2} ellipsizeMode={'tail'}>{this.state.address}</Text>
                        <Image style={{width:15,height:15,resizeMode:'contain'}} source={{uri:'http://qnm.laykj.cn/image/member_more.png'}}/>
                    </TouchableOpacity>

                    <View style={writeInforStyle.layout}>
                        <Text style={writeInforStyle.title}>详细地址:</Text>
                        <TextInput
                            maxLength={11}
                            placeholderTextColor='#757575'
                            onChangeText={(vaule) => this.setState({detailAddress:vaule})}
                            placeholder="请填写详细地址">
                        </TextInput>
                    </View>

                    <View>
                        <TouchableOpacity style={writeInforStyle.btn} onPress={()=>this._submit()}>
                            <Text style={{color:'#FFF',fontSize:18,fontWeight:'500'}}>保存地址</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Toast
                    ref="toast"
                    style={{backgroundColor: 'gray'}}
                    position='center'
                    positionValue={200}
                    textStyle={{color: 'white'}}
                />
                {/* 地址弹窗*/}
                <AddressModal ref={'AddressModal'} callback={this.addressCallback.bind(this)}/>
            </View>

        )
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
        if(this.state.name==''){
            this.refs.toast.show('请填写收货人名字',1000);
            return;
        }

        let myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if (this.state.phone.length==0||this.state.phone == null) {
            this.refs.toast.show('请输入正确的手机号码',1000);
            return;
        } else if (!myreg.test(this.state.phone)) {
            this.refs.toast.show('请输入正确的手机号码',1000);
            return;
        }

        if(this.state.smallCommunityId==''){
            this.refs.toast.show("请选择省市区地址",1000)
            return
        }


        if(this.state.detailAddress==''){
            this.refs.toast.show('请填写详细地址',1000);
            return
        }


        AsyncStorageUtil.getLocalData('accessToken').then((accessToken) =>{
            fetch(HTTP_REQUEST.Host + '/user/address/addReceiveAddress.do', {
                method: 'POST',
                headers: {
                    accessToken:accessToken,
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                body: JSON.stringify({
                    addressOne: this.state.smallCommunityId,
                    addressTwo:this.state.detailAddress,
                    mobile: this.state.phone,
                    receiverName: this.state.name,
                    sex:this.state.sex
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    if ('S' === responseJson.respCode) {
                        this.props.navigation.goBack();
                        this.props.navigation.state.params.refresh();
                    } else {
                        this.refs.toast.show(responseJson.errorMsg,1000)
                    }

                }).catch((error) => {

                 // this.refs.toast.show(error,1000)
            });
        });
    }

}
const  writeInforStyle=StyleSheet.create({

    layout:{
        height:50,
        alignItems:'center',
        flexDirection:'row',
        paddingLeft:12,
        paddingRight:12,
        borderBottomColor:'#D9D9D9',
        borderBottomWidth:0.5
    },

    title:{
        width:100,
        fontSize:18,
        color:'#000',
        fontWeight: '700',
    },

    btn:{
        backgroundColor: '#EC7E2D',
        color: '#FFF',
        borderRadius:8,
        height:50,
        justifyContent:'center',
        alignItems: "center",
        marginLeft: 15,
        marginRight:15,
        marginTop:15,
        marginBottom:15,
    }
})