import React,{Component}from 'react'
import {View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity,Linking,DeviceEventEmitter} from 'react-native'
import {HTTP_REQUEST} from "../../../utils/config";
import asyncStorageUtil from "../../../utils/AsyncStorageUtil";
import  {dateToString} from '../../../utils/dateUtil'
import Toast from 'react-native-easy-toast'
import BaseComponent from "../../../views/BaseComponent";
import {RefreshState} from "react-native-refresh-list-view";
const w = Dimensions.get('window').width;


/**
 * 订单详情
 */
export  default class OrderDetails extends BaseComponent{

    constructor(props) {
        super(props);
        this.footerView = this.footerView.bind(this);
        this.state = {
            detailsBean: '',
            childList: [],
            accessToken:'',
            ordersId:props.navigation.state.params.ordersId
        };
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
        fetch(HTTP_REQUEST.Host + '/goods/order/getOrderDetails.do', {
            method: 'POST',
            headers: {
                'accessToken': this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                ordersId: this.state.ordersId
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode=='S'){
                this.setState({
                    detailsBean: responseJson.data,
                    childList: responseJson.data.shoppingCarList,
                })
            }

        }).catch((error) => {
           // alert("订单详情错误" + error)
        });
    }

    render() {
        return (
            <View style={{backgroundColor:"#F3F3F3",flex: 1}}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {this.headerView()}
                    {this.centerView()}
                    {this.footerView()}
                </ScrollView>
                {this._bottomView()}

                <Toast  //提示
                    ref="toast"
                    style={{backgroundColor:'gray'}}
                    position='bottom'
                    positionValue={200}
                    textStyle={{color:'white'}}/>
            </View>
        )
    }

    //头部
    headerView() {
        return (
            <View>
                <View style={{height: 110, backgroundColor: '#FFF', justifyContent: 'flex-end', alignItems: 'center',paddingLeft:30,paddingRight:30,paddingBottom:20}}>
                    <View style={{flexDirection: 'row', alignItems: 'center',justifyContent:'center'}}>
                        <View style={this.setp1()=='1'?styles.setpCircleGray:styles.setpCircle}/>
                        <View style={this.setp1()=='1'?styles.setpLineGray:styles.setpLine}/>
                        <View style={this.setp1()=='1'?styles.setpCircleGray:styles.setpCircle}/>
                        <View style={this.setp2()=='1'?styles.setpLineGray:styles.setpLine}/>

                        <View style={this.setp2()=='1'?styles.setpCircleGray:styles.setpCircle}/>
                        <View style={this.setp3()=='1'?styles.setpLineGray:styles.setpLine}/>
                        <View style={this.setp3()=='1'?styles.setpCircleGray:styles.setpCircle}/>

                    </View>
                    <View style={{width: (3*(w/4))+80, flexDirection: 'row', justifyContent: 'space-between',marginTop:5}}>
                        <Text style={this.setp1()=='1'?styles.setpTextColor1:styles.setpTextColor2}>已接单</Text>
                        <Text style={this.setp1()=='1'?styles.setpTextColor1:styles.setpTextColor2}>{this.procureStatus(this.state.detailsBean.communityStatus)}</Text>
                        <Text style={this.setp2()=='1'?styles.setpTextColor1:styles.setpTextColor2}>{this.deliveryStatus(this.state.detailsBean.communityStatus)}</Text>
                        <Text style={this.setp3()=='1'?styles.setpTextColor1:styles.setpTextColor2}>已收货</Text>
                    </View>
                </View>

                <View style={styles.headerAddress}>

                    <Image style={{width: 26, height: 28, marginLeft:15,marginRight: 15, }}
                           source={{uri: 'http://qnm.laykj.cn/image/location.png'}}/>

                    <View style={{width:w-70}}>
                        <View style={{flexDirection: 'row',}}>
                            <Text style={styles.tv}>收货人: {this.state.detailsBean.receiverName}</Text>
                            <View style={{width: 30}}></View>
                            <Text style={styles.tv}>电话号码: {this.state.detailsBean.mobile}</Text>
                        </View>

                        <Text style={[styles.tv,{lineHeight:22}]}>收货地址:{this.state.detailsBean.address}</Text>

                    </View>
                </View>
            </View>
        )
    }

    //中间
    centerView() {
        let viewList = [];
            this.state.childList.map((childBean,key) => {
                viewList.push(
                    <View key={key}>
                        <View style={styles.itemCenter}>

                            <Image style={{width: 100, height: 100}} source={{uri:childBean.goodsSkuImage}}/>

                            <View style={{paddingLeft: 5, paddingRight: 5, width: w - 130}}>
                                <Text style={{fontSize: 18, color: "#000000", width: w - 140, paddingBottom: 5, fontWeight:'700'}} numberOfLines={1} ellipsizeMode={'tail'}>{childBean.goodsName}</Text>

                                <View style={styles.itemCenterChild}>
                                    <Text numberOfLines={1} ellipsizeMode={'tail'} style={{width: w - 130,}}>最低价:{childBean.minPrice}元 {childBean.minSupermarketName}</Text>
                                </View>

                                <View style={styles.itemCenterChild}>
                                    <Text numberOfLines={1} ellipsizeMode={'tail'} style={{width:(w-130)/2,}}>最高价:{childBean.maxPrice}元{childBean.maxSupermarketName}</Text>
                                    <Text>数量: x{childBean.quantity}</Text>
                                </View>

                                <View style={[styles.itemCenterChild, styles.itemCenterChildBottom]}>
                                    <Text style={{color: "#EC8132", width:(w-130)/2,}} numberOfLines={1} ellipsizeMode={'tail'}>价差率:{childBean.spreadRate}</Text>
                                    <Text>合计:¥{childBean.heJiPrice}</Text>
                                </View>

                            </View>

                        </View>

                    </View>
                )
            })


        let statusFlag = '';
        let status=this.state.detailsBean.status;
        if ("PROCURING"==status) {
            statusFlag = "商品采买中";
        } else if ("DELIVER_FINISHED"==status) {
            statusFlag = "已完成";
        } else if ("PROCURE_FINISHED"==status) {
            statusFlag = "采买完成";
        } else if ("DELIVERING"== status) {
            statusFlag = "配送中";
        } else if ("CANCELED"==status) {
            statusFlag = "已取消";
        } else if ("PUBLISHING_PROCUREMENT" == this.state.detailsBean.communityStatus) {

        }

        return (
            <View style={{backgroundColor: '#FFF',padding: 10,marginTop:10,}}>

                <View style={styles.itemTitle}>
                    <Text>{this.state.detailsBean.createDate}</Text>
                    <Text style={{color: '#EC8132'}}>{statusFlag}</Text>
                </View>

                {viewList}

                <View style={{paddingTop:10,paddingBottom:10,marginBottom:10,borderBottomColor:'#D9D9D9',borderBottomWidth:0.5}}>
                    <View style={styles.title}>
                        <Text style={styles.tv}>商品总价</Text>
                        <Text style={styles.tv}>{this.state.detailsBean.goodsTotalPrice}</Text>
                    </View>

                    <View style={styles.title}>
                        <Text style={styles.tv}>服务费</Text>
                        <Text style={styles.tv}>{this.state.detailsBean.serviceFeeString}</Text>
                    </View>

                    <View style={styles.title}>
                        <Text style={styles.tv}>附加服务</Text>
                        <Text style={styles.tv}>{this.state.detailsBean.extraFeeString}</Text>
                    </View>

                    <View style={styles.title}>
                        <Text style={[styles.tv,]}>合计</Text>
                        <Text style={styles.tv}>{this.state.detailsBean.totalPrice}</Text>
                    </View>

                </View>

                <View style={styles.title}>
                    <Text style={[styles.tv,{fontSize:17}]}>实付</Text>
                    <Text style={{color: '#EC8132', fontSize: 17}}>{this.state.detailsBean.payPrice}</Text>
                </View>

            </View>
        )
    }

    //底部
    footerView() {
        return (
            <View style={{backgroundColor: '#FFF', marginTop: 10,}}>

                <View style={{padding: 10,}}>
                    <View style={{flexDirection: 'row', paddingBottom: 10, alignItems: 'center'}}>
                        <View style={{width: 3, height: 14, marginRight: 10, backgroundColor: '#EC7E2D'}}></View>
                        <Text style={styles.tv}>订单详情</Text>
                    </View>

                    <View style={{marginLeft: 14}}>
                        <Text style={{color: '#999999'}}>订单备注: {this.state.detailsBean.remark}</Text>
                        <Text style={{color: '#999999'}}>订单编号: {this.state.detailsBean.ordersId} </Text>
                        <Text style={{color: '#999999'}}>支付编号: {this.state.detailsBean.payNumber}</Text>
                        <Text style={{color: '#999999'}}>创建时间: {this.state.detailsBean.createDateStr}</Text>
                        {this._deliverTime()}
                        {this.receipTime()}
                    </View>

                </View>

                <View style={{flexDirection: 'row', borderTopColor: '#D9D9D9', borderTopWidth: 0.5,}}>
                    <TouchableOpacity onPress={() => {this.CallPhone(this.state.detailsBean.serviceMobile)}}>
                        <View style={{
                            flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: w/2,
                            borderRightColor: "#D9D9D9", borderRightWidth: 1, padding: 12
                        }}>
                            <Image style={{width: 25, height: 25, marginRight: 10}}
                                   source={{uri: 'http://qnm.laykj.cn/image/order_customer.png'}}/>
                            <Text>联系客服</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {this.CallPhone(this.state.detailsBean.communityPhone)}}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 12,
                            width: w / 2,
                        }}>
                            <Image style={{width: 25, height: 25, marginRight: 10}}
                                   source={{uri: 'http://qnm.laykj.cn/image/order_wangdian.png'}}/>
                            <Text>联系网点</Text>
                        </View>
                    </TouchableOpacity>


                </View>

                <View style={{width: w, height: 50, backgroundColor: '#F5F5F5'}}></View>

            </View>
        )

    }


    /**
     * 配送完成和取消则显示再来一单按钮
     * 配送中则显示确认收货
     */

    _bottomView() {
        let status=this.state.detailsBean.status;
        if ("DELIVER_FINISHED"==status||'CANCELED'==status||"FINISHED"==status) {
            return (
                <TouchableOpacity onPress={()=>this.againOrder(this.state.detailsBean.ordersId)}>
                    <View style={{width: w, height: 50, backgroundColor: "#FFF", justifyContent: 'center', alignItems: 'flex-end', paddingRight: 10}}>
                        <View style={{width: 80, paddingTop:4,paddingBottom:5, borderColor: "#EC8132", borderRadius: 25, borderWidth: 1, alignItems: 'center'}}>
                            <Text style={{color: "#EC8132"}}>再次购买</Text>
                        </View>
                    </View>
                </TouchableOpacity>

            )
        }else if("DELIVERING"==status){
            return (
                <TouchableOpacity onPress={()=>this.affirm()}>
                    <View style={{width: w, height: 50, backgroundColor: "#FFF", justifyContent: 'center', alignItems: 'flex-end', paddingRight: 10}}>
                        <View style={{width: 80, paddingTop:4,paddingBottom:5, borderColor: "#EC8132", borderRadius: 25, borderWidth: 1, alignItems: 'center'}}>
                            <Text style={{color: "#EC8132"}}>确认收货</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )
        }

    }


    //再来一单
    againOrder(id){
        fetch( HTTP_REQUEST.Host+'/goods/order/againOrders.do', {
            method: 'POST',
            headers: {
                'accessToken':this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                ordersId:id
            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    this.refs.toast.show('商品已经添加到购物车,请到购物车结算',1000)
                }else {
                    this.refs.toast.show('再来一单失败',1000)
                }
            }).catch((error)=>{
        });
    }

    //确认收货
    affirm=()=>{
        fetch( HTTP_REQUEST.Host+'/goods/order/updateOrderStatus.do', {
            method: 'POST',
            headers: {
                'accessToken': this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                ordersId:this.state.ordersId,
                userStatus: 'FINISHED'
            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if('S'===responseJson.respCode){
                    this.refs.toast.show("确认收货成功",1000);
                    this.props.navigation.goBack();
                }else {
                    this.refs.toast.show("确认收货失败",1000);
                }
            }).catch((error)=>{
            this.refs.toast.show(error,1000);
        });
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


    //第一条线和第二个圆和,只有取消才是灰色的
    setp1(){
        let status=this.state.detailsBean.communityStatus;
        if (status=='CANCELED') {
            return  '1'
        } else {
            return '2';
        }
    }

    //第二条线和第三个圆,只有配送和配送完成显示颜色
    setp2(){
        let status=this.state.detailsBean.communityStatus;
        if ("PROCURING" == status||'CANCELED'==status||'PROCURE_FINISHED'==status) {
            return  '1'
        } else if ("DELIVER_FINISHED"==status||"DELIVERING"==status) {
            return '2';
        }
    }

    //第三条线和最后一个圆,只有完成才显示颜色
    setp3(){
        let status=this.state.detailsBean.communityStatus;
        if ("DELIVER_FINISHED"!= status) {
            return '1';
        } else{
            return '2';
        }
    }

    //是采买中还是采买完成
    procureStatus=(status)=> 'PROCURE_FINISHED'==status||"DELIVER_FINISHED"==status||'DELIVERING'==status?'采买完成':'采买中';

    //配送状态
    deliveryStatus=(status)=>"DELIVER_FINISHED"==status?'配送完成':'配送中';

    //发货时间
    _deliverTime(){
        let deliveryTime=this.state.detailsBean.deliveryTime;
        if(deliveryTime!=null){
            return <Text style={{color: '#999999'}}>发货时间: {dateToString(deliveryTime,'yyyy-MM-dd hh:mm')}</Text>
        }
    }

    //收货时间
    receipTime(){
        if(this.state.detailsBean.deliveryFinishTime!=null){
            return <Text style={{color: '#999999'}}>收货时间: {dateToString(this.state.detailsBean.deliveryFinishTime,'yyyy-MM-dd hh:mm')}</Text>
        }else if(this.state.detailsBean.receiptTime!=null){
            return <Text style={{color: '#999999'}}>收货时间: {this.state.detailsBean.receiptTime}</Text>
        }
        return null;
    }

}

const  styles=StyleSheet.create({

    setpCircle:{
        width:10,
        height:10,
        backgroundColor:'#EC7E2D',
        borderRadius: 360,
    },

    setpCircleGray:{
        width:10,
        height:10,
        backgroundColor:'#D9D9D9',
        borderRadius: 360,
    },

    setpLine:{
       // width:75,
        width:w/4,
        height:2,
        backgroundColor:'#EC7E2D'
    },

    setpLineGray:{
        width:w/4,
        height:2,
        backgroundColor:'#D9D9D9'
    },

    setpTextColor1:{
        color:'#999999',
    },

    setpTextColor2:{
      color:'#EC7E2D'
    },


    headerAddress: {
        backgroundColor: '#FFF',
        alignItems: 'center',
        width: w,
        height: 70,
        marginTop: 5,
        flexDirection: 'row',
    },

    title:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
    },

    tv: {
        color: '#303030'
    },



    itemTitle:{
        flexDirection:'row',
        justifyContent:'space-between',
        borderBottomColor:'#D9D9D9',
        borderBottomWidth:0.5,
        paddingBottom: 2,
      //  marginBottom: 10,
    },

    itemCenter: {
       // padding:5,
        paddingTop:10,
        paddingBottom:10,
        width: w - 20,
        borderBottomWidth:0.5,
        borderBottomColor:'#D9D9D9',
        flexDirection: 'row',
    },

    itemCenterChild: {
        width: w - 130,
        //  backgroundColor:'#fa3314',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    itemCenterChildBottom: {
        position: 'absolute',
        bottom: 0,
        left: 5,
    },
})
