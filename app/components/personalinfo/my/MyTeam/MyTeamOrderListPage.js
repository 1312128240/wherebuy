import React,{Component} from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions
} from 'react-native';
import {HTTP_REQUEST} from "../../../../utils/config";
import RefreshListView,{RefreshState} from "react-native-refresh-list-view";
import AsyncStorageUtil from '../../../../utils/AsyncStorageUtil'
import Toast from "react-native-easy-toast";
import BaseComponent from "../../../../views/BaseComponent";

const w = Dimensions.get('window').width;

/**
 * 订单列表（会员列表的订单列表，代顾客下单订单记录也复用此处。接口参数有区别）
 */
export default class MyTeamOrderListPage extends BaseComponent{

    constructor(props){
        super(props);
        this._renderItem = this._renderItem.bind(this);
        this.state={
            headerBean:'',
            checkIndex:0,
            memberId:props.navigation.state.params.memberId,
            date:"MONTH",
            lists:[],
            userId:'',
            accessToken:'',
            currentPage:1,
            totalPage:1,
            //代顾客下单，通过收货地址区分顾客，所以接口请求用receiveAddressId
            receiveAddressId:props.navigation.state.params.receiveAddressId
        }
    }

    componentDidMount(): void {
        super.componentDidMount();
        AsyncStorageUtil.getLocalData("accessToken").then(data => {
            this.setState({
                accessToken:data,
            }, () => {
                this.getHeaderData();
                this.Refresh();
            });
        });
    }

    render(): React.ReactNode {
        return (
            <View style={{flex:1,backgroundColor:'#F4F3F1'}}>
                <RefreshListView
                    data={this.state.lists}
                    keyExtractor={(item, index) =>index.toString()}
                    showsVerticalScrollIndicator = {false}
                    renderItem={this._renderItem}
                    refreshState={this.state.refreshState}
                    ListEmptyComponent={
                        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                            <Text>暂无数据!</Text>
                        </View>}
                    ListHeaderComponent={this._headerView()}
                    onHeaderRefresh={()=>{
                        this.setState({
                            refreshState: RefreshState.HeaderRefreshing,
                            currentPage:1,
                        },()=>{
                            this.Refresh();
                        });
                    }}
                    onFooterRefresh={()=>{
                        if(this.state.currentPage >= this.state.totalPage){
                            this.refs.toast.show('全部加载完毕',1000);
                        }else {
                            let current = this.state.currentPage;
                            this.setState({
                                currentPage: current+1,
                                refreshState: RefreshState.FooterRefreshing
                            },()=> {
                                this.LoadMore();
                            });
                        }
                    }}
                />
                <Toast
                    ref="toast"
                    style={{backgroundColor:'gray'}}
                    position='bottom'
                    positionValue={200}
                    textStyle={{color:'white'}}
                />
            </View>
        );
    }

    //获取头部数据
    getHeaderData(){
        let body;
        if(this.state.memberId !== null){
            body = {
                date: this.state.date,
                memberId: this.state.memberId,
                type: "memberInfo"
            };
        }
        if(this.state.receiveAddressId !== null){
            body = {
                date: this.state.date,
                receiveAddressId: this.state.receiveAddressId,
                type: "addressInfo"
            };
        }
        fetch( HTTP_REQUEST.Host+'/promoter/promoter/memberDetails.do', {
            method: 'POST',
            headers: {
                'accessToken':this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify(body),
        })
        .then((response) => response.json())
        .then((responseJson)=>{
            if(responseJson.respCode === 'S'){
                this.setState({
                    headerBean:responseJson.data,
                })
            }
        }).catch((error)=>{});
    }

    //刷新订单列表数据
     Refresh(){
         let body;
         if(this.state.memberId !== null){
             body = {
                 currentPage: this.state.currentPage,
                 pageSize: 10,
                 range: this.state.date,
                 userId: this.state.memberId
             };
         }
         if(this.state.receiveAddressId !== null){
             body = {
                 receiveAddressId:this.state.receiveAddressId,
                 pageSize: 10,
                 currentPage: this.state.currentPage,
                 range: this.state.date,
             };
         }
         fetch( HTTP_REQUEST.Host+'/promoter/promoter/getOrdersList.do', {
             method: 'POST',
             headers: {
                 'accessToken':this.state.accessToken,
                 'Content-Type': 'application/json;charset=UTF-8',
             },
             body: JSON.stringify(body),
         })
         .then((response) => response.json())
         .then((responseJson)=>{
             if(responseJson.respCode === 'S'){
                 this.setState({
                     lists:responseJson.data.data,
                     refreshState: RefreshState.Idle,
                     totalPage:responseJson.data.totalPage,
                 })
             }
         }).catch((error)=>{});
     }

     //加载更多
     LoadMore(){
         let body;
         if(this.state.memberId !== null){
             body = {
                 currentPage: this.state.currentPage,
                 pageSize: 10,
                 range: this.state.date,
                 userId: this.state.memberId
             };
         }
         if(this.state.receiveAddressId !== null){
             body = {
                 receiveAddressId:this.state.receiveAddressId,
                 pageSize: 10,
                 currentPage: this.state.currentPage,
                 range: this.state.date,
             };
         }
        fetch( HTTP_REQUEST.Host+'/promoter/promoter/getOrdersList.do', {
            method: 'POST',
            headers: {
                'accessToken':this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify(body),
        })
        .then((response) => response.json())
        .then((responseJson)=>{
            if(responseJson.respCode === 'S'){
                this.setState({
                    lists: [...this.state.lists, ...responseJson.data.data],
                    refreshState: RefreshState.Idle,
                    totalPage:responseJson.data.totalPage,
                })
            }
        }).catch((error)=>{});
    }

    _headerView(){
        return (
            <View style={{backgroundColor:'#FFF'}}>
                <Image
                    style={{width:80,height:80,alignSelf:'center',marginTop:10}}
                    source={{uri:this.state.headerBean.headImage}}/>
                <Text
                    style={{alignSelf:'center',fontSize:16,color:'#303030',marginBottom:10,marginTop:10}}>
                    {this.state.headerBean.nickname}
                </Text>
                <View style={{alignSelf:'center',borderRadius:8,borderWidth:1,borderColor:'#FF1D1D',flexDirection:'row',marginBottom:15}}>
                    <TouchableOpacity
                            style={this.state.checkIndex === 0 ? teamOrderStyle.checkLeftBg : teamOrderStyle.not_checkBg}
                            onPress={()=>this.click('MONTH',0)}>
                            <Text
                                style={this.state.checkIndex === 0 ? teamOrderStyle.checkTv : teamOrderStyle.not_checkTv}>
                                本月
                            </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                            style={this.state.checkIndex === 1?teamOrderStyle.checkRightBg:teamOrderStyle.not_checkBg}
                            onPress={()=>this.click('ALL',1)}>
                            <Text
                                style={this.state.checkIndex === 1?teamOrderStyle.checkTv:teamOrderStyle.not_checkTv}>
                                全部
                            </Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <View style={{flexDirection:'row'}}>
                        <View style={{flex:1,alignItems:'center',height:70,justifyContent:'center',borderRightWidth:0.5,borderRightColor:'#D9D9D9'}}>
                            <Text style={teamOrderStyle.tv_ordernumber}>{this.state.headerBean.numberOfOrders}</Text>
                            <View style={{height:5}}/>
                            <Text style={teamOrderStyle. tv_ordertype}>累计订单数</Text>
                        </View>
                        <View style={{flex:1,alignItems:'center',height:70,justifyContent:'center',}}>
                            <Text style={teamOrderStyle.tv_ordernumber}>¥ {(this.state.headerBean.totalSum)/100}</Text>
                            <View style={{height:5}}/>
                            <Text style={teamOrderStyle. tv_ordertype}>累计订单额</Text>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    //点击事件
    click(date,i){
        this.setState({
            date:date,
            checkIndex:i,
            currentPage:1,
        },()=>{
          this.getHeaderData();
          this.Refresh()
        })
    }

    _renderItem ({item}){
        let viewList=[];
        item.shoppingCarList.map((bean,index)=>{
            viewList.push(
                <View key={index} style={teamOrderStyle.itemLayout}>
                    <Image style={{width:100,height:100,marginRight:10,}} source={{uri:bean.goodsSkuImage}}/>
                    <View style={{width:w-130,height:100,justifyContent:'space-between'}}>
                        <Text style={{color:'#000',fontSize:19,fontWeight: '700'}} numberOfLines={1} ellipsizeMode={'tail'}>{bean.goodsName}</Text>
                        <View style={{flexDirection:'row',}}>
                            <Text style={{color:'#303030',marginRight:30}}>最低价:{bean.minPrice}元</Text>
                            <Text style={{color:'#303030',width:120}} numberOfLines={1} ellipsizeMode={'tail'}>{bean.minSupermarketName}</Text>
                        </View>
                        <View style={{flexDirection:'row'}}>
                            <Text style={{color:'#303030',marginRight:30}}>最高价:{bean.maxPrice}元</Text>
                            <Text style={{color:'#303030',width:120}} numberOfLines={1} ellipsizeMode={'tail'}>{bean.maxSupermarketName}</Text>
                        </View>
                        <Text style={{color:'#303030',position:'absolute',right:0,bottom:25}}>数量 x{bean.quantity}</Text>
                        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                            <Text style={{color:'#FF1D1D',fontWeight:'500',marginRight:30,fontSize:16}}>价差率: {bean.spreadRate}</Text>
                            <Text style={{color:'#303030',}}>合计: ¥{bean.heJiPrice}</Text>
                        </View>
                    </View>
                </View>
            )
        });
        return (
            <View style={{backgroundColor:'#FFF',marginTop:10}}>
                <View style={teamOrderStyle.itemTitle}>
                    <Text style={{color:'#000'}}>{item.ordersId}</Text>
                    <Text style={{color:'#FF1D1D'}}>{this._getStatus(item.status)}</Text>
                </View>
                {viewList}
                <View style={teamOrderStyle.itemFooter}>
                    <Text style={{color:'#000'}}>合计数量: {item.quantity}件</Text>
                    <Text style={{color:'#000'}}>合计金额: ¥ {item.totalPrice}</Text>
                </View>
            </View>
        )
    }

    _getStatus=(status)=>{
      if(status==='CANCELED'){
          return "已取消"
      }else if(status==='DELIVER_FINISHED'||status==='FINISHED'){
          return "已完成"
      }else if(status==='PROCURE_FINISHED'){
          return "采买完成"
      }else if(status==="PROCURING"){
          return "采买中"
      }else if(status==='DELIVERING'){
          return '配送中'
      }
    }
}

const teamOrderStyle=StyleSheet.create({
    tv_ordernumber:{
        color:'#FF1D1D',
        fontWeight: '700',
        fontSize:17,
    },
    tv_ordertype:{
        color:'#666666',
        fontSize:15,
    },
    checkTv:{
        color:'#FFF',
        fontSize:16,
    },
    not_checkTv:{
        color:'#000',
        fontSize:16
    },
    checkLeftBg:{
        backgroundColor:'#FF1D1D',
        borderBottomLeftRadius:7,
        borderTopLeftRadius:7,
        justifyContent:'center',
        alignItems:'center',
        width:100,
        height:35,
    },
    checkRightBg:{
        backgroundColor:'#FF1D1D',
        borderBottomRightRadius:7,
        borderTopRightRadius:7,
        justifyContent:'center',
        alignItems:'center',
        width:100,
        height:35,
    },
    not_checkBg:{
        //  backgroundColor:'#FFF',
        justifyContent:'center',
        alignItems:'center',
        width:100,
        height:35,
    },
    itemTitle:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        height:35,
        borderBottomWidth:0.5,
        borderBottomColor:'#D9D9D9',
        paddingLeft:15,
        paddingRight:15,
    },
    itemFooter:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        height:35,
        borderTopWidth:0.5,
        borderTopColor:'#D9D9D9',
        paddingLeft:125,
        paddingRight:25,
    },
    itemLayout:{
        flexDirection:'row',
        alignItems:'center',
        padding:10,
    }
});