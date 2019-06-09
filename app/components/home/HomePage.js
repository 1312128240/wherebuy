import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    TouchableOpacity,
    Text,
    Image,
    NativeModules,
    Modal,
    FlatList,
    Alert,
    Linking, ScrollView
} from 'react-native';
import Swiper from 'react-native-swiper';
import {HTTP_REQUEST, GET_RANK, RECOMMEND, addShopCar, GET_PRICE_LIST} from "../../utils/config";
import asyncStorageUtil from "../../utils/AsyncStorageUtil";
import Toast from 'react-native-easy-toast';
import RefreshListView, {RefreshState} from 'react-native-refresh-list-view';
import BaseComponent from "../../views/BaseComponent";
import EmptyAddressModal from '../../views/EmptyAddressModal'
//import *as wechat from 'react-native-wechat'

const {width, height} = Dimensions.get('window');

/**
 * 首页
 */
export default class HomePage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            active: 1,
            accessToken: "",
            recommendData: [],
            modalVisible: false,
            otherPriceModalVisible: false,
            spreadRate: '',
            buyNowItemData: {},
            buyNowNum: 1,
            currentPage: 1,
            refreshState: RefreshState.Idle,
            totalPage: 0,
            supermarketPriceList: [],
            addressVisible: false,
            lookGoodsName: '',
            lookGoodsImg: '',
        };
    }

    componentDidMount() {
      //  super.componentDidMount();
        //只会第一次创建执行
        asyncStorageUtil.getLocalData("accessToken").then(data => {
            if (data === '') {
                this.props.navigation.navigate('AppAuthNavigator')
            } else {
                this.setState({
                    accessToken: data,
                }, () => {
                    this.getRecommendInfo();
                    this.checkUpdate();
                });
            }

        });
        //每次都获取有没有设置地址
        this._navListener = this.props.navigation.addListener('didFocus', () => {
            asyncStorageUtil.getLocalData("accessToken").then(data => {
                this.setState({
                    accessToken: data,
                }, () => {
                    this.getReceiveAddress();
                });
            })
        })

        //注册微信
        //wechat.registerApp('1111')
    }

    componentWillUnmount(): void {
        this._navListener.remove();
        this.setState = (state, callback) => null;
    }


    //其他超市价格弹窗显示与隐藏
    setOtherPriceModalVisible(visible) {
        this.setState({otherPriceModalVisible: visible});
    }

    render() {
        return (
            <View>
                <RefreshListView
                    style={styles.flat_list}
                    data={this.state.recommendData}
                    numColumns={2}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={this.renderView.bind(this)}
                    ListHeaderComponent={this.renderHeader.bind(this)}
                    refreshState={this.state.refreshState}
                    showsVerticalScrollIndicator={false}
                    onFooterRefresh={() => {
                        // 首页暂且显示四个商品信息
                        // if(this.state.currentPage >= this.state.totalPage){
                        //     this.refs.toast.show('全部加载完毕',1000);
                        // }else {
                        //     let current = this.state.currentPage;
                        //     this.setState({
                        //         currentPage: current+1,
                        //         refreshState: RefreshState.FooterRefreshing
                        //     },()=> {
                        //         if(this.state.active === 1){
                        //             this.getRecommendInfo();
                        //         }
                        //         if(this.state.active === 2){
                        //             this.getRank();
                        //         }
                        //     });
                        // }
                    }}
                    onHeaderRefresh={() => {
                        this.setState({
                            currentPage: 1,
                            refreshState: RefreshState.HeaderRefreshing,
                        }, () => {
                            if (this.state.active === 1) {
                                this.getRecommendInfo();
                            }
                            if (this.state.active === 2) {
                                this.getRank();
                            }
                        });
                    }}/>
                <View style={styles.top_bar}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => this.props.navigation.navigate('MyAddressPage')}
                        style={styles.top_bar_location}>
                        <Image style={styles.top_bar_location_img} source={require('../../img/location.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.top_bar_search}
                        onPress={() => this.props.navigation.navigate('SearchGoodsPage', {name: null, type: 1})}>
                        <Image style={{width: 30, height: 30}} source={require('../../img/search_icon.png')}/>
                        <Text>搜索商品</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.top_bar_scan}
                        onPress={() => this.props.navigation.navigate('ScanPage')}>
                        <Image style={styles.top_bar_scan_img} source={require('../../img/scan_qrcode.png')}/>
                    </TouchableOpacity>
                </View>
                <Toast
                    ref="toast"
                    style={{backgroundColor: 'gray'}}
                    position='bottom'
                    positionValue={200}
                    textStyle={{color: 'white'}}/>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        this.setModalHidden()
                    }}>
                    <TouchableOpacity
                        style={styles.modal_style}
                        activeOpacity={1}
                        onPress={() => this.setModalHidden()}>
                        {this.renderDialog()}
                    </TouchableOpacity>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.otherPriceModalVisible}
                    onRequestClose={() => {
                        this.setOtherPriceModalVisible(!this.state.otherPriceModalVisible)
                    }}>
                    <View
                        style={styles.other_price_modal_style}>
                        {this.renderOtherPriceDialog()}
                    </View>
                </Modal>
                {/* 地址提示弹窗*/}
                <EmptyAddressModal ref={'EmptyAddressModal'} params={this.props.navigation}/>
            </View>
        );
    }

    //立即购买弹窗显示
    setModalVisible(item) {
        this.setState({
            modalVisible: true,
            buyNowItemData: item,
            buyNowNum: 1,
        });
    }

    //立即购买弹窗隐藏
    setModalHidden() {
        this.setState({modalVisible: false});
    }


    //立即购买弹窗内容
    renderDialog() {
        return (
            <View style={styles.modal_content}>
                <Image source={{uri: this.state.buyNowItemData.image}} style={styles.buy_now_img}/>
                <Text style={styles.buy_now_name} ellipsizeMode='tail'
                      numberOfLines={2}>{this.state.buyNowItemData.fullName}</Text>
                <Text
                    style={styles.buy_now_attr}
                    ellipsizeMode='tail'
                    numberOfLines={1}>
                    规格：{(this.state.buyNowItemData.attrValues === 'null' || this.state.buyNowItemData.attrValues === '')?'':this.state.buyNowItemData.attrValues}
                </Text>
                <Text style={styles.buy_now_spread_rate}>价差率：{this.state.buyNowItemData.spreadRate}%</Text>
                <View style={styles.buy_now_num_view}>
                    <Text style={styles.buy_now_price}>￥{HomePage.Fen2Yuan(this.state.buyNowItemData.minPrice)}</Text>
                    <TouchableOpacity
                        style={styles.buy_now_num_reduce}
                        onPress={() => this.changeBuyNowNum('reduce')}>
                        <Image style={{width: 25, height: 25}} source={require('../../img/reduce.png')}/>
                    </TouchableOpacity>
                    <Text style={styles.buy_now_num}>{this.state.buyNowNum}</Text>
                    <TouchableOpacity
                        style={styles.buy_now_num_add}
                        onPress={() => this.changeBuyNowNum('add')}>
                        <Image style={{width: 25, height: 25}} source={require('../../img/add.png')}/>
                    </TouchableOpacity>
                </View>
                <View style={styles.add_shopping_car_view}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.add_shopping_car_button}
                        onPress={() => this.addShopCar(this.state.buyNowItemData.goodsSkuId)}>
                        <Text style={{fontSize: 16, color: "white"}}>加入购物车</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    //其他超市价格弹窗内容
    renderOtherPriceDialog() {
        return (
            <View style={styles.other_price_modal_content}>
                <Text style={styles.other_price_title}>附近超市比价</Text>
                <TouchableOpacity
                    style={{position:'absolute',right:10,top:10}}
                    onPress={() => this.setOtherPriceModalVisible(!this.state.otherPriceModalVisible)}>
                    <Image style={{width:25,height:25}} source={require('../../img/icon_close.png')}/>
                </TouchableOpacity>
                <Image
                    source={{uri: this.state.lookGoodsImg}}
                    style={styles.other_price_img}/>
                <Text
                    ellipsizeMode='tail'
                    numberOfLines={2}
                    style={styles.other_price_goods_name}>
                    {this.state.lookGoodsName}
                </Text>
                <Text style={styles.other_price_spread_rate}>最高价差率</Text>
                <Text style={styles.other_price_spread_rate2}>{this.state.spreadRate}%</Text>
                <FlatList
                    style={styles.other_price_list}
                    data={this.state.supermarketPriceList}
                    renderItem={this.renderSupermarketPriceList.bind(this)}
                    keyExtractor={(item, index) => index.toString()}/>
            </View>
        )
    }

    //其他超市价格弹窗列表内容
    renderSupermarketPriceList({item}) {
        return (
            <View style={{height:30,flexDirection:'row'}}>
                <Text ellipsizeMode='tail'
                      numberOfLines={1}
                      style={{flex:2}}>{item.supermarketName}</Text>
                <Text style={{flex:1.5}}>
                    {item.price === -1 ? '无货/无价格' : HomePage.Fen2Yuan(item.price) + '元'}
                </Text>
            </View>
        );
    }

    changeBuyNowNum(type) {
        let num = this.state.buyNowNum;
        if (type === 'reduce') {
            if (num > 1) {
                this.setState({
                    buyNowNum: num - 1,
                })
            }
        } else {
            this.setState({
                buyNowNum: num + 1,
            })
        }
    }

    //头部布局
    renderHeader() {
        return (
            <View>
                <Swiper
                    style={styles.banner}
                    showsButtons={false}
                    removeClippedSubviews={false}//解决白屏问题
                    autoplay={true}
                    horizontal={true}
                    paginationStyle={styles.paginationStyle}
                    dotStyle={styles.dotStyle}
                    activeDotStyle={styles.activeDotStyle}>
                    <Image source={{uri: 'http://qnm.laykj.cn/image/banner1.jpg'}} style={styles.banner_img}/>
                    <Image source={{uri: 'http://qnm.laykj.cn/image/banner2.jpg'}} style={styles.banner_img}/>
                    <Image source={{uri: 'http://qnm.laykj.cn/image/spokesman.jpg'}} style={styles.banner_img}/>
                </Swiper>
                <View style={styles.menu_view}>
                    <TouchableOpacity
                        style={styles.menu_item}
                        activeOpacity={0.7}
                        onPress={() => this.props.navigation.navigate('ClassificationOfGoods')}>
                        <Image style={styles.menu_item_img} source={require('../../img/goods_type.png')}/>
                        <Text style={styles.menu_item_text}>分类商品</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menu_item}
                        activeOpacity={0.7}
                        onPress={() => this.props.navigation.navigate('PriceRankingPage')}>
                        <Image style={styles.menu_item_img} source={require('../../img/price_list.png')}/>
                        <Text style={styles.menu_item_text}>价差排行</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menu_item}
                        activeOpacity={0.7}
                        onPress={() => this.props.navigation.navigate('RecommendPage')}>
                        <Image style={styles.menu_item_img} source={require('../../img/recommend.png')}/>
                        <Text style={styles.menu_item_text}>推荐商品</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menu_item}
                        activeOpacity={0.7}>
                        <Image style={styles.menu_item_img} source={require('../../img/kitchen_supply.png')}/>
                        <Text style={styles.menu_item_text}>厨房直供</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.menu2_view}>
                    <TouchableOpacity
                        onPress={() => {
                            this.tabClick(1)
                        }}
                        activeOpacity={0.7}>
                        <Text
                            style={this.state.active === 1 ? styles.menu2_text_selected : styles.menu2_text}>推荐商品</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            this.tabClick(2)
                        }}
                        activeOpacity={0.7}>
                        <Text
                            style={this.state.active === 2 ? styles.menu2_text_selected : styles.menu2_text}>价差排行</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    //数据区域
    renderView({item}) {
        return (
            <View style={styles.flat_list_view}>
                <View style={styles.flat_list_item}>
                    <Image style={styles.flat_list_img} source={{uri: item.image}}/>
                    <Text style={styles.flat_list_name} ellipsizeMode='tail' numberOfLines={1}>{item.fullName}</Text>
                    <View style={styles.flat_list_spread_soldNum_view}>
                        <Text style={styles.flat_list_spread_rate} ellipsizeMode='tail'
                              numberOfLines={1}>价差率：{item.spreadRate}%</Text>
                        {/*<Text style={styles.flat_list_soldNum} ellipsizeMode='tail' numberOfLines={1}>月拼：{item.soldNum}</Text>*/}
                    </View>
                    <View style={styles.flat_list_min_buy_view}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => this.lookOtherPrice(item.fullName, item.goodsSkuId, item.image)}
                            style={{marginLeft: 10, flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
                            <Text
                                style={styles.flat_list_min}
                                ellipsizeMode='tail'
                                numberOfLines={1}>￥{HomePage.Fen2Yuan(item.minPrice)}</Text>
                            <Text style={{color:'#EC7E2D',fontSize:16,marginLeft:5}}>比价</Text>
                            <Image
                                style={{width: 15, height: 10, marginLeft: 5}}
                                source={require('../../img/icon_arrows_down.png')}/>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => this.setModalVisible(item)}
                            style={styles.flat_list_buy_button}>
                            <Text style={styles.flat_list_buy_text}>立即下单</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    //查看其他超市价格
    lookOtherPrice(name, goodsSkuId, img) {
        this.getOtherPrice(goodsSkuId);
        this.setState({
            lookGoodsName: name,
            lookGoodsImg: img
        });
        this.setOtherPriceModalVisible(true)
    }

    //分转元
    static Fen2Yuan(num) {
        if (typeof num !== "number" || isNaN(num)) return null;
        return (num / 100).toFixed(2);
    }

    //推荐商品、差价排行选项点击事件
    tabClick(pos) {
        this.setState({
            active: pos,
            currentPage: 1
        }, () => {
            //推荐商品
            if (pos === 1) {
                this.getRecommendInfo();
            }
            //差价排行
            if (pos === 2) {
                this.getRank();
            }
        });
    }

    //检查更新
    checkUpdate() {
        fetch(HTTP_REQUEST.Host + '/getAPPUpdateInfomation', {
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken': this.state.accessToken
            },
            body: JSON.stringify({}),
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.respCode === 'S') {
                    //获取版本号 ToDo
                    NativeModules.DeviceHelperModule.getAppVersion((version) =>
                        this.updateTip(version, responseJson.data)
                    )
                }
            })
            .catch((error) => {
                console.error(error);
            })
    }

    //弹出更新提示
    updateTip(localVersion, data) {
        //需要更新（非强制）
        if ((parseFloat(localVersion) < parseFloat(data.version)) && data.force === 'false') {
            Alert.alert(
                '发现新版本',
                data.description + '',
                [{text: '去更新', onPress: () => this.openURL(data.androidDownloadLink)}],
                {cancelable: true}
            )
        }
        //需要更新（强制）
        if ((parseFloat(localVersion) < parseFloat(data.version)) && data.force === 'true') {
            Alert.alert(
                '发现新版本',
                data.description + '',
                [{text: '去更新', onPress: () => this.openURL(data.androidDownloadLink)}],
                {cancelable: false}
            )
        }
    }

    //跳转更新下载地址
    openURL(url) {
        Linking.canOpenURL(url).then(supported => {
            if (!supported) {
                this.refs.toast.show('请先安装浏览器', 1000);
            } else {
                return Linking.openURL(url);
            }
        }).catch(err => this.refs.toast.show('出现错误 ' + err, 1000))
    }

    //获取首页推荐商品
    getRecommendInfo() {
        fetch(HTTP_REQUEST.Host + RECOMMEND, {
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken': this.state.accessToken
            },
            body: JSON.stringify({
                "currentPage": this.state.currentPage,
                "pageSize": 4
            }),
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.data == null && responseJson.respCode !== 'S') {
                    return;
                }
                if (this.state.currentPage === 1) {
                    this.setState({
                        recommendData: responseJson.data.data,
                        refreshState: RefreshState.Idle,
                        totalPage: responseJson.data.totalPage,
                    });
                } else {
                    let data = responseJson.data.data;
                    let stateData = this.state.recommendData;
                    let newData = stateData.concat(data);
                    this.setState({
                        recommendData: newData,
                        refreshState: RefreshState.Idle,
                        totalPage: responseJson.data.totalPage
                    })
                }
            })
            .catch((error) => {
                this.refs.toast.show('推荐商品获取失败', 1000);
            })
            .done();
    }

    //获取差价排行列表
    getRank() {
        fetch(HTTP_REQUEST.Host + GET_RANK, {
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken': this.state.accessToken
            },
            body: JSON.stringify({
                "currentPage": this.state.currentPage,
                "pageSize": 4,
                "brandId": "",
                "communityId": "",
                "categoryId": "",
            }),
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.data == null && responseJson.respCode !== 'S') {
                    return;
                }
                if (this.state.currentPage === 1) {
                    this.setState({
                        recommendData: responseJson.data.data,
                        refreshState: RefreshState.Idle,
                        totalPage: responseJson.data.totalPage,
                    })
                } else {
                    let data = responseJson.data.data;
                    let stateData = this.state.recommendData;
                    let newData = stateData.concat(data);
                    this.setState({
                        recommendData: newData,
                        refreshState: RefreshState.Idle,
                        totalPage: responseJson.data.totalPage,
                    })
                }
            })
            .catch((error) => {
                this.refs.toast.show('差价排行获取失败', 1000);
            })
    }

    //商品加入购物车
    addShopCar(skuId) {
        fetch(HTTP_REQUEST.Host + addShopCar, {
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken': this.state.accessToken
            },
            body: JSON.stringify({
                "goodsSkuId": skuId,
                "quantity": this.state.buyNowNum
            })
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.respCode !== 'S') {
                    this.refs.toast.show('加入购物车失败', 1000);
                    this.setModalHidden()
                } else {
                    this.refs.toast.show('加入购物车成功', 1000);
                    this.setModalHidden()
                }
            })
            .catch((error) => {
                this.refs.toast.show('请求出错', 1000);
                this.setModalHidden()
            })
    }

    //获取其他超市价格 价差率
    getOtherPrice(goodsSkuId) {
        fetch(HTTP_REQUEST.Host + GET_PRICE_LIST, {
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken': this.state.accessToken
            },
            body: JSON.stringify({
                "goodsSkuId": goodsSkuId,
            }),
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.data == null && responseJson.respCode !== 'S') {
                    return;
                }
                this.setState({
                    spreadRate: responseJson.data.spreadRate,
                    supermarketPriceList: responseJson.data.supermarketGoodsList
                });
            })
            .catch((error) => {
                console.error(error);
            })
    }

    //获取收货地址,提示用户去填写收货地址,并在此判断token是否失效
    getReceiveAddress() {
        fetch(HTTP_REQUEST.Host + '/user/address/getDefaultReceiveAddress.do', {
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken': this.state.accessToken
            },
            body: JSON.stringify({}),
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if(responseJson.respCode !== 'S'){
                    if(responseJson.errorCode === '1915'){
                        this.refs.EmptyAddressModal.setAddressModal(true);
                    }else if(responseJson.errorMsg.indexOf("accessToken失效")>-1){
                        asyncStorageUtil.putLocalData("accessToken","");
                        this.props.navigation.navigate('AppAuthNavigator')
                    }
                }
            })
            .catch((error) => {
                console.error(error);
            })
    }

}

const styles = StyleSheet.create({
    //列表样式
    flat_list: {
        width: width,
        backgroundColor: '#F5F5F5'
    },
    flat_list_view: {
        width: width * 0.5,
        height: 300,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    flat_list_item: {
        width: width * 0.47,
        height: 300,
        backgroundColor: 'white'
    },
    flat_list_img: {
        width: width * 0.47,
        height: 200,
        resizeMode: 'stretch'
    },
    flat_list_name: {
        marginLeft: 10,
        marginRight: 10,
        marginTop: 5,
        fontSize: 18
    },
    flat_list_spread_soldNum_view: {
        width: width * 0.47,
        marginTop: 5,
        flexDirection: 'row'
    },
    flat_list_spread_rate: {
        marginLeft: 10,
        fontSize: 12,
        color:'#EC7E2D'
    },
    flat_list_soldNum: {
        position: 'absolute',
        right: 10,
        fontSize: 12,
        color: '#999999'
    },
    flat_list_min_buy_view: {
        width: width * 0.47,
        marginTop: 10,
        flexDirection: 'row'
    },
    flat_list_min: {
        fontWeight: 'bold',
        fontSize: 14
    },
    flat_list_buy_button: {
        position: 'absolute',
        right: 10,
        width: 70,
        height: 28,
        backgroundColor: "#EC7E2D",
        borderRadius: 45,
        justifyContent: "center",
        alignItems: 'center'
    },
    flat_list_buy_text: {
        fontSize: 14,
        color: "white"
    },
    //顶部搜索栏
    top_bar: {
        width: width,
        height: 50,
        top: 0,
        position: 'absolute'
    },
    top_bar_location: {
        position: 'absolute',
        height: 30,
        width: 30,
        left: 10,
        top: 10
    },
    top_bar_location_img: {
        height: 30,
        width: 25,
    },
    top_bar_search: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        top: 5,
        height: 40,
        width: width * 0.7,
        left: width * 0.15,
        borderRadius: 45,
        backgroundColor: 'white'
    },
    top_bar_scan: {
        position: 'absolute',
        height: 30,
        width: 30,
        right: 10,
        top: 10
    },
    top_bar_scan_img: {
        height: 30,
        width: 30
    },
    //轮播图
    banner_img: {
        width: width,
        height: width * 40 / 75
    },
    banner: {
        width: width,
        height: width * 40 / 75,
    },
    paginationStyle: {
        bottom: 6,
    },
    dotStyle: {
        width: 22,
        height: 3,
        backgroundColor: '#fff',
        opacity: 0.4,
        borderRadius: 0,
    },
    activeDotStyle: {
        width: 22,
        height: 3,
        backgroundColor: '#fff',
        borderRadius: 0,
    },
    //菜单栏
    menu_view: {
        marginTop: 10,
        height: 90,
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
        backgroundColor: 'white'
    },
    menu_item: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    menu_item_img: {
        width: 50,
        height: 50,
    },
    menu_item_text: {
        marginTop: 5,
        color: 'black'
    },
    //菜单栏2
    menu2_view: {
        height: 50,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
        backgroundColor: 'white'
    },
    menu2_text: {
        height: 50,
        fontSize: 16,
        fontWeight: 'bold',
        textAlignVertical: 'center'
    },
    menu2_text_selected: {
        height: 50,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF8247',
        textAlignVertical: 'center'
    },
    //立即购买弹窗
    modal_style: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modal_content: {
        position: 'absolute',
        height: height * 0.32,
        width: width,
        top: height * 0.68,
        borderRadius: 5,
        backgroundColor: '#FFFFFF'
    },
    buy_now_img: {
        position: 'absolute',
        width: 120,
        height: 100,
        left: 10,
        top: 10
    },
    buy_now_name: {
        marginLeft: 140,
        marginRight: 10,
        marginTop: 12,
        fontSize: 16,
        fontWeight: 'bold'
    },
    buy_now_attr: {
        marginLeft: 140,
        marginRight: 10,
        marginTop: 5,
        fontSize: 14
    },
    buy_now_spread_rate: {
        marginLeft: 140,
        marginTop: 5,
        fontSize: 14,
        color: '#EC7E2D'
    },
    buy_now_num_view: {
        flexDirection: 'row',
        marginLeft: 140,
        marginTop: 5,
        alignItems: 'center'
    },
    buy_now_price: {
        fontWeight: 'bold',
        fontSize: 16
    },
    buy_now_num_reduce: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: 35,
        height: 35,
        right: 100
    },
    buy_now_num_add: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: 35,
        height: 35,
        right: 10
    },
    buy_now_num: {
        position: 'absolute',
        width: 35,
        right: 55,
        fontSize: 16,
        textAlign: 'center'
    },
    add_shopping_car_view: {
        width: width,
        height: 30,
        marginTop: 20,
        justifyContent: "center",
        alignItems: 'center'
    },
    add_shopping_car_button: {
        width: width * 0.5,
        height: 30,
        backgroundColor: "#EC7E2D",
        borderRadius: 35,
        justifyContent: "center",
        alignItems: 'center'
    },
    //价差排行弹出框
    other_price_modal_style: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    other_price_modal_content: {
        position: 'absolute',
        height: height * 0.4,
        width: width * 0.9,
        left: width * 0.05,
        top: height * 0.3,
        borderRadius: 5,
        backgroundColor: '#FFFFFF'
    },
    other_price_title: {
        marginTop: 10,
        marginLeft: 10,
        fontSize: 18,
        fontWeight: 'bold'
    },
    other_price_img: {
        width:80,
        height:90,
        marginTop: 10,
        marginLeft: 10,
    },
    other_price_goods_name: {
        position: 'absolute',
        fontSize: 16,
        marginTop: 50,
        marginLeft:100,
        marginRight: 10,
        fontWeight: 'bold'
    },
    other_price_spread_rate: {
        marginTop: 10,
        marginLeft: 10,
        fontSize: 14,
    },
    other_price_spread_rate2: {
        marginTop: 10,
        marginLeft: 20,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF8247'
    },
    other_price_list: {
        position: 'absolute',
        marginTop: 100,
        marginLeft:100,
        marginRight:5,
        height: height * 0.4 - 100,
        width:width*0.9-105
    },

    addressModalBtn: {
        height: 55,
        width: width - 160,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopColor: '#D9D9D9',
        borderTopWidth: 0.5
    }
});