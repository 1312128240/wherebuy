import React, {Component} from 'react';
import {StyleSheet, Text, View,Image, Dimensions,TouchableOpacity} from 'react-native';
import {HTTP_REQUEST} from "../../../utils/config"
import  RefreshListView,{RefreshState} from "react-native-refresh-list-view";
import Toast,{DURATION} from 'react-native-easy-toast'
import asyncStorageUtil from "../../../utils/AsyncStorageUtil";

/**
 * 已取消订单
 */

//屏幕的宽高
let w=Dimensions.get('window').width;
let h=Dimensions.get('window').height;

export default class OrderListPage5 extends Component{

    constructor(props) {
        super(props);
        this.itemlayout =this.itemlayout.bind(this);
        this.state = {
            lists:[],
            currentPage:1,
            refreshState: RefreshState.Idle,
            totalPage:0,
            accessToken:'',
        };
    }

    componentDidMount(): void {
        this._navListener = this.props.navigation.addListener('didFocus', () => {
            asyncStorageUtil.getLocalData("accessToken").then(data=>{
                this.setState({
                    accessToken: data,
                },()=>{
                    this._Refresh();
                });
            });

        })
    }


    render() {

        return (
            <View style={{backgroundColor:"#F3F3F3",flex:1}}>
                {this._listview()}
                <Toast  //提示
                    ref="toast"
                    style={{backgroundColor:'gray'}}
                    position='bottom'
                    positionValue={200}
                    textStyle={{color:'white'}}
                />
            </View>
        )

    }


    _listview(){
        return (
            <RefreshListView
                data={this.state.lists}
                keyExtractor={(item, index) =>index.toString()}
                renderItem={this.itemlayout}
                refreshState={this.state.refreshState}
                ListEmptyComponent={
                    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                        <Text style={{lineHeight:50}}>您还没有已取消的订单!</Text>
                    </View>}
                showsVerticalScrollIndicator = {false}
                onHeaderRefresh={()=>{
                    this.setState({
                        refreshState: RefreshState.HeaderRefreshing,
                    },()=>{
                        this._Refresh();
                    });
                }}
                onFooterRefresh={()=>{
                    this.setState({
                        refreshState: RefreshState.FooterRefreshing
                    },()=>{
                        this.getData();
                    });
                }}/>
        )
    }

    //刷新
    _Refresh(){
        fetch( HTTP_REQUEST.Host+'/goods/order/getOrderList.do', {
            method: 'POST',
            headers: {
                'accessToken': this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                currentPage:1,
                pageSize: 8,
                userStatus: 'CANCELED'
            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if(responseJson.respCode=='S'){
                    this.setState({
                        lists:responseJson.data.data,
                        refreshState: RefreshState.Idle,
                        currentPage:2,
                        totalPage:responseJson.data.totalPage,
                    })
                }

            }).catch((error)=>{

        });
    }

    getData(){
        fetch( HTTP_REQUEST.Host+'/goods/order/getOrderList.do', {
            method: 'POST',
            headers: {
                'accessToken': this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                currentPage:this.state.currentPage,
                pageSize: 8,
                userStatus: 'CANCELED'
            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if(responseJson.respCode=='S'){
                    this.setState({
                        lists: [...this.state.lists, ...responseJson.data.data],
                        refreshState: RefreshState.Idle,
                        currentPage: this.state.currentPage+1,
                        totalPage:responseJson.data.totalPage,
                    })
                }

            }).catch((error)=>{

        });
    }

    itemlayout({item}){
        let viewList=[];

        item.shoppingCarList.map((bean,key)=>{
            let childFlag='';
            if("PROCURING"==bean.status){
                childFlag='采买中'
            }else if("LACK"==bean.status){
                childFlag="缺货"
            }else if("PRICE_HIGH"==bean.status){
                childFlag="价高未买"
            }else if("BOUGHT"==bean.status){
                childFlag="已买"
            }else if("WAIT_DEAL"==bean.status){
                childFlag="待采买"
            }

            viewList.push(
                <TouchableOpacity  key={key} onPress={()=>this.props.navigation.navigate('OrderDetails',{ordersId:item.ordersId})}>
                    <View style={styles.itemCenter}>

                        <Image style={{width:95,height:95}} source={{uri:bean.goodsSkuImage}}/>

                        <View style={{paddingLeft:5,paddingRight:5,width:w-130}}>
                            <Text style={{fontSize:18,color:"#000000",width:w-140,paddingBottom:5,fontWeight:'700'}} numberOfLines={1} ellipsizeMode={'tail'}>{bean.goodsName}</Text>

                            <View style={styles.itemCenterChild}>
                                <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.CenterChildText}>最低价:{bean.minPrice}元{bean.minSupermarketName}</Text>
                                <Text style={{color:"#EC8132"}}>{childFlag}</Text>
                            </View>

                            <View style={styles.itemCenterChild}>
                                <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.CenterChildText}>最高价:{bean.maxPrice}元{bean.maxSupermarketName}</Text>
                                <Text style={{color:'#7B7B7B'}}>数量: x{bean.quantity}</Text>
                            </View>

                            <View style={[styles.itemCenterChild,styles.itemCenterChildBottom]}>
                                <Text style={{color:"#EC8132"}} numberOfLines={1} ellipsizeMode={'tail'}>价差率:{bean.spreadRate}</Text>
                                <Text style={{color:'#7B7B7B'}}>合计:¥{bean.heJiPrice}</Text>
                            </View>

                        </View>

                    </View>
                </TouchableOpacity>
            )
        })

        return(

            <View style={styles.itemContainer}>

                <View style={styles.itemTitle}>
                    <Text style={{color:"#303030"}}>{item.createDate}</Text>
                    <Text style={{color:'#EC8132'}}>已取消</Text>
                </View>


                {viewList}

                <View style={styles.itemFooter}>
                    <Text>实付: ¥{item.totalPrice}</Text>

                    <TouchableOpacity onPress={()=>{this.againOrder(item.ordersId)}}>
                        <View style={styles.tv_footer}>
                            <Text style={{color:'#EC8132'}}>再来一单</Text>
                        </View>
                    </TouchableOpacity>


                </View>

            </View>
        )
    }

    //再来一单
    againOrder(id){
        fetch( HTTP_REQUEST.Host+'/goods/order/againOrders.do', {
            method: 'POST',
            headers: {
                'accessToken': this.state.accessToken,
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
            this.refs.toast.show(error,1000)
        });
    }


}

const styles = StyleSheet.create({

    itemContainer:{
        width:w-20,
        // height:190,
        backgroundColor:'#FFFFFF',
        // padding:10,
        marginTop:8,
        marginRight:10,
        marginLeft:10,
        borderRadius: 5,
    },

    itemTitle:{
        height:30,
        marginTop:5,
        paddingLeft:10,
        paddingRight:10,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        borderBottomColor:'#F3F3F3',
        borderBottomWidth:0.5,
    },

    itemCenter:{
        // backgroundColor:"#303030",
        // height:180,
       // marginTop:8,
       // marginLeft:5,
       // marginRight:5,
       // width:w-20,
        padding:10,
        flexDirection:'row',
    },

    itemCenterChild:{
        width:w-140,
        //  backgroundColor:'#fa3314',
        flexDirection: 'row',
        justifyContent:'space-between',
    },

    CenterChildText:{
        color:"#303030",
        width:w-200,
    },

    itemCenterChildBottom:{
        position:'absolute',
        bottom:0,
        left:5,
    },

    itemFooter:{
        height:50,
        marginBottom:10,
        paddingRight:10,
        paddingLeft:10,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: "center",
        // backgroundColor:"#F4F4F4"
    },

    tv_footer:{
        justifyContent:'center',
        alignItems:'center',
        borderColor:"#EC8132",
      //  borderStyle:'dashed',
        borderWidth:1,
        borderRadius:5,
        width:100,
        height:30,
    }
});