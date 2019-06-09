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
    Modal,
    FlatList
} from 'react-native';
import Toast from 'react-native-easy-toast'
import {HTTP_REQUEST,} from "../../../utils/config";
import AddressModal from '../../../views/AddressModal'
import AddressModalSupermarket from '../../../views/AddressModalSupermarket'
import ImagePicker from 'react-native-image-crop-picker';
import ApplySucceedModal from './ApplySucceedModal'
import asyncStorageUtil from "../../../utils/AsyncStorageUtil";
import BaseComponent from "../../../views/BaseComponent";
import Loading from "../../../views/LoadingModal";

const {width,height} = Dimensions.get('window');

/**
 * 申请成为采买员
 */
export default class ApplyingForBuyerPage extends BaseComponent{
  
    constructor(props) {
        super(props);
        this.superMarketItemLayout=this.superMarketItemLayout.bind(this);
        this.state = {
            modalVisibleSupermarket:false,
            name:'',
            address:'请选择您的地址',
            supermarketName:'选择地址决定超市',
            phone:'',
            street_address:'',
            id_card_img_1:'http://qnm.laykj.cn/image/shangchuan.png',
            id_card_img_2:'http://qnm.laykj.cn/image/shangchuan.png',
            areaList:[],
            supermarketList:[],
            supermarketId:'',
            areaCode:'',
            file1:'',
            file2:'',
            accessToken:'',
            flag:'',
        };
    }

    componentDidMount(): void {
        super.componentDidMount();
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
            <View style={styles.input_view}>
                <Text style={styles.input_name}>小区地址：</Text>
                <TouchableOpacity
                    onPress={()=>this.showAddressModal('1')}
                    style={styles.input}>
                    <Text style={styles.address_text} numberOfLines={2}>{this.state.address}</Text>
                </TouchableOpacity>
            </View>
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
                <TouchableOpacity style={{marginLeft:105}} onPress={()=>this.showAddressModal2('2')}>
                    <Text>{this.state.supermarketName}</Text>
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
            {/* 地址弹窗*/}
            <AddressModal ref={'AddressModal'} callback={this.addressCallback.bind(this)}/>
            {/* 选择超市模块地址弹窗*/}
            <AddressModalSupermarket ref={'AddressModalSupermarket'} callback={this.addressCallback2.bind(this)}/>
            {/* 超市弹窗*/}
            {this._modalSupermarket()}
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

    //超市弹窗
    setModalVisibleSupermarket(b){
        this.setState({
            modalVisibleSupermarket:b,
        })
    }

    _modalSupermarket(){
      return (
         <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.modalVisibleSupermarket}
            onRequestClose={() => {this.setModalVisibleSupermarket(false)}}>
            <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.6)',justifyContent: 'flex-end'}}>
              <View style={{backgroundColor:'#FFF',height:height-80}}>
                <View style={{height:36,borderBottomWidth: 1,borderBottomColor:'#D9D9D9',alignItems:'center',
                    flexDirection:'row',paddingLeft:20,paddingRight:8,}}>
                    <Text style={{color:'#EC7E2D',flex:1,textAlign:'center',paddingRight:24}}>选择您负责采买的超市</Text>
                    <TouchableOpacity onPress={()=>this.setModalVisibleSupermarket(false)}>
                        <Image style={{width:16,height:16,}} source={{uri:'http://qnm.laykj.cn/image/fork.png'}}/>
                    </TouchableOpacity>
                </View>
                <FlatList
                    renderItem={this.superMarketItemLayout}
                    data={this.state.supermarketList}
                    keyExtractor={(item, index) =>index.toString()} />
              </View>
            </View>
       </Modal>
      )
    }

    superMarketItemLayout({item}){
        return (
            <TouchableOpacity onPress={()=>this.clickSuperMarketItem(item)}>
                <Text style={{fontSize:15,color:'#303030',lineHeight:30,paddingLeft:15}}>{item.name}</Text>
            </TouchableOpacity>
        )
    }

    //点击选择超市
    clickSuperMarketItem(item){
        this.setState({
            supermarketId:item.supermarketId,
            supermarketName:item.name
        },()=>this.setModalVisibleSupermarket(false))
    }

    //获取超市数据
    _getSupermarketData(areaCode){
        fetch( HTTP_REQUEST.Host+'/area/Supermarket/getSupermarket.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                areaCode:areaCode
            }),
        })
        .then((response) => response.json())
        .then((responseJson)=>{
            if('S' === responseJson.respCode){
                this.setState({
                    supermarketList:responseJson.data,
                },()=> this.setModalVisibleSupermarket(true))
            }
        }).catch((error)=>{});
    }

    /**
     *  父组件接收子组件的传值
     *  address:详细地址字符串,
     *  areaCode:小区的编号,
     *  smallCommunityId：小区id
     */
    addressCallback(address,smallCommunityId,areaCode){
        this.setState({
            address:address,
            areaCode:areaCode,
           // smallCommunityId:smallCommunityId,
        },()=>{
            if(this.state.flag === '2'){
                this._getSupermarketData(areaCode)
            }
        })
    }

    addressCallback2(areaCode){
        this.setState({
            areaCode:areaCode,
        },()=>{
            if(this.state.flag === '2'){
                this._getSupermarketData(areaCode)
            }
        })
    }

    /*
     *地址弹窗的显示
     */
    showAddressModal(flag){
        this.setState({
            flag:flag,
        },()=>this.refs.AddressModal.setModalVisibleAddress(true))
    }

    //选择超市
    showAddressModal2(flag){
        this.setState({
            flag:flag,
        },()=>this.refs.AddressModalSupermarket.setModalVisibleAddress(true))
    }

    //选择图片
    selectCard(flag){
        ImagePicker.openPicker({
            compressImageQuality:0.7,
            //width: 400,
            //height: 400,
            //cropping: true,
            // includeBase64: true,
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
        formData.append('address',this.state.address);
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
    input_view: {
        height:50,
        borderColor:'gray',
        borderBottomWidth:0.5,
        justifyContent:'center'
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
