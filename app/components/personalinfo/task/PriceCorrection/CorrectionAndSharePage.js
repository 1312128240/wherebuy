import React,{Component} from 'react'
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    TextInput,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native'

import ImagePicker from 'react-native-image-crop-picker'
import {HTTP_REQUEST,} from "../../../../utils/config";
import Toast from "react-native-easy-toast";
import Picker from 'react-native-picker';
import asyncStorageUtil from "../../../../utils/AsyncStorageUtil";
import {getCurrentDate} from  '../../../../utils/dateUtil'

const w=Dimensions.get('window').width;


export default class CorrectionAndSharePage extends Component{

    static navigationOptions = ({navigation, screenProps}) => ({
        headerTitle: navigation.state.params.title,
        headerTitleStyle: {
            flex:1,
            textAlign:'center',
        },
        headerRight:(
           <View/>
        )
    });

    constructor(props){
        super(props);
        this.state={
            supermarketId:this.props.navigation.state.params.supermarketId,
            parentId:this.props.navigation.state.params.parentId,
            goodsSkuId:this.props.navigation.state.params.goodsSkuId,
            priceStr:'请选择价格类型',
            modalVisible:false,
            price:'',
            imgUrl:'http://qnm.laykj.cn/image/shangchuan.png',
            priceType:'',
            flag:'',
            startTime:'',
            endTime:'',
            file:'',
            accessToken:'',

        }
    }

    componentWillUnmount(): void {
        if(Picker!=null){
            Picker.hide();
        }
    }


    componentDidMount(): void {
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            });
        });

    }


    render(): React.ReactNode {
        return (
            <View style={{alignItems: 'center'}}>
                {this._modalView()}
                <TouchableOpacity onPress={()=>this._setModalVisible(true)}>
                    <View style={styles.layout}>
                        <Text style={[styles.tv]}>价格类型:</Text>
                        <Text style={{flex:1,fontSize:17,color:'#757575'}}>{this.state.priceStr}</Text>
                        <Image style={{width:15,height:15,resizeMode:'contain'}} source={{uri:'http://qnm.laykj.cn/image/member_more.png'}}/>
                    </View>
                </TouchableOpacity>


                <TouchableOpacity style={styles.layout} onPress={()=>this.setState({flag:1},()=>this._showTimePicker(),Keyboard.dismiss())}>
                    <Text style={styles.tv}>开始时间:</Text>
                    <Text style={{flex:1,fontSize:17,color:'#757575'}}>{this.state.startTime}</Text>
                    <Image style={{width:15,height:15,resizeMode:'contain'}} source={{uri:'http://qnm.laykj.cn/image/member_more.png'}}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.layout} onPress={()=>this.setState({flag:2},()=>this._showTimePicker(),Keyboard.dismiss())}>
                    <Text style={styles.tv}>结束时间:</Text>
                    <Text style={{flex:1,fontSize:17,color:'#757575'}}>{this.state.endTime}</Text>
                    <Image style={{width:15,height:15,resizeMode:'contain'}} source={{uri:'http://qnm.laykj.cn/image/member_more.png'}}/>
                </TouchableOpacity>

                <View style={styles.layout}>
                    <Text style={styles.tv}>{this.props.navigation.state.params.title==='价格纠错'?'纠错价格':'分享价格'}</Text>
                    <TextInput
                        keyboardType="decimal-pad"
                        placeholder="请输入价格元"
                        style={{flex:1,fontSize:17,color:'#757575'}}
                        onChangeText={(value) =>this.setState({price:value})}
                        onFocus={()=>Picker.hide()}
                    >
                    </TextInput>
                    <Image style={{width:15,height:15,resizeMode:'contain'}} source={{uri:'http://qnm.laykj.cn/image/member_more.png'}}/>
                </View>

                <TouchableOpacity style={styles.uploadImage} onPress={()=>this.selectPic()}>
                    <Image style={{ width:190, height:115, resizeMode:'center'}} source={{uri:this.state.imgUrl}}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btn} onPress={()=>this._submit()}>
                    <Text style={{color: '#FFF',fontSize: 19}}>{this.props.navigation.state.params.title==='价格纠错'?'确认纠错':'确认分享'}</Text>
                </TouchableOpacity>


                <Toast
                    ref="toast"
                    style={{backgroundColor:'gray'}}
                    position='center'
                    positionValue={200}
                    textStyle={{color:'white'}}
                />
            </View>
        );

    }


    //控件popwindow显示与隐藏
    _setModalVisible =(visible)=>{
        this.setState({
            modalVisible: visible,
        });
    }

    //modal
    _modalView(){
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => { this._setModalVisible(false)}}
            >
                <TouchableWithoutFeedback onPress={()=>this._setModalVisible(false)}>
                    <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.6)',justifyContent:'flex-end',}}>
                        <View style={{width:w,backgroundColor:'#FFF'}}>
                            <TouchableOpacity style={styles.priceModal} onPress={()=>this.selectPriceType('正常价','NORMAL')}>
                                <Text style={{fontSize:20,color:'#303030'}}>正常价</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.priceModal} onPress={()=>this.selectPriceType('促销价','PROMOTION')}>
                                <Text style={{fontSize:20,color:'#303030'}}>促销价</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.priceModal} onPress={()=>this.selectPriceType('处理价','DEAL')}>
                                <Text style={{fontSize:20,color:'#303030'}}>处理价</Text>
                            </TouchableOpacity >
                            <TouchableOpacity style={styles.priceModal} onPress={()=>this.selectPriceType('会员价','MEMBER')}>
                                <Text style={{fontSize:20,color:'#303030'}}>会员价</Text>
                            </TouchableOpacity>
                            <View style={{height:8,backgroundColor:'#E0E0E0'}}/>
                            <TouchableOpacity style={styles.priceModal} onPress={()=>this._setModalVisible(false)}>
                                <Text style={{fontSize:20,color:'#303030'}}>取消</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }

    //选择价格类型弹窗
    selectPriceType(str,type){
        this.setState({
            priceStr:str,
            priceType:type,
            modalVisible:false,
        })
    }

    //选择图片
    selectPic(){
        ImagePicker.openPicker({
            compressImageQuality:0.7,
        }).then(image => {
            this.setState({
                imgUrl:image['path'],
                file:image['path']
            })

        });
    }

    //确认分享或者纠错
    _submit(){
        if(this.state.priceType==''){
            this.refs.toast.show('请选择价格类型',1000);
            return;
        }

        if(this.state.startTime==''){
            this.refs.toast.show('请选择开始时间',1000);
            return;
        }

        if(this.state.endTime==''){
            this.refs.toast.show('请选择结束时间',1000);
            return;
        }

        if(!this.isNumber(this.state.price)){
            this.refs.toast.show('请输入正确的价格',1000);
            return;
        }

        if(this.props.navigation.state.params.title=='价格纠错'){
          this._sureCorrection()
        }else {
          this._sureShare();
        }
    }

    //确认纠错
    _sureCorrection=()=>{

        let formData = new FormData();

        formData.append("file",{
            type : 'multipart/form-data',
            uri : this.state.imgUrl,
            name: 'image.jpg'
        });
        formData.append('supermarketId',this.state.supermarketId);
        formData.append('goodsSkuId',this.state.goodsSkuId)
        formData.append('priceType',this.state.priceType);
        formData.append('startTime',this.state.startTime);
        formData.append('endTime',this.state.endTime);
        formData.append('price',(this.state.price)*100);
        formData.append('parentId',this.state.parentId);
        formData.append('type','CORRECT');

        fetch( HTTP_REQUEST.Host+'/correct/correct/correct.do', {
            method: 'POST',
            headers: {
                accessToken:  this.state.accessToken,
              //  'Content-Type': 'application/json;charset=UTF-8',
            },
            body:formData
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if(responseJson.respCode=='S'){
                    this.refs.toast.show('您的纠错申请提交成功!',1000);
                    this._jump();
                }else {
                    this.refs.toast.show(responseJson.errorMsg,1000);
                }
            }).catch((error)=>{
           // alert("纠错失败原因"+error)
        });
    }

    //确认分享
    _sureShare=()=>{
        let formData = new FormData();

        formData.append("file",{
            type : 'multipart/form-data',
            uri : this.state.imgUrl,
            name: 'image.jpg'
        });

        formData.append('supermarketId',this.state.supermarketId);
        formData.append('goodsSkuId',this.state.goodsSkuId)
        formData.append('priceType',this.state.priceType);
        formData.append('startTime',this.state.startTime);
        formData.append('endTime',this.state.endTime);
        formData.append('price',(this.state.price)*100);
        formData.append('type','SHARE');


        fetch( HTTP_REQUEST.Host+'/correct/correct/share.do', {
            method: 'POST',
            headers: {
                accessToken:  this.state.accessToken,
            },
            body:formData
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if(responseJson.respCode=='S'){
                    this.refs.toast.show('您的分享申请提交成功!',1000);
                    this._jump();
                }else {
                    this.refs.toast.show(responseJson.errorMsg,1000);
                }
            }).catch((error)=>{

        });
    }

    //延迟1s跳转
    _jump=()=> setTimeout(()=> this.props.navigation.goBack(),1000)


    //初始化时间
    initDate=()=>{
        //选择日期初始值
        let date = new Date();
        let currentMonth= date.getMonth()+1<10?'0'+(date.getMonth()+1):date.getMonth()+1;
        let currentDay=date.getDate()<10?'0'+(date.getDate()):date.getDate();
        let currentHours=date.getHours()<10?'0'+(date.getHours()):date.getHours();
        let currentMinute=date.getMinutes()<10?'0'+(date.getMinutes()):date.getMinutes();
        let selectedValue = [
            date.getFullYear(),
            currentMonth,
            currentDay,
            currentHours,
            currentMinute
        ];
        return selectedValue;
    }

    //显示时间选择器
    _showTimePicker() {
        let years = [],
            months = [],
            days = [],
            hours = [],
            minutes = [];

        for(let i=0;i<51;i++){
            years.push(i+new Date().getFullYear());
        }
        for(let i=1;i<13;i++){
            i<10?months.push("0"+i):months.push(i)
        }

        for(let i=1;i<32;i++){
           // days.push(i);
            i<10?days.push('0'+i):days.push(i);
        }

        for (let i = 0; i <24 ; i++) {
            // hours.push(i);
            i<10?hours.push('0'+i):hours.push(i);
        }

        for(let i=0;i<60;i++){
            // minutes.push(i);
            i<10?minutes.push('0'+i):minutes.push(i);
        }

        let pickerData = [years, months, days, hours, minutes];


        Picker.init({
            pickerData,
            selectedValue:this.initDate(),
            pickerTitleText: '选择日期和时间',
            pickerCancelBtnText:'取消',
            pickerConfirmBtnText:'确定',
            wheelFlex: [1, 1, 1, 1, 1, 1],
            onPickerConfirm: pickedValue => {
                let str1=pickedValue.join('');
                let str2=this.insertStr(str1,4,'-');
                let str3=this.insertStr(str2,7,'-');
                let str4=this.insertStr(str3,10,' ');
                let str5=this.insertStr(str4,13,':')
                //判断时间是否大于当前时间
                let str6=getCurrentDate();
                if(str5<str6){
                    this.state.flag=='1'?this.refs.toast.show("开始时间必须大于当前时间"):this.refs.toast.show("结束时间必须大于当前时间")
                }else {
                    this.state.flag=='1'?this.setState({startTime:str5}):this.setState({endTime:str5})
                }
            },
            onPickerCancel: pickedValue => {

            },
            onPickerSelect: pickedValue => {
                let targetValue = [...pickedValue];

                if(parseInt(targetValue[1]) === 2){
                    if(targetValue[0]%4 === 0 && targetValue[2] > 29){
                        targetValue[2] = 29;
                    }
                    else if(targetValue[0]%4 !== 0 && targetValue[2] > 28){
                        targetValue[2] = 28;
                    }
                } else if(targetValue[1] in {'04':1, '06':1, '09':1, '11':1} && targetValue[2] > 30){
                    targetValue[2] = 30;

                }
                // forbidden some value such as some 2.29, 4.31, 6.31...
                if(JSON.stringify(targetValue) !== JSON.stringify(pickedValue)){
                    targetValue.map((v, k) => {
                        if(k !== 3){
                            targetValue[k] = parseInt(v);
                        }
                    });
                    Picker.select(targetValue);
                    pickedValue = targetValue;
                }
            }
        });

        Picker.show();
    }


    //替换字符串
    insertStr(soure, start, newStr){
        return soure.slice(0, start) + newStr + soure.slice(start);
    }

    //判断是否是数字
    isNumber(val){
        let regPos = /^\d+(\.\d+)?$/; //非负浮点数
        let regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
        if(regPos.test(val) || regNeg.test(val)){
            return true;
        }else{
            return false;
        }

    }


}

const  styles=StyleSheet.create({
    layout:{
        width:w,
        height:55,
        flexDirection:'row',
        paddingLeft:10,
        paddingRight:15,
        alignItems:'center',
        borderBottomWidth:0.5,
        borderBottomColor:'#D9D9D9'
    },

    tv:{
       // marginLeft:8,
        paddingRight:8,
        fontSize:17,
        color:'#303030'
    },

     uploadImage:{
         justifyContent:'center',
         alignItems:'center',
         marginTop:20,
         marginBottom:30,
         width:190,
         height:115,
         borderRadius:8,
         borderColor:'#D9D9D9',
         borderWidth:0.8,
     },

    btn:{
        borderRadius:8,
        width:w-30,
        backgroundColor:'#EC712D',
        justifyContent: 'center',
        alignItems:'center',
        height:48,
    },

    priceModal:{
        height:50,
        justifyContent:'center',
        alignItems:'center',
        borderBottomColor: '#D9D9D9',
        borderBottomWidth:0.5,
    }
})