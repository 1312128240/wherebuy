import React,{Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    StyleSheet
} from 'react-native';
import Toast from "react-native-easy-toast";
import AsyncStorageUtil from "../../../utils/AsyncStorageUtil";
import {HTTP_REQUEST} from "../../../utils/config";

/**
 * 新建收货地址
 */
export default class CreateAddressPage extends Component{

    constructor(){
        super();
        this.state={
            name:'',
            phone:'',
            address:'',
            addressTip:'',
            smallCommunityId:'',
            detailAddress:'',
            sex:'MALE',
            accessToken:'',
        }
    }

    componentDidMount(): void {
        AsyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            });
        });
    }

    render(){
        return (
            <View style={{flex:1,backgroundColor:'#F4F3F1'}}>
                <View style={{backgroundColor:'#FFF'}}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={writeInfoStyle.layout}
                        onPress={() => this.props.navigation.navigate('AddressSearchPage',{
                            onAddressSelect: (address,fullName,smallCommunityId) => {
                                this.setState({
                                    addressTip:address,
                                    address:fullName,
                                    smallCommunityId:smallCommunityId
                                })
                            }
                        })}>
                        <Text style={[writeInfoStyle.title,{fontSize:19}]}>收货地址:</Text>
                        <View style={this.state.address === '' ? {flexDirection:'row',flex:1}:{width:0,height:0}}>
                            <Image style={this.state.address === '' ? {width:25,height:25,resizeMode:'contain'} : {width:0,height:0}}
                                   source={require('../../../img/location_yellow.png')}/>
                            <Text style={{paddingLeft:5,lineHeight:25,fontSize:14}}>点击选择</Text>
                        </View>
                        <View style={this.state.address === '' ? {width:0,height:0}:{flexDirection:'column',flex:1}}>
                            <Text style={{paddingLeft:5,lineHeight:25,fontSize:17,color:'rgba(51,51,51,1)'}}>{this.state.addressTip}</Text>
                            <Text style={{paddingLeft:5,lineHeight:25,fontSize:14}}>{this.state.address}</Text>
                        </View>
                        <Image style={{width:15,height:15,resizeMode:'contain'}} source={{uri:'http://qnm.laykj.cn/image/member_more.png'}}/>
                    </TouchableOpacity>
                    <View style={writeInfoStyle.layout}>
                        <Text style={writeInfoStyle.title}>门牌号:</Text>
                        <TextInput
                            placeholderTextColor='#757575'
                            onChangeText={(value) => this.setState({detailAddress:value})}
                            placeholder="例：16号楼302室">
                        </TextInput>
                    </View>
                    <View style={writeInfoStyle.layout}>
                        <Text style={writeInfoStyle.title}>联系人:</Text>
                        <TextInput
                            onChangeText={(name) => this.setState({name:name})}
                            placeholderTextColor='#757575'
                            placeholder="请填写收货人的姓名">
                        </TextInput>
                    </View>
                    <View style={{flexDirection:'row',alignItems:'center',marginLeft:120,height:55}}>
                        <TouchableOpacity onPress={()=>this.setState({sex:'MALE'})}>
                            <Image style={{width:18,height:18}}
                                   source={this.state.sex==='MALE' ? require('../../../img/selected.png') : require('../../../img/unselected.png')}/>
                        </TouchableOpacity>
                        <Text style={{marginLeft:15,color:'#303030'}}>先生</Text>
                        <TouchableOpacity onPress={()=>this.setState({sex:'FEMALE'})}>
                            <Image style={{marginLeft:90,width:18,height:18}}
                                   source={this.state.sex==='FEMALE'? require('../../../img/selected.png') : require('../../../img/unselected.png')}/>
                        </TouchableOpacity>
                        <Text style={{marginLeft:15,color:'#303030'}}>女士</Text>
                    </View>
                    <View style={[writeInfoStyle.layout,{borderTopColor: '#D9D9D9',borderTopWidth: 0.5}]}>
                        <Text style={writeInfoStyle.title}>手机号:</Text>
                        <TextInput
                            maxLength={11}
                            keyboardType={'numeric'}
                            onChangeText={(value) => this.setState({phone:value})}
                            placeholderTextColor='#757575'
                            placeholder="请填写收货人手机号码">
                        </TextInput>
                    </View>
                </View>
                <View>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={writeInfoStyle.btn}
                        onPress={()=>this._submit()}>
                        <Text style={{color:'#FFF',fontSize:18,fontWeight:'500'}}>保存地址</Text>
                    </TouchableOpacity>
                </View>
                <Toast
                    ref="toast"
                    style={{backgroundColor: 'gray'}}
                    position='center'
                    positionValue={200}
                    textStyle={{color: 'white'}}
                />
            </View>
        )
    }

    //提交
    _submit(){
        if(this.state.name === ''){
            this.refs.toast.show('请填写收货人名字',1000);
            return;
        }
        let myReg = /^((1[3-9][0-9])+\d{8})$/;
        if (this.state.phone === '') {
            this.refs.toast.show('请输入正确的手机号码',1000);
            return;
        } else if (!myReg.test(this.state.phone)) {
            this.refs.toast.show('请输入正确的手机号码',1000);
            return;
        }
        if(this.state.smallCommunityId === ''){
            this.refs.toast.show("请选择省市区地址",1000);
            return
        }
        if(this.state.detailAddress === ''){
            this.refs.toast.show('请填写详细地址',1000);
            return
        }
        fetch(HTTP_REQUEST.Host + '/user/address/addReceiveAddress.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
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
        }).catch((error) => {});
    }
}
const writeInfoStyle = StyleSheet.create({
    layout:{
        height:70,
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
        color:'rgba(51,51,51,1)',
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