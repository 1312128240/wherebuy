import React,{Component} from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity, Image,
} from 'react-native';

import Toast from 'react-native-easy-toast'
import AddressModal from '../../../../views/AddressModal'
import {HTTP_REQUEST,} from "../../../../utils/config";
import AsyncStorageUtil from '../../../../utils/AsyncStorageUtil'
import BaseComponent from "../../../../views/BaseComponent";

/**
 * 填写顾客信息，代顾客下单内的添加地址
 */
export default class AddCustomerAddrPage extends BaseComponent{

    constructor(props){
        super(props);
        this.state={
            name:'',
            phone:'',
            address:'省 市 区 街道信息',
            smallCommunityId:'',
            detailAddress:'',
            sex:'0',
            accessToken:'',
        }
    }

    render(): React.ReactNode {
        return (
            <View style={{flex:1,backgroundColor:'#F4F3F1'}}>
                <View style={{backgroundColor:'#FFF'}}>
                    <View style={writeInfoStyle.layout}>
                        <Text style={writeInfoStyle.title}>联系人:</Text>
                        <TextInput
                            onChangeText={(name) => this.setState({name:name})}
                            placeholder="请填写收货人">
                        </TextInput>
                    </View>
                    <View style={{flexDirection:'row',alignItems:'center',marginLeft:120,height:55,}}>
                        <TouchableOpacity onPress={()=>this.setState({sex:'1'})}>
                            <Image
                                style={{width:18,height:18}}
                                source={this.state.sex==='1'? require('../../../../img/selected.png') : require('../../../../img/unselected.png')}/>
                        </TouchableOpacity>
                        <Text style={{marginLeft:15,color:'#303030'}}>先生</Text>
                        <TouchableOpacity onPress={()=>this.setState({sex:'0'})}>
                            <Image
                                style={{marginLeft:90,width:18,height:18}}
                                source={this.state.sex==='0'? require('../../../../img/selected.png') : require('../../../../img/unselected.png')}/>
                        </TouchableOpacity>
                        <Text style={{marginLeft:15,color:'#303030'}}>女士</Text>
                    </View>
                    <View style={[writeInfoStyle.layout,{borderTopColor: '#D9D9D9',borderTopWidth: 0.5}]}>
                        <Text style={writeInfoStyle.title}>手机号:</Text>
                        <TextInput
                            maxLength={11}
                            keyboardType={'numeric'}
                            onChangeText={(value) => this.setState({phone:value})}
                            placeholder="请填写手机号">
                        </TextInput>
                    </View>
                    <TouchableOpacity style={writeInfoStyle.layout} onPress={()=>this.refs.AddressModal.setModalVisibleAddress(true)}>
                        <Text style={writeInfoStyle.title}>收货地址:</Text>
                        <Text style={{paddingLeft:3,}}>{this.state.address}</Text>
                    </TouchableOpacity>
                    <View style={writeInfoStyle.layout}>
                        <Text style={writeInfoStyle.title}>门牌号:</Text>
                        <TextInput
                            maxLength={11}
                            onChangeText={(value) => this.setState({detailAddress:value})}
                            placeholder="请填写详细地址">
                        </TextInput>
                    </View>
                    <View>
                        <TouchableOpacity style={writeInfoStyle.btn} onPress={()=>this._submit()}>
                            <Text style={{color:'#FFF'}}>确认</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Toast
                    ref="toast"
                    style={{backgroundColor: 'gray'}}
                    position='bottom'
                    positionValue={200}
                    textStyle={{color: 'white'}}
                />
                <AddressModal  ref={'AddressModal'} callback={this.addressCallback.bind(this)}/>
            </View>
        );
    }

    componentDidMount(): void {
        super.componentDidMount();
        AsyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            });
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
            this.refs.toast.show('请填写收货人名字',1000);
            return
        }
        let myReg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if (this.state.phone === '') {
            this.refs.toast.show('请输入正确的手机号码',1000);
            return;
        } else if (!myReg.test(this.state.phone)) {
            this.refs.toast.show('请输入正确的手机号码',1000);
            return;
        }
        if(this.state.areaCode === ''){
            this.refs.toast.show("请选择省市区地址",1000)
            return
        }
        if(this.state.detailAddress === ''){
            this.refs.toast.show('请填写详细地址',1000);
            return
        }
        fetch(HTTP_REQUEST.Host + '/promoter/promoter/addCustomerAddress.do', {
            method: 'POST',
            headers: {
                'accessToken':this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                addressOne: this.state.smallCommunityId,
                addressTwo: this.state.detailAddress,
                mobile: this.state.phone,
                receiverName: this.state.name,
                sex: this.state.sex,
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if ('S' === responseJson.respCode) {
                this._jump()
            } else {
                this.refs.toast.show(responseJson.errorMsg,1000)
            }

        }).catch((error) => {});
    }

    _jump=()=>{
        this.props.navigation.state.params.update();
        this.props.navigation.goBack();
    }
}

const writeInfoStyle = StyleSheet.create({
     layout:{
        height:50,
        alignItems:'center',
        flexDirection:'row',
        marginLeft:10,
        marginRight:10,
        borderBottomColor:'#D9D9D9',
        borderBottomWidth:0.5
     },
     title:{
         width:100,
         fontSize:18,
         color:'#303030'
     },
     btn:{
         backgroundColor: '#FF1D1D',
         color: '#FFF',
         borderRadius:50,
         height:45,
         justifyContent:'center',
         alignItems: "center",
         marginLeft: 10,
         marginRight:10,
         marginTop:15,
         marginBottom:15,
     }
});