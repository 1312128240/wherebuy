import React,{Component} from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    BackHandler
} from 'react-native';
import Toast from 'react-native-easy-toast'
import {HTTP_REQUEST,} from "../../../../utils/config";
import AsyncStorageUtil from '../../../../utils/AsyncStorageUtil'

/**
 * 代顾客下单地址详情,可修改、删除顾客地址
 */
export default class ModificationCustomerAddrPage extends Component{

    constructor(props){
        super(props);
        this.state={
            name:'',
            phone:'',
            address:'',
            addressTip:'',
            smallCommunityId:'',
            detailAddress:'',
            sex:'1',
            sexShow:'',//因为返回的参数不统一，用这个来展示性别
            accessToken:'',
            isEdit:false,//是否为编辑状态
            receiveAddressId:'',
        }
    }

    //设置导航栏参数
    componentWillMount() {
        this.props.navigation.setParams({isEdit: false,editCustomerAddr: this.editCustomerAddr,backPress:this.backPress});
    }

    //卸载监听后退按钮事件
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentDidMount(): void {
        //添加监听后退按钮事件
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        let receiveAddressId = this.props.navigation.state.params.receiveAddressId;
        AsyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
                receiveAddressId: receiveAddressId,
            },()=>{
                this.getAddressInfo();
            });
        });
    }

    //自定义导航栏
    static navigationOptions = ({ navigation }) => {
        const {params} = navigation.state;
        return {
            headerTitle:"地址信息",
            headerTitleStyle: {flex:1, textAlign:'center'},
            headerLeft: (
                <TouchableOpacity onPress={() => params.backPress()}>
                    <Image
                        style={{width:25,height:25,left:15}}
                        source={require('../../../../img/back_img_black.png')}/>
                </TouchableOpacity>
            ),
            headerRight: (
                <TouchableOpacity onPress={() => params.editCustomerAddr()}>
                    <Text
                        style={params.isEdit ?
                            {fontSize:16,marginRight:15}
                            :
                            {fontSize:16,color:'#FF1D1D',marginRight:15}}>
                        {params.isEdit ? '删除' : '编辑'}
                    </Text>
                </TouchableOpacity>
            ),
        }
    };

    //导航栏编辑、删除按钮事件
    editCustomerAddr = () => {
        //删除
        if(this.state.isEdit){
            Alert.alert('删除地址后将无法恢复', '确定要删除地址吗？', [
                {text: '取消'},
                {text: '确定', onPress: ()=>this.deleteAddress()},
            ]);
        }else {
            //编辑
            this.props.navigation.setParams({isEdit: true});
            this.setState({
                isEdit:true,
            })
        }
    };

    //导航栏back键点击事件
    backPress = () => {
        if(this.state.isEdit){
            Alert.alert('', '确定要放弃此次编辑吗？', [
                {text: '取消'},
                {text: '确定', onPress: ()=>this.props.navigation.goBack()},
            ]);
        }else {
            this.props.navigation.goBack();
        }
    };

    //物理back键点击事件拦截
    handleBackPress = () => {
        if(this.state.isEdit){
            Alert.alert('', '确定要放弃此次编辑吗？', [
                {text: '取消'},
                {text: '确定', onPress: ()=>this.props.navigation.goBack()},
            ]);
        }else {
            this.props.navigation.goBack();
        }
        return true;
    };

    render(): React.ReactNode {
        return (
        <View style={{flex:1,backgroundColor:'#F4F3F1'}}>
            {this.state.isEdit ? this.renderEditView() : this.renderInfoView()}
            <View>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={this.state.isEdit ? writeInfoStyle.btn : {width:0,height:0}}
                    onPress={()=>this._submit()}>
                    <Text style={{color:'#FFF',fontSize:18,fontWeight:'500'}}>确认</Text>
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

    //编辑地址时View
    renderEditView(){
        return (
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
                    <Text style={[writeInfoStyle.title]}>收货地址:</Text>
                    <View style={{flexDirection:'column',flex:1}}>
                        <Text style={{fontSize:17,color:'#333333'}}>{this.state.addressTip}</Text>
                        <Text style={{fontSize:14,color:'#666666'}}>{this.state.address}</Text>
                    </View>
                    <Image style={{width:15,height:15,resizeMode:'contain'}} source={{uri:'http://qnm.laykj.cn/image/member_more.png'}}/>
                </TouchableOpacity>
                <View style={writeInfoStyle.layout}>
                    <Text style={writeInfoStyle.title}>门牌号:</Text>
                    <TextInput
                        style={writeInfoStyle.content}
                        value={this.state.detailAddress}
                        placeholderTextColor='#757575'
                        onChangeText={(value) => this.setState({detailAddress:value})}
                        placeholder="例：16号楼302室">
                    </TextInput>
                </View>
                <View style={writeInfoStyle.layout}>
                    <Text style={writeInfoStyle.title}>联系人:</Text>
                    <TextInput
                        value={this.state.name}
                        style={writeInfoStyle.content}
                        onChangeText={(name) => this.setState({name:name})}
                        placeholderTextColor='#757575'
                        placeholder="请填写收货人的姓名">
                    </TextInput>
                </View>
                <View style={{flexDirection:'row',alignItems:'center',marginLeft:120,height:55}}>
                    <TouchableOpacity onPress={()=>this.setState({sex:'1'})}>
                        <Image style={{width:18,height:18}}
                               source={this.state.sex==='1' ? require('../../../../img/selected.png') : require('../../../../img/unselected.png')}/>
                    </TouchableOpacity>
                    <Text style={{marginLeft:15,color:'#303030'}}>先生</Text>
                    <TouchableOpacity onPress={()=>this.setState({sex:'0'})}>
                        <Image style={{marginLeft:90,width:18,height:18}}
                               source={this.state.sex==='0'? require('../../../../img/selected.png') : require('../../../../img/unselected.png')}/>
                    </TouchableOpacity>
                    <Text style={{marginLeft:15,color:'#303030'}}>女士</Text>
                </View>
                <View style={[writeInfoStyle.layout,{borderTopColor: '#D9D9D9',borderTopWidth: 0.5}]}>
                    <Text style={writeInfoStyle.title}>手机号:</Text>
                    <TextInput
                        maxLength={11}
                        value={this.state.phone}
                        style={writeInfoStyle.content}
                        keyboardType={'numeric'}
                        onChangeText={(value) => this.setState({phone:value})}
                        placeholderTextColor='#757575'
                        placeholder="请填写收货人手机号码">
                    </TextInput>
                </View>
            </View>
        )
    }

    //展示地址信息时View
    renderInfoView(){
        return (
            <View style={{backgroundColor:'#FFF'}}>
                <View style={writeInfoStyle.layout}>
                    <Text style={[writeInfoStyle.title]}>收货地址:</Text>
                    <View style={{flexDirection:'column',flex:1}}>
                        <Text style={{fontSize:17,color:'#333333'}}>{this.state.addressTip}</Text>
                        <Text style={{fontSize:14,color:'#666666'}}>{this.state.address}</Text>
                    </View>
                </View>
                <View style={writeInfoStyle.layout}>
                    <Text style={writeInfoStyle.title}>门牌号:</Text>
                    <Text style={writeInfoStyle.content}>{this.state.detailAddress}</Text>
                </View>
                <View style={writeInfoStyle.layout}>
                    <Text style={writeInfoStyle.title}>联系人:</Text>
                    <Text style={writeInfoStyle.content}>{this.state.name}</Text>
                </View>
                <View style={writeInfoStyle.layout}>
                    <Text style={writeInfoStyle.title}>称呼:</Text>
                    <Text style={writeInfoStyle.content}>{this.state.sexShow}</Text>
                </View>
                <View style={writeInfoStyle.layout}>
                    <Text style={writeInfoStyle.title}>手机号:</Text>
                    <Text style={writeInfoStyle.content}>{this.state.phone}</Text>
                </View>
            </View>
        )
    }

    //获取地址信息
    getAddressInfo(){
        fetch(HTTP_REQUEST.Host + '/user/address/selectAddbyacGdAdId.do', {
            method: 'POST',
            headers: {
                'accessToken':this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({'receiveAddressId':this.state.receiveAddressId}),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if ('S' === responseJson.respCode) {
                let sexShow = '';
                let sex = '1';
                if(responseJson.data.sex === '1' || responseJson.data.sex === 'MALE'){
                    sexShow = '先生';
                    sex = '1';
                }else if(responseJson.data.sex === '0' || responseJson.data.sex === 'FEMALE'){
                    sexShow = '女士';
                    sex = '0';
                }
                this.setState({
                    name:responseJson.data.receiverName,
                    phone:responseJson.data.mobile,
                    addressTip:responseJson.data.smallName,
                    address:responseJson.data.areaName,
                    detailAddress:responseJson.data.addressTwo,
                    sexShow:sexShow,
                    sex:sex,
                })
            } else {
                this.refs.toast.show(responseJson.errorMsg,1000)
            }
        }).catch((error) => {
            this.refs.toast.show('网络错误',1000);
        });
    }

    //删除
    deleteAddress(){
        fetch(HTTP_REQUEST.Host+'/user/address/deleteGoodsAddrDef.do',{
            method: 'POST',
            headers: {
                'accessToken':this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({'receiveAddressId':this.state.receiveAddressId}),
        })
        .then((response) => response.json())
        .then((responseJson)=>{
            if ('S' === responseJson.respCode) {
                this.refs.toast.show('删除成功',1000);
                this._jump()
            } else {
                this.refs.toast.show(responseJson.errorMsg,1000)
            }
        }).catch((error)=>{});
    }

    //提交更新
    _submit(){
        if(this.state.name === ''){
            this.refs.toast.show('请填写收货人名字',1000);
            return
        }
        let myReg = /^((1[3-9][0-9])+\d{8})$/;
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
        fetch(HTTP_REQUEST.Host + '/user/address/modifyReceivingAddress.do', {
            method: 'POST',
            headers: {
                'accessToken':this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                receiveAddressId: this.state.receiveAddressId,
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
                this.refs.toast.show('更新成功',1000);
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
        height:70,
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
        color:'#333333'
    },
    content:{
        fontSize:16,
        color:'#333333'
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