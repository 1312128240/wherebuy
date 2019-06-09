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
import Toast from 'react-native-easy-toast'
import {HTTP_REQUEST,} from "../../../utils/config";
import ImagePicker from 'react-native-image-crop-picker';
import ApplySucceedModal from './ApplySucceedModal'
import asyncStorageUtil from "../../../utils/AsyncStorageUtil";
import Loading from "../../../views/LoadingModal";

const {width,height} = Dimensions.get('window');

/**
 * 申请成为采买员
 */
export default class ApplyingForBuyerPage extends Component{
  
    constructor(props) {
        super(props);
        this.state = {
            name:'',
            addressTip:'',//小区名称
            address:'',//小区所属街道
            supermarketName:'',
            phone:'',
            street_address:'',//详细住址
            id_card_img_1:'http://qnm.laykj.cn/image/shangchuan.png',
            id_card_img_2:'http://qnm.laykj.cn/image/shangchuan.png',
            supermarketId:'',
            areaCode:'',
            file1:'',
            file2:'',
            accessToken:'',
        };
    }

    componentDidMount(): void {
        asyncStorageUtil.getLocalData('accessToken').then(data => {
            this.setState({accessToken: data})
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
            <TouchableOpacity
                activeOpacity={0.7}
                style={styles.address_input_view}
                onPress={() => this.props.navigation.navigate('AddressSearchPage',{
                    onAddressSelect: (address,fullName,smallCommunityId) => {
                        this.setState({
                            addressTip:address,
                            address:fullName,
                            areaCode:smallCommunityId
                        })
                    }
                })}>
                <Text style={styles.address_input_name}>收货地址:</Text>
                <View style={this.state.address === '' ? styles.address_input_tip_view:{width:0,height:0}}>
                    <Image
                        style={this.state.address === '' ? styles.address_input_tip_img : {width:0,height:0}}
                        source={require('../../../img/location_yellow.png')}/>
                    <Text style={styles.address_input_tip_text}>点击选择</Text>
                </View>
                <View style={this.state.address === '' ? {width:0,height:0}:styles.address_input_result_view}>
                    <Text style={styles.address_input_result_1}>{this.state.addressTip}</Text>
                    <Text style={styles.address_input_result_2}>{this.state.address}</Text>
                </View>
                <Image style={styles.address_input_enter_img} source={{uri:'http://qnm.laykj.cn/image/member_more.png'}}/>
            </TouchableOpacity>
            <View style={styles.input_view}>
                <Text style={styles.input_name}>详细住址：</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(street_address) => this.setState({street_address})}
                    placeholder="请输入您的详细住址">
                </TextInput>
            </View>
            <View style={styles.input_view}>
                <Text style={styles.input_name}>采买超市：</Text>
                <TouchableOpacity
                    style={{marginLeft:105}}
                    onPress={() => this.props.navigation.navigate('SuperMarketSearchPage',{
                        onAddressSelect: (address,fullName,supermarketId) => {
                            this.setState({
                                supermarketName:address,
                                supermarketId:supermarketId
                            })
                        }
                    })}>
                    <Text
                        style={this.state.supermarketName === '' ? {color:'#999999'} : {color:'#666666'}}>
                        {this.state.supermarketName === '' ? '请选择绑定超市' : this.state.supermarketName}
                    </Text>
                </TouchableOpacity>
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
        if(this.state.areaCode === ''){
            this.refs.toast.show('请选择您的地址', 1000);
            return;
        }
        if(this.state.supermarketId === ''){
            this.refs.toast.show('请选择采买超市', 1000);
            return;
        }
        if(this.state.street_address === ''){
            this.refs.toast.show('请输入您的详细地址', 1000);
            return;
        }
        if(this.state.file1 === ''||this.state.file2 === ''){
            this.refs.toast.show('请选择图片', 1000);
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
        formData.append('realName',this.state.name);
        formData.append('mobile',this.state.phone);
        formData.append('areaCode',this.state.areaCode);
        formData.append('address',this.state.street_address);
        formData.append('supermarketId',this.state.supermarketId);
        fetch( HTTP_REQUEST.Host+'/user/authentication/applyProcurer.do', {
            method: 'POST',
            headers: {
                accessToken: this.state.accessToken,
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
    //地址栏的输入框
    address_input_view:{
        height:70,
        alignItems:'center',
        flexDirection:'row',
        borderBottomColor:'#D9D9D9',
        borderBottomWidth:0.5
    },
    address_input_name:{
        fontSize:18,
        width:100,
        paddingLeft:10
    },
    address_input_tip_view:{
        flexDirection:'row',
        height:70,
        alignItems:'center',
        marginLeft:5
    },
    address_input_tip_img:{
        width:25,
        height:25,
        resizeMode:'contain'
    },
    address_input_tip_text:{
        fontSize:14,
        color:'#999999',
        marginLeft:5
    },
    address_input_result_view:{
        flexDirection:'column',
        height:70,
        justifyContent:'center',
        marginLeft:5
    },
    address_input_result_1:{
        fontSize:17,
        color:'rgba(51,51,51,1)'
    },
    address_input_result_2:{
        fontSize:14
    },
    address_input_enter_img:{
        position:'absolute',
        right:10,
        width:15,
        height:15,
        resizeMode:'contain'
    },
    //其他输入框
    input_view: {
        height:50,
        borderColor:'gray',
        borderBottomWidth:0.5,
        justifyContent:'center'
    },
    input_name: {
        position:'absolute',
        textAlignVertical:'center',
        height:50,
        width:100,
        fontSize:18,
        left:10
    },
    input: {
        position:'absolute',
        left:100,
        right:6,
        height:50,
    },
    //提交审核按钮
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
    //身份证图片框
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
