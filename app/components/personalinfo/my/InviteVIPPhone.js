import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    TextInput, Modal
} from 'react-native';
import {HTTP_REQUEST} from "../../../utils/config";
import Toast from 'react-native-easy-toast'
import asyncStorageUtil from "../../../utils/AsyncStorageUtil";
import BaseComponent from "../../../views/BaseComponent";

const {width} = Dimensions.get('window');

/**
 * 邀请会员，输入手机号码验证
 */
export default class InviteVIPPhone extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            phone:'',
            visible:false,
            accessToken:'',
            userId:'',
        };
    }

    componentDidMount(){
        super.componentDidMount();
        this.props.navigation.setParams({navigatePress:this._submit});
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            });
        });
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: '输入手机号',
            headerTitleStyle: {flex:1, textAlign:'center'},
            headerRight: (
                <TouchableOpacity onPress={()=>navigation.state.params.navigatePress()} >
                    <Text style={styles.check_button_text}>确认</Text>
                </TouchableOpacity>
            ),
        }
    };

    render() {
        return (
            <View style={{alignItems:"center",flex:1}}>
                {this._modalView()}
                <TextInput
                    ref={'PhoneNumberInput'}
                    style={styles.phone_input}
                    value={this.state.phone}
                    maxLength={11}
                    keyboardType={'numeric'}
                    onChangeText={(phone) => this.setState({phone:phone})}
                    placeholder="请输入用户的手机号">
                </TextInput>
                <Toast
                    ref="toast"
                    style={{backgroundColor:'gray'}}
                    position='center'
                    //positionValue={300}
                    textStyle={{color:'white'}}
                />
            </View> 
        );
    }

    //弹窗
    _modalView(){
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.visible}
                onRequestClose={() => { this.setModalVisible(false)}}>
                <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.6)',justifyContent: 'center',alignItems:'center'}}>
                    <View style={{alignItems:'center',backgroundColor:'#FFF',width:width-80,borderRadius:6}}>
                        <Text style={{lineHeight:60,textAlign: 'center',fontSize:18,fontWeight:'700',color:'#000'}}>提示</Text>
                        <Text style={styles.tv_hint}>该手机号还未注册请填写顾客信息</Text>
                        <TouchableOpacity onPress={()=>this._jump()}>
                            <Text style={{color:'#FF1D1D',lineHeight:42,textAlign:'center'}}>填写顾客信息</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>
        )
    }

    setModalVisible(b){
        this.setState({
            visible:b,
        })
    }

    //跳转下一步去填写资料
    _jump=()=>{
        this.props.navigation.replace(
            'WriteInformation',
            {userId:this.state.userId}
        );
        this.setModalVisible(false)
    };

    //提交
    _submit=()=>{
        this.refs.PhoneNumberInput.blur();
        let myReg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if(this.state.phone === '') {
            this.refs.toast.show('请输入正确的手机号码',1000);
            return;
        }else if(!myReg.test(this.state.phone)) {
            this.refs.toast.show('请输入正确的手机号码',1000);
            return;
        }
        fetch(HTTP_REQUEST.Host +'/promoter/promoter/openPromoter.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                mobile:this.state.phone
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode === 'S'){
                this.setState({
                    userId:responseJson.data.userId
                },()=>{
                    if(responseJson.data.isRegist === 'TRUE'){
                        this.props.navigation.replace(
                            'WriteInformation',
                            {userId:this.state.userId}
                        )
                    }else {
                        //不是我们平台的
                        this.setModalVisible(true)
                    }
                })
            }else {
                this.refs.toast.show(responseJson.errorMsg,1000);
            }
        })
        .catch((error) =>{})
    }
}

const styles = StyleSheet.create({
    check_button_text: {
        fontSize:18,
        color:"#FF4500",
        right:15
    },
    phone_input: {
        height: 60,
        width:width*0.9,
        borderColor: '#EC7E2D',
        borderWidth:0.5,
        top:15,
        borderRadius:5,
        fontSize:18
    },
    tv_hint:{
        color:'#999999',
        width:width-80,
        textAlign:'center',
        paddingBottom:25,
        borderBottomWidth:1,
        fontSize:18,
        borderBottomColor:'#D9D9D9'
    }
});
