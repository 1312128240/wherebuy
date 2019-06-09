import React,{Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions,
    TouchableOpacity
} from 'react-native'
import {dateToString, getNextYear,getNextMonth} from '../../../utils/dateUtil'
import {HTTP_REQUEST} from "../../../utils/config";
import AsyncStorageUtil from '../../../utils/AsyncStorageUtil';
import Toast from 'react-native-easy-toast';

const w = Dimensions.get('window').width;
const membershipRule1 = '1.比价5家超市' + '\n2.配送费10元/次';
const membershipRule2 = '1.比价8家超市' + '\n2.每月免费配送10次，超出10元/次' + '\n3.送1500元智能锁（会员到期收回）';
const membershipRule3 = '1.比价12家超市' + '\n2.每月免费配送20次，超出10元/次' + '\n3.送2990元智能锁（会员到期收回）';

/**
 * 开通会员
 */
export default class OpenVipPage extends Component{

    constructor(props){
        super(props);
        this.state={
            name:props.navigation.state.params.name,
            userId:props.navigation.state.params.userId,
            clickIndex:0,
            dataList:[],
            price:'',
            promoterDuration:'',
            accessToken:'',
            vipSelect:'NORMAL'
        }
    }

    componentDidMount(): void {
        this._createList();
        AsyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            });
        });
    }

    /**
     * 将question方法添加到props.navigation中
     */
    componentWillMount() {
        this.props.navigation.setParams({question: this.question});
    }

    /**
     * 设置导航栏
     */
    static navigationOptions = ({ navigation }) => {
        const {params} = navigation.state;
        return {
            headerTitle:"开通会员",
            headerTitleStyle: {flex:1, textAlign:'center',},
            headerRight: (
                <TouchableOpacity onPress={() => params.question()}>
                    <Image
                        style={{width:30,height:30,right:10}}
                        source={require('../../../img/question.png')}/>
                </TouchableOpacity>
            ),
        }
    };

    question = () =>this.props.navigation.navigate('VIPIntroduce');

    render(): React.ReactNode {
        return (
            <View style={{flex:1,backgroundColor:'#F4F3F1'}}>
                {this._headerView()}
                {this._centerView()}
                {this._footerView()}
                <Toast
                    ref="toast"
                    style={{backgroundColor:'gray'}}
                    position='bottom'
                    positionValue={300}
                    textStyle={{color:'white'}}
                />
            </View>
        )
    }

    _headerView() {
        return (
            <View style={openVipStyle.header}>
                <Image
                    style={{width:60,height:60,marginLeft:15,marginRight:15}}
                    source={{uri:'http://www.laykj.cn/wherebuy/images/2019/02/14/15/d40c2c26-20bc-4a4d-a012-e62c7ede7d80.png'}}/>
                <View>
                    <Text style={{fontWeight:'700',color:'#000',fontSize:18}}>{this.state.name}</Text>
                    <View style={{height:5}}/>
                    <Text style={{color:'#000'}}>首次开通</Text>
                </View>
            </View>
        )
    }

    //中间部份
    _centerView(){
        return (
            <View style={openVipStyle.center}>
                <View style={{width:w,height:40,justifyContent: 'center',flexDirection:'row'}}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={()=> this.changeVIP('NORMAL')}
                        style={this.state.vipSelect === 'NORMAL' ? openVipStyle.normal_vip_view_selected : openVipStyle.normal_vip_view}>
                        <Text style={this.state.vipSelect === 'NORMAL' ? {fontSize:18,color:'white'} : {fontSize:18}}>普通会员</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={()=> this.changeVIP('SENIOR')}
                        style={this.state.vipSelect === 'SENIOR' ? openVipStyle.senior_vip_view_selected : openVipStyle.senior_vip_view}>
                        <Text style={this.state.vipSelect === 'SENIOR' ? {fontSize:18,color:'white'} : {fontSize:18}}>高级会员</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={()=> this.changeVIP('SUPER')}
                        style={this.state.vipSelect === 'SUPER' ? openVipStyle.super_vip_view_selected : openVipStyle.super_vip_view}>
                        <Text style={this.state.vipSelect === 'SUPER' ? {fontSize:18,color:'white'} : {fontSize:18}}>超级VIP</Text>
                    </TouchableOpacity>
                </View>
                <View style={{width:w}}>
                    <Text style={{color:'#000', fontWeight:'700',textAlign:'center',fontSize:18,paddingTop:12,paddingBottom:12,}}>会员介绍</Text>
                    <Text style={{lineHeight:22,color:'#000',paddingLeft:50}}>{this.getVIPRule()}</Text>
                </View>
            </View>
        )
    }

    //点击选择VIP
    changeVIP(Select){
        this.setState({
            vipSelect:Select
        },()=>{
            this._createList();
        });
    }

    //根据VIP类型生成数据
    _createList(){
        let vipTypeList = [];
        if(this.state.vipSelect === 'NORMAL'){
            vipTypeList.push(
                {title:'1个月',price:'9.9',promoterDuration:1},
                {title:'12个月',price:'99',promoterDuration:12}
            )
        }else if(this.state.vipSelect === 'SENIOR'){
            vipTypeList.push(
                {title:'1个月',price:'99',promoterDuration:1},
                {title:'12个月',price:'999',promoterDuration:12}
            )
        }else if(this.state.vipSelect === 'SUPER'){
            vipTypeList.push(
                {title:'1个月',price:'199',promoterDuration:1},
                {title:'12个月',price:'1999',promoterDuration:12}
            )
        }
        this.setState({
            dataList:vipTypeList,
            price:vipTypeList[0].price,
            promoterDuration:vipTypeList[0].promoterDuration,
        })
    }

    //获取VIP规则
    getVIPRule(){
        if(this.state.vipSelect === 'NORMAL'){
            return membershipRule1;
        }
        if(this.state.vipSelect === 'SENIOR'){
            return membershipRule2;
        }
        if(this.state.vipSelect === 'SUPER'){
            return membershipRule3;
        }
    }

    //底部
    _footerView(){
        let viewList=[];
        this.state.dataList.map((bean,index)=>{
            viewList.push(
                <TouchableOpacity
                    key={index}
                    style={this._btnStyle(index)}
                    onPress={()=>
                        this.setState({
                            clickIndex:index,
                            price:bean.price,
                            promoterDuration:bean.promoterDuration
                        })
                    }>
                    <Text style={{color:'#000',fontSize:17,fontWeight:'700'}}>{bean.title}</Text>
                    <Text style={{color:'#FF1D1D',fontSize:17,fontWeight:'700'}}>¥{bean.price}</Text>
                    {this._imageVisible(index)}
                </TouchableOpacity>
            )
        });
        return (
            <View style={{flex:1,paddingTop:8,paddingLeft:15,paddingRight:15}}>
                {viewList}
                <View style={{height:45,width:w,flexDirection:'row',position:'absolute',bottom:0,}}>
                    <Text style={{flex:1,lineHeight:45,marginLeft:15,fontSize:17,color:'#FF1D1D'}}>¥{this.state.price}</Text>
                    <Text style={{flex:1,lineHeight:45,color:'#333333'}}>{this._countDown()}到期</Text>
                    <TouchableOpacity
                        style={{width:95,backgroundColor:'#FF1D1D',justifyContent:'center',alignItems:'center'}}
                        onPress={()=>this._openVip()}>
                        <Text style={{color:'#FFF',fontSize:15}}>立即开通</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    //点击切换背景
    _btnStyle = (flag)=>this.state.clickIndex === flag ? openVipStyle.btn_click : openVipStyle.btn_not_click;

    //控件角标图片显示与隐藏
    _imageVisible = (flag)=>this.state.clickIndex === flag ?
        <Image
            style={{position:'absolute',bottom:0,right:0,width:25,height:25}}
            source={require('../../../img/mark.png')}/>
        :
        null;

    //计算到期时间
    _countDown(){
        if(this.state.clickIndex === 1){
            return getNextYear(1)
        }else if(this.state.clickIndex === 0){
            let now = new Date();
            let dateStr = dateToString(now,'yyyy-MM-dd');
            return getNextMonth(dateStr)
        }
    }

    //立即开通会员
    _openVip(){
        fetch(HTTP_REQUEST.Host + '/promoter/promoter/openPromoterDuration.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                memberLevel: this.state.vipSelect,
                openMemberInfoId: -1,
                promoterDuration: this.state.promoterDuration,
                userId:this.state.userId
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if ('S' === responseJson.respCode) {
                this.refs.toast.show('开通成功',1000);
                setTimeout(()=> this.props.navigation.goBack(),1000)
            } else {
                this.refs.toast.show('开通失败',1000)
            }
        }).catch((error) => {});
    }
}

const openVipStyle = StyleSheet.create({
    //顶部布局
    header:{
        backgroundColor:'#FFF',
        height:80,
        flexDirection:'row',
        alignItems:'center'
    },
    //中部布局
    center:{
        paddingTop:15,
        paddingBottom:20,
        alignItems:'center',
        backgroundColor:'#FFF',
        marginTop:10,
    },
    btn_not_click:{
        flexDirection:'row',
        backgroundColor:'#FFF',
        height:50,
        justifyContent:'space-between',
        alignItems:'center',
        paddingLeft:10,
        paddingRight:10,
    },
    btn_click:{
        flexDirection:'row',
        backgroundColor:'#FFF',
        height:50,
        justifyContent:'space-between',
        alignItems:'center',
        paddingLeft:10,
        paddingRight:10,
        borderColor:'#FF1D1D',
        borderWidth: 1,
    },
    //选择VIP类型按钮
    normal_vip_view:{
        width:w*0.25,
        height:40,
        alignItems:'center',
        justifyContent:'center',
        borderTopLeftRadius:5,
        borderBottomLeftRadius:5,
        borderWidth:0.5,
        borderColor:'red'
    },
    normal_vip_view_selected:{
        width:w*0.25,
        height:40,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'red',
        borderTopLeftRadius:5,
        borderBottomLeftRadius:5,
    },
    senior_vip_view:{
        width:w*0.25,
        height:40,
        alignItems:'center',
        justifyContent:'center',
        borderWidth:0.5,
        borderColor:'red'
    },
    senior_vip_view_selected:{
        width:w*0.25,
        height:40,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'red',
    },
    super_vip_view:{
        width:w*0.25,
        height:40,
        alignItems:'center',
        justifyContent:'center',
        borderTopRightRadius:5,
        borderBottomRightRadius:5,
        borderWidth:0.5,
        borderColor:'red'
    },
    super_vip_view_selected:{
        width:w*0.25,
        height:40,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'red',
        borderTopRightRadius:5,
        borderBottomRightRadius:5,
    },
});