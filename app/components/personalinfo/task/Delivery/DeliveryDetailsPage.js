import React,{Component} from 'react'
import {View,Text,Image,Dimensions,StyleSheet,TouchableOpacity,ScrollView,Linking} from 'react-native';
import {HTTP_REQUEST,} from "../../../../utils/config";
import {dateToString} from '../../../../utils/dateUtil'
import asyncStorageUtil from "../../../../utils/AsyncStorageUtil";
import BaseComponent from "../../../../views/BaseComponent";


/**
 * 配送详情
 */
export  default class DeliveryDetailsPage extends BaseComponent{


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
            detailsBean:'',
            detailsList:[],
            orderId:props.navigation.state.params.ordersId,
            accessToken:'',
        }
    }

    render(): React.ReactNode {
        return (
            <View style={{flex:1,backgroundColor:'#F5F5F5'}}>
                <ScrollView >
                    {this._headerView()}
                    {this._centerView()}
                    {this._footerView()}
                </ScrollView>
                {this.completeDeliveryView()}
            </View>
        )
    }

    componentDidMount() {
        super.componentDidMount();
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            },()=>{
                this.getData();
            });
        });
    }


    getData(){
        fetch( HTTP_REQUEST.Host+'/delivery/getDeliveryTaskDetails.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                ordersId: this.state.orderId
            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    this.setState({
                        detailsBean:responseJson.data,
                        detailsList:responseJson.data.shoppingCarList,
                    })
                }

            }).catch((error)=>{
            //alert("失败"+error)
        });
    }

    //头部view
    _headerView(){
        return(
            <View style={{backgroundColor:'#FFF'}}>
                <View style={{flexDirection:'row',height:38,alignItems:'center',justifyContent:'space-between',
                    borderBottomColor:'#D9D9D9',borderBottomWidth:0.5,paddingLeft:10,paddingRight:10}}>
                    <Text style={{color:'#303030'}}>{this._setHeaderTime()}</Text>
                    <Text style={{color:'#EB7E2D'}}>{this.state.detailsBean.communityStatus=="DELIVERING"?'配送中':'已完成'}</Text>
                </View>

                <View style={{flexDirection:'row',alignItems:'center',paddingLeft:12,paddingRight:12,paddingTop:15,paddingBottom:15}}>
                    <Image style={{width:30,height:35}} source={{uri:'http://192.168.0.6/image/location.png'}}/>
                    <View style={{width:w-50,paddingLeft:15,}}>
                        <View style={{flexDirection:'row',paddingBottom:6}}>
                            <Text style={{color:'#333333',width:100,marginRight:50,}} numberOfLines={1} ellipsizeMode={'tail'}>收货人:{this.state.detailsBean.receiverName}</Text>
                            <Text style={{color:'#333333'}}>电话号码:{<Text style={{color:'#EB7E2D',}}>{this.state.detailsBean.mobile}</Text>}</Text>
                        </View>

                        <Text style={{lineHeight:22,color:'#333333'}}>收货地址:{this.state.detailsBean.address}</Text>
                    </View>
                </View>
            </View>
        )
    }

    //中间部份
    _centerView(){
        let viewList=[];
        this.state.detailsList.map((bean,key)=>{
            viewList.push(
                <View key={key} style={{flexDirection:'row',borderBottomWidth:1,borderBottomColor: '#E9E9E9', paddingBottom:12,marginBottom: 8}}>
                    <Image style={{width:110,height:110,marginRight:10}} source={{uri: bean.goodsSkuImage}}/>

                    <View style={{justifyContent: 'space-between',width:w-140}}>
                        <Text style={{fontWeight: '700',color:'#000',fontSize:20}} numberOfLines={1} ellipsizeMode={'tail'}>{bean.goodsName}</Text>
                        <Text style={{fontSize:16,color:'#303030'}}>{bean.minSupermarketName}</Text>
                        <Text style={{fontSize:16,color:'#303030'}}>单价:{(bean.minPrice)/100}元</Text>
                        <View style={{flexDirection:'row',justifyContent: 'space-between'}}>
                            <Text style={{color:'#EC7E2D',fontSize:16}}>合计:{(bean.heJiPrice)/100}元</Text>
                            <Text style={{fontSize:16,color:'#303030'}}>数量 : x{bean.quantity}</Text>
                        </View>

                    </View>
                </View>
            )
        })

        return (
            <View style={detailsStyle.centerlayout}>
                {viewList}

                <View style={{flexDirection:'row',justifyContent:'space-between',paddingBottom:5}}>
                    <Text style={detailsStyle.tv}>商品总价格</Text>
                    <Text style={detailsStyle.tv}>{(this.state.detailsBean.goodsTotalPrice)/100}元</Text>
                </View>

                <View style={{flexDirection:'row',justifyContent:'space-between',paddingBottom:5}}>
                    <Text style={detailsStyle.tv}>服务费</Text>
                    <Text style={detailsStyle.tv}>{(this.state.detailsBean.serviceFee)/100}元</Text>
                </View>

                <View style={{flexDirection:'row',justifyContent:'space-between',paddingBottom:5}}>
                    <Text style={detailsStyle.tv}>合计</Text>
                    <Text style={detailsStyle.tv}>{(this.state.detailsBean.totalPrice)/100}元</Text>
                </View>

                <View style={{flexDirection:'row',justifyContent:'space-between',paddingTop:8,
                    borderTopColor:'#E9E9E9',borderTopWidth:1,marginTop: 10}}>
                    <Text style={{fontSize:18,color:'#303030'}}>实收</Text>
                    <Text style={{color:'#EC7E2D',fontSize:18}}>{(this.state.detailsBean.payPrice)/100}元</Text>
                </View>
            </View>
        )
    }

    //底部
    _footerView(){
        return (
            <View style={{backgroundColor: '#FFF',paddingTop:12,}}>

                <View>
                    <View style={{flexDirection: 'row',plpaddingBottom:12,paddingBottom: 10, alignItems: 'center'}}>
                        <View style={{width: 3, height: 15,marginLeft:15, marginRight: 10, backgroundColor: '#EC7E2D'}}></View>
                        <Text style={{fontSize:18,color:'#303030'}}>订单详情</Text>
                    </View>

                    <View style={{paddingLeft:28,paddingBottom:20}}>
                        <Text style={detailsStyle.tv_footer}>订单编号:{"     "+this.state.detailsBean.ordersId} </Text>
                        <Text style={detailsStyle.tv_footer}>创建时间:{this._setTime(this.state.detailsBean.createTime)}</Text>
                        <Text style={detailsStyle.tv_footer}>发货时间:{this._setTime(this.state.detailsBean.boxTime)}</Text>
                        <Text style={detailsStyle.tv_footer}>支付时间:{this._setTime(this.state.detailsBean.deliveryFinishTime)}</Text>
                    </View>
                </View>


                <View style={{flexDirection: 'row', borderTopColor: '#D9D9D9', borderTopWidth: 0.5,}}>
                    <TouchableOpacity onPress={() => {this.CallPhone(this.state.detailsBean.serviceMobile)}}>
                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: w / 2, borderRightColor: "#D9D9D9", borderRightWidth: 1, padding: 15}}>
                            <Image style={{width: 25, height: 25, marginRight: 10}} source={{uri: 'http://192.168.0.6/image/order_wangdian.png'}}/>
                            <Text  style={detailsStyle.tv}>联系网点</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {this.CallPhone(this.state.detailsBean.mobile)}}>
                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, width: w / 2,}}>
                            <Image style={{width: 25, height: 25, marginRight: 10}} source={{uri: 'http://192.168.0.6/image/order-consignee.png'}}/>
                            <Text style={detailsStyle.tv}>联系收货人</Text>
                        </View>
                    </TouchableOpacity>


                </View>

                <View style={{width: w, height: 50, backgroundColor: '#F5F5F5'}}></View>

            </View>
        )
    }

    //拨打电话
    CallPhone = (number) => {
        let tel = 'tel:' + number;
        Linking.canOpenURL(tel).then((supported) => {
            if (!supported) {
                console.log('Can not handle tel:' + tel)
                alert("电话号码不正确")
            } else {
                return Linking.openURL(tel)
            }
        })
    }

    //底部完成配送控件
    completeDeliveryView(){
        if(this.props.navigation.state.params.title==='配送详情'){
            return (
                <TouchableOpacity style={{height: 50,backgroundColor:'#EC7E2D',justifyContent:'center',alignItems:'center'}}
                                  onPress={()=>this._conmpleteDelivery()}
                >
                    <Text style={{color:'#FFF'}}>完成配送</Text>
                </TouchableOpacity>
            )
        }
    }

    //确认完成配送
    _conmpleteDelivery(){
        fetch(HTTP_REQUEST.Host + '/delivery/updateFinishedStatus.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                ordersId:this.state.orderId
            }),
        }).then((response) => response.json())
            .then((responseJson) => {
                if ('S'=== responseJson.respCode) {
                    this.props.navigation.state.params.refresh();
                    this.props.navigation.goBack();
                }

            }).catch((error) => {

        });
    }

    //设置时间
    _setTime=(time)=>time==null?'':"     "+dateToString(time,'yyyy-MM-dd hh:mm:ss');

    //下单时间或完成时间
    _setHeaderTime(){
        let time="";
        if(this.props.navigation.state.params.title==="配送详情"){
            time=this.state.detailsBean.createTime;
            return  "下单时间 : "+dateToString(time,'yyyy-MM-dd hh:mm:ss')
        }else {
            time=this.state.detailsBean.deliveryFinishTime;
            return  "完成时间 : "+dateToString(time,'yyyy-MM-dd hh:mm:ss');
        }

    }


}

const w=Dimensions.get('window').width;

const detailsStyle=StyleSheet.create({

    centerlayout:{
        backgroundColor:'#FFF',
        paddingLeft:12,
        paddingRight:8,
        paddingTop: 12,
        paddingBottom:12,
        borderTopWidth:10,
        borderTopColor:'#F5F5F5',
        borderBottomWidth:10,
        borderBottomColor:'#F5F5F5'
    },

    tv:{
        color:'#303030',
        fontSize:15,
    },

    tv_footer:{
        color: '#999999',
        fontSize:15,
        paddingBottom:3,
    }

})