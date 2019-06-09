import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
    Linking,
} from 'react-native';
import {HTTP_REQUEST} from "../../../utils/config"
import Toast from "react-native-easy-toast";
import RefreshListView,{RefreshState} from 'react-native-refresh-list-view'
import asyncStorageUtil from "../../../utils/AsyncStorageUtil";
import {dateToString} from "../../../utils/dateUtil";

const {width} = Dimensions.get('window');

/**
 * 待查询订单
 */
export default class OrderListPage2 extends Component {

    constructor(props) {
        super(props);
        this.state = {
            accessToken:"",
            refreshState: RefreshState.Idle,
            item_data: [],
            currentPage:1,
            totalPage:1,
        };
    }

    componentDidMount(){
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            },()=>{
                this.getOrderList();
            });
        });
    }

    render(){
        return (
            <View style={{backgroundColor:'rgba(245,245,245,1)',flex:1}}>
                <RefreshListView
                    data={this.state.item_data}
                    keyExtractor={(item,index) => index.toString()}
                    renderItem={this.renderView.bind(this)}
                    ListEmptyComponent={
                        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                            <Text style={{lineHeight:50}}>您还没有待查询的订单!</Text>
                        </View>
                    }
                    refreshState={this.state.refreshState}
                    showsVerticalScrollIndicator = {false}
                    onFooterRefresh={()=>{
                        if(this.state.currentPage >= this.state.totalPage){
                            this.refs.toast.show('全部加载完毕',1000);
                        }else {
                            let current = this.state.currentPage;
                            this.setState({
                                currentPage: current+1,
                                refreshState: RefreshState.FooterRefreshing
                            },()=> {
                                this.getOrderList();
                            });
                        }
                    }}
                    onHeaderRefresh={()=>{
                        this.setState({
                            currentPage:1,
                            refreshState: RefreshState.HeaderRefreshing,
                        },()=>{
                            this.getOrderList();
                        });
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

    renderView({item}) {
        if(item.isOrderSuccess === 'WAIT_DEAL'){
            //正在查询商品
            return (
                <View style={styles.list_view}>
                    <Text style={styles.list_time}>{dateToString(item.createTime,'yyyy/MM/dd')}</Text>
                    <Text style={styles.list_state}>正在查询商品</Text>
                    <View style={styles.list_line}/>
                    <Text
                        style={styles.list_goods_info}
                        ellipsizeMode='tail'
                        numberOfLines={1}>
                        {item.brandName} {item.goodsName} {item.attrValue}
                    </Text>
                    <Text style={styles.list_tip}>温馨提示：您提交的商品正在查询中，请稍后前往此页查看，我们也会将查询结果下发至您的手机，请注意查收。</Text>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => this.callCommunity(item.communityPhone)}
                        style={styles.list_btn_contact}>
                        <Text style={{fontSize:14,color:"#EC7E2D"}}>联系网点</Text>
                    </TouchableOpacity>
                </View>
            );
        }else if(item.isOrderSuccess === 'SUCCESS'){
            //商品查询结果 成功
            return (
                <View style={styles.list_view2}>
                    <Text style={styles.list_time}>{dateToString(item.createTime,'yyyy/MM/dd')}</Text>
                    <Text style={styles.list_state}>商品查询结果</Text>
                    <View style={styles.list_line}/>
                    <Text
                        style={styles.list_goods_info}
                        ellipsizeMode='tail'
                        numberOfLines={1}>
                        {item.brandName} {item.goodsName} {item.attrValue}
                    </Text>
                    <Text style={styles.list_tip2}>商品信息获取成功，客服已与您取得联系！</Text>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => this.callCommunity(item.communityPhone)}
                        style={styles.list_btn_contact}>
                        <Text style={{fontSize:14,color:"#EC7E2D"}}>联系网点</Text>
                    </TouchableOpacity>
                </View>
            );
        }else if(item.isOrderSuccess === 'FAIL'){
            //商品查询结果 失败
            return (
                <View style={styles.list_view2}>
                    <Text style={styles.list_time}>{dateToString(item.createTime,'yyyy/MM/dd')}</Text>
                    <Text style={styles.list_state}>商品查询结果</Text>
                    <View style={styles.list_line}/>
                    <Text
                        style={styles.list_goods_info}
                        ellipsizeMode='tail'
                        numberOfLines={1}>
                        {item.brandName} {item.goodsName} {item.attrValue}
                    </Text>
                    <Text style={styles.list_tip2}>无法查找到此商品，请核对信息或联系网点。</Text>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => this.callCommunity(item.communityPhone)}
                        style={styles.list_btn_contact}>
                        <Text style={{fontSize:14,color:"#EC7E2D"}}>联系网点</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    callCommunity(number){
        let tel = 'tel:'+number;
        Linking.canOpenURL(tel).then((supported)=>{
            if (!supported) {
                alert("不是正确的电话号码")
            } else {
                return Linking.openURL(tel)
            }
        })
    }

    //获取订单数据
    getOrderList(){
        fetch(HTTP_REQUEST.Host + '/self/order/selfOrder.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                'currentPage':this.state.currentPage,
                'pageSize':8
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode === 'S'){
                if(this.state.currentPage === 1){
                    this.setState({
                        item_data:responseJson.data.data,
                        refreshState: RefreshState.Idle,
                        totalPage:responseJson.data.totalPage,
                    });
                }else {
                    let data = responseJson.data.data;
                    let stateData = this.state.item_data;
                    let newData = stateData.concat(data);
                    this.setState({
                        item_data:newData,
                        refreshState: RefreshState.Idle,
                        totalPage:responseJson.data.totalPage
                    })
                }
            }else {
                this.setState({
                    refreshState: RefreshState.Idle,
                });
            }
        })
        .catch((error) =>{
            this.refs.toast.show('网络错误',1000);
        })
    }
}

const styles = StyleSheet.create({
    title_no_date:{
        width:width,
        fontSize:18,
        textAlign:'center',
        textAlignVertical:'center',
        marginTop:30
    },
    //列表样式
    list_view:{
        height:140,
        width:width*0.95,
        backgroundColor:'white',
        borderRadius:5,
        marginLeft:width*0.025,
        marginTop:10
    },
    list_view2:{
        height:120,
        width:width*0.95,
        backgroundColor:'white',
        borderRadius:5,
        marginLeft:width*0.025,
        marginTop:10
    },
    list_time:{
        fontSize:14,
        marginTop:10,
        marginLeft:10
    },
    list_state:{
        position:'absolute',
        color:'#EC7E2D',
        fontSize:14,
        top:10,
        right:10
    },
    list_line:{
        width:width*0.95,
        height: 0.7,
        backgroundColor:'#D9D9D9',
        marginTop:5
    },
    list_goods_info:{
        fontSize:18,
        fontWeight:'bold',
        color:'#333333',
        marginTop:5,
        marginLeft:10,
        marginRight:10
    },
    list_tip:{
        fontSize:14,
        marginTop:15,
        marginLeft:10,
        marginRight:110,
        color:'#AAAAAA',
    },
    list_tip2:{
        fontSize:14,
        marginTop:15,
        marginLeft:10,
        marginRight:110,
        color:'#EC7E2D',
    },
    list_btn_contact:{
        position: 'absolute',
        width:90,
        height:35,
        right:10,
        bottom:20,
        borderColor:'#EC7E2D',
        borderWidth:0.5,
        borderRadius:5,
        justifyContent:"center",
        alignItems:'center'
    },
});