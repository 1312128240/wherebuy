import React, {Component} from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import RefreshListView, {RefreshState} from "react-native-refresh-list-view";
import asyncStorageUtil from "../../utils/AsyncStorageUtil";
import Toast from "react-native-easy-toast";
import {HTTP_REQUEST} from "../../utils/config";
import BuyItNowModal from "../../views/BuyItNowModal";
import PriceRankingModal from "../../views/PriceRankingModal";

/**
 * 推荐商品页
 */
export default class RecommendPage extends Component{

    constructor(props) {
        super(props);
        this.state = {
            accessToken:"",
            recommendData:[],
            currentPage:1,
            refreshState: RefreshState.Idle,
            totalPage:0,
        };
    }

    componentDidMount() {
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            },()=>{
                this.getRecommendInfo();
            });
        });
    }

    render() {
        return (
            <View>
                <RefreshListView
                    data={this.state.recommendData}
                    keyExtractor={(item,index) => index.toString()}
                    renderItem={this.renderView.bind(this)}
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
                                this.getRecommendInfo();
                            });
                        }
                    }}
                    onHeaderRefresh={()=>{
                        this.setState({
                            currentPage:1,
                            refreshState: RefreshState.HeaderRefreshing,
                        },()=>{
                            this.getRecommendInfo();
                        });
                    }}
                />
                <BuyItNowModal
                    ref={'BuyItNowModal'}
                    visible={false}
                    addShopCar={this.addShopCar.bind(this)}
                    navigation={this.props.navigation}
                />
                <PriceRankingModal
                    ref={'PriceRankingModal'}
                    visible={false}
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

    //数据区域
    renderView({item}) {
        return (
            <View style={styles.list_item}>
                <Image style={styles.list_item_img} source={{uri:item.image}}/>
                <Text
                    style={styles.list_item_goods_name}
                    ellipsizeMode='tail'
                    numberOfLines={2}>
                    {item.fullName}
                </Text>
                <Text
                    style={styles.list_item_goods_attr}
                    ellipsizeMode='tail'
                    numberOfLines={2}>
                    规格：{(item.attrValues === 'null' || item.attrValues === '')?'':item.attrValues}
                </Text>
                <Text
                    style={styles.list_item_spread}
                    ellipsizeMode='tail'
                    numberOfLines={1}>
                    价差率：{item.spreadRate}%
                </Text>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.list_item_price_view}
                    onPress={() =>
                        this.refs.PriceRankingModal.show(
                            item.fullName,
                            item.goodsSkuId,
                            item.image,
                            this.state.accessToken
                        )
                    }>
                    <Text
                        style={styles.list_item_price}
                        ellipsizeMode='tail'
                        numberOfLines={1}>
                        ￥{RecommendPage.Fen2Yuan(item.minPrice)}
                    </Text>
                    <Text style={styles.list_item_compare_text}>比价</Text>
                    <Image
                        style={styles.list_item_compare_img}
                        source={require('../../img/icon_arrows_down.png')}/>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => this.refs.BuyItNowModal.show(item)}
                    style={styles.list_item_buy_view}>
                    <Text style={styles.list_item_buy_text}>立即下单</Text>
                </TouchableOpacity>
            </View>
        );
    }

    //分转元
    static Fen2Yuan(num){
        if (typeof num !== "number" || isNaN(num)) return null;
        return (num / 100).toFixed(2);
    }

    //获取推荐商品
    getRecommendInfo(){
        fetch(HTTP_REQUEST.Host + '/goods/goods/recommend.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                "currentPage":this.state.currentPage,
                "pageSize":6
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.data == null && responseJson.respCode !== 'S'){
                return;
            }
            if(this.state.currentPage === 1){
                this.setState({
                    recommendData:responseJson.data.data,
                    refreshState: RefreshState.Idle,
                    totalPage:responseJson.data.totalPage,
                });
            }else {
                let data = responseJson.data.data;
                let stateData = this.state.recommendData;
                let newData = stateData.concat(data);
                this.setState({
                    recommendData:newData,
                    refreshState: RefreshState.Idle,
                    totalPage:responseJson.data.totalPage
                })
            }
        })
        .catch((error) =>{
            this.refs.toast.show('推荐商品获取失败',1000);
        })
        .done();
    }

    //商品加入购物车
    addShopCar(skuId,buyNowNum){
        fetch(HTTP_REQUEST.Host + '/goods/shopCar/addShopCar.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                "goodsSkuId":skuId,
                "quantity":buyNowNum
            })
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode !== 'S'){
                this.refs.toast.show('加入购物车失败',1000);
                this.refs.BuyItNowModal.close()
            }else {
                this.refs.toast.show('加入购物车成功',1000);
                this.refs.BuyItNowModal.close()
            }
        })
        .catch((error) =>{
            this.refs.toast.show('请求出错',1000);
            this.refs.BuyItNowModal.close()
        })
    }
}

const styles = StyleSheet.create({
    list_item: {
        borderTopWidth: 0.5,
        borderTopColor: 'grey',
        alignItems:'center',
        height:150,
        backgroundColor:'white'
    },
    list_item_img: {
        position: 'absolute',
        resizeMode :'contain',
        width:120,
        height:120,
        left:10,
    },
    list_item_goods_name: {
        position: 'absolute',
        left:140,
        right:15,
        top:12,
        fontSize: 18,
        fontWeight:'bold'
    },
    list_item_goods_attr: {
        position: 'absolute',
        left:140,
        right:15,
        top:60,
        fontSize: 14,
    },
    list_item_spread: {
        position: 'absolute',
        left:140,
        bottom:45,
        fontSize: 14,
        color:'#EC7E2D'
    },
    //比价点击区域
    list_item_price_view:{
        position: 'absolute',
        left:140,
        bottom:15,
        flexDirection:'row',
        alignItems:'center',
        marginTop:5
    },
    list_item_price:{
        fontWeight:'bold',
        fontSize: 16
    },
    list_item_compare_text:{
        color:'#EC7E2D',
        fontSize:16,
        marginLeft:5
    },
    list_item_compare_img:{
        width:15,
        height:10,
        marginLeft:5
    },
    //立即下单按钮
    list_item_buy_view:{
        position: 'absolute',
        bottom:15,
        width:70,
        height:28,
        right:10,
        backgroundColor:"#EC7E2D",
        borderRadius:45,
        justifyContent:"center",
        alignItems:'center'
    },
    list_item_buy_text:{
        fontSize:14,
        color:"white"
    },
});
