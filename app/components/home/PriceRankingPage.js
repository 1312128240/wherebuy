import React, {Component} from 'react';
import {
    Image,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
    Dimensions, TextInput
} from 'react-native';
import {GET_COMMUNITY, GET_ALL_AREA, GET_PRICE_LIST, GET_RANK, HTTP_REQUEST, addShopCar} from "../../utils/config";
import asyncStorageUtil from "../../utils/AsyncStorageUtil";
import Toast from 'react-native-easy-toast';
import RefreshListView,{RefreshState} from 'react-native-refresh-list-view'
import BaseComponent from "../../views/BaseComponent";

const {width,height} = Dimensions.get('window');

/**
 * 价差排行（特价商品）页面
*/
export default class PriceRankingPage extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            active:1,
            accessToken:"",
            currentPage:1,
            item_data: [],
            modalVisible: false,
            lookGoodsName:'',
            lookGoodsImg:'',
            spreadRate:'',
            supermarketPriceList:[],
            modalCategoryVisible: false,
            modalAreaVisible: false,
            showProvince:false,
            showCity:false,
            showDistrict:false,
            showStreet:false,
            AllAreaData:[],//全部地区数据
            CurrentAreaData:[],//当前需要显示的地区数据
            AllCategoryData:[],//全部的分类数据
            CurrentCategoryData:[],//当前需要显示的分类数据
            communityId:'',
            buyNowItemData:{},
            buyNowNum:1,
            buyModalVisible: false,
            categoryId:'',
            showBrandSearch:false,//是否需要显示品牌搜索框
            brandSearchData:[],//品牌搜索结果
            brandName:'',//品牌名称
            refreshState: RefreshState.Idle,
        };
    }

    //其他超市价格弹窗显示与隐藏
    setModalVisible(visible) {
        this.setState({modalVisible:visible});
    }

    //区域弹窗显示与隐藏
    setAreaModalVisible(visible) {
        this.setState({modalAreaVisible:visible});
    }

    //分类弹窗显示与隐藏
    setCategoryModalVisible(visible) {
        this.setState({modalCategoryVisible:visible});
    }

    //立即购买弹窗显示
    setBuyModalVisible(item) {
        this.setState({
            buyModalVisible:true,
            buyNowItemData:item,
            buyNowNum:1,
        });
    }
    //立即购买弹窗隐藏
    setBuyModalHidden() {
        this.setState({
            buyModalVisible:false
        });
    }

    componentDidMount(): void {
        super.componentDidMount();
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            },()=>{
                this.getRank();
            });
        });
    }

    render() {
      return (
        <View style={{flex: 1,backgroundColor:'#F5F5F5'}}>
            <View style={styles.top_menu_view}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {this.topTabClick(1)}}>
                    <Text style={this.state.active === 1 ? styles.top_menu_text_selected :styles.top_menu_text}>综合</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{flexDirection:'row',alignItems:'center'}}
                    activeOpacity={0.7}
                    onPress={() => {this.topTabClick(2)}}>
                    <Text style={this.state.active === 2 ? styles.top_menu_text_selected :styles.top_menu_text}>区域</Text>
                    <Image style={{width:16,height:10,marginLeft:5,resizeMode: 'contain'}}
                        source={this.state.active === 2 ?
                            require('../../img/icon_arrows_up.png')
                            :
                            require('../../img/icon_arrows2_down.png')}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{flexDirection:'row',alignItems:'center'}}
                    activeOpacity={0.7}
                    onPress={() => {this.topTabClick(3)}}>
                    <Text style={this.state.active === 3 ? styles.top_menu_text_selected :styles.top_menu_text}>分类</Text>
                    <Image style={{width:16,height:10,marginLeft:5,resizeMode: 'contain'}}
                           source={this.state.active === 3 ?
                               require('../../img/icon_arrows_up.png')
                               :
                               require('../../img/icon_arrows2_down.png')}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{flexDirection:'row',alignItems:'center'}}
                    activeOpacity={0.7}
                    onPress={() => {this.topTabClick(4)}}>
                    <Text style={this.state.active === 4 ? styles.top_menu_text_selected :styles.top_menu_text}>品牌</Text>
                    <Image style={{width:16,height:10,marginLeft:5,resizeMode: 'contain'}}
                           source={this.state.active === 4 ?
                               require('../../img/icon_arrows_up.png')
                               :
                               require('../../img/icon_arrows2_down.png')}
                    />
                </TouchableOpacity>
            </View>
            {this.state.showBrandSearch ? this.renderBrandSearch() : <View/>}
            <RefreshListView
                data={this.state.item_data}
                renderItem={this.renderItemView.bind(this)}
                keyExtractor={(item,index) => index.toString()}
                refreshState={this.state.refreshState}
                showsVerticalScrollIndicator = {false}
                onFooterRefresh={()=>{
                    let current = this.state.currentPage;
                    this.setState({
                        currentPage: current+1,
                        refreshState: RefreshState.FooterRefreshing
                    },()=> {
                        this.getRank();
                    });
                }}
                onHeaderRefresh={()=>{
                    this.setState({
                        currentPage:1,
                        refreshState: RefreshState.HeaderRefreshing,
                    },()=>{
                        this.getRank();
                    });
                }}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => {this.setModalVisible(!this.state.modalVisible)}}>
                <View
                    style={styles.other_price_modal_style}>
                    {this.renderDialog()}
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.modalAreaVisible}
                onRequestClose={() => {this.setAreaModalVisible(!this.state.modalAreaVisible)}}>
                <TouchableOpacity
                    style={styles.area_modal_style}
                    activeOpacity={1}
                    onPress={() => this.setAreaModalVisible(!this.state.modalAreaVisible)}>
                    {this.renderAreaDialog()}
                </TouchableOpacity>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.modalCategoryVisible}
                onRequestClose={() => {this.setCategoryModalVisible(!this.state.modalCategoryVisible)}}>
                <TouchableOpacity
                    style={styles.area_modal_style}
                    activeOpacity={1}
                    onPress={() => this.setCategoryModalVisible(!this.state.modalCategoryVisible)}>
                    {this.renderCategoryDialog()}
                </TouchableOpacity>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.buyModalVisible}
                onRequestClose={() => {this.setBuyModalHidden()}}>
                <TouchableOpacity
                    style={styles.buy_now_modal_style}
                    activeOpacity={1}
                    onPress={() => this.setBuyModalHidden()}>
                    {this.renderBuyDialog()}
                </TouchableOpacity>
            </Modal>
            <Toast
                ref="toast"
                style={{backgroundColor:'gray'}}
                position='bottom'
                positionValue={200}
                textStyle={{color:'white'}}/>
        </View>
      );
    }

    //加载按品牌搜索组件
    renderBrandSearch(){
        return(
            <View style={{height:190,width:width,alignItems:'center'}}>
                <View style={{height:50,width:width,backgroundColor:'white',alignItems:'center'}}>
                    <View style={styles.brand_search_view}>
                        <TextInput
                            ref={'InputText'}
                            style={{left:10,width:width*0.5}}
                            onChangeText={(brandKey) => this.searchBrand(brandKey)}
                            placeholder="请输入品牌关键字">
                        </TextInput>
                    </View>
                </View>
                <FlatList
                    style={this.state.brandSearchData.length === 0 ? {height:0}: styles.brand_search_list}
                    flashScrollIndicators={false}
                    data={this.state.brandSearchData}
                    renderItem={this.renderSearchBrandList.bind(this)}
                    keyExtractor={(item,index) => index.toString()}/>
            </View>
        )
    }

    //品牌搜索返回数据列表
    renderSearchBrandList({item}){
        return (
            <TouchableOpacity
                style={{height:40,width:width*0.6,justifyContent:'center'}}
                activeOpacity={0.7}
                onPress={() => this.setState({
                    brandName:item.name,
                    showBrandSearch:false,
                },()=>{
                    this.getRank();
                })}>
                <Text style={{left:10,fontSize:16}}>{item.name}</Text>
            </TouchableOpacity>
        )
    }

    //立即购买弹窗内容
    renderBuyDialog() {
        return (
            <View style={styles.buy_now_modal_content}>
                <Image source={{uri:this.state.buyNowItemData.image}} style={styles.buy_now_img}/>
                <Text style={styles.buy_now_name} ellipsizeMode='tail' numberOfLines={2}>{this.state.buyNowItemData.fullName}</Text>
                <Text
                    style={styles.buy_now_attr}
                    ellipsizeMode='tail'
                    numberOfLines={1}>
                    规格：{(this.state.buyNowItemData.attrValues === 'null' || this.state.buyNowItemData.attrValues === '')?'':this.state.buyNowItemData.attrValues}
                </Text>
                <Text style={styles.buy_now_spread_rate}>价差率：{this.state.buyNowItemData.spreadRate}%</Text>
                <View style={styles.buy_now_num_view}>
                    <Text style={styles.buy_now_price}>￥{PriceRankingPage.Fen2Yuan(this.state.buyNowItemData.minPrice)}</Text>
                    <TouchableOpacity
                        style={styles.buy_now_num_reduce}
                        onPress={() => this.changeBuyNowNum('reduce')}>
                        <Image style={{width:25,height:25}} source={require('../../img/reduce.png')}/>
                    </TouchableOpacity>
                    <Text style={styles.buy_now_num}>{this.state.buyNowNum}</Text>
                    <TouchableOpacity
                        style={styles.buy_now_num_add}
                        onPress={() => this.changeBuyNowNum('add')}>
                        <Image style={{width:25,height:25}} source={require('../../img/add.png')}/>
                    </TouchableOpacity>
                </View>
                <View style={styles.buy_now_add_shopping_car_view}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.buy_now_add_shopping_car_button}
                        onPress={() => this.addShopCar(this.state.buyNowItemData.goodsSkuId)}>
                        <Text style={{fontSize:16,color:"white"}}>加入购物车</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    changeBuyNowNum(type){
        let num = this.state.buyNowNum;
        if(type === 'reduce'){
            if(num > 1){
                this.setState({
                    buyNowNum:num-1,
                })
            }
        }else {
            this.setState({
                buyNowNum:num+1,
            })
        }
    }

    //头部选项点击事件
    topTabClick(pos){
        //切换重置条件
        this.setState({
            active:pos,
            currentPage:1,
            communityId:'',
            categoryId:'',
            brandName:'',
            showBrandSearch:false
        });
        //综合
        if(pos === 1){
            this.getRank();
        }
        //区域
        if(pos === 2){
            this.getAllArea();
            this.setAreaModalVisible(true)
        }
        //分类
        if(pos === 3){
            this.getAllCategory();
            this.setCategoryModalVisible(true)
        }
        //品牌
        if(pos === 4){
            this.setState({
                item_data:[],
                showBrandSearch:true
            });
        }
    }

    //区域弹窗内容
    renderAreaDialog() {
        return (
            <View style={styles.area_modal_content}>
                <View style={styles.area_title_view}>
                    <Text style={this.state.showProvince ? styles.area_title_text_visible :styles.area_title_text_invisible}>广东省</Text>
                    <Text style={this.state.showCity ? styles.area_title_text_visible :styles.area_title_text_invisible}>深圳市</Text>
                    <Text style={this.state.showDistrict ? styles.area_title_text_visible :styles.area_title_text_invisible}>龙华区</Text>
                    <Text style={this.state.showStreet ? styles.area_title_text_visible :styles.area_title_text_invisible}>民治街道</Text>
                    <Text style={{fontSize:16,color:'#FF8247'}}>请选择</Text>
                </View>
                <FlatList
                    data={this.state.CurrentAreaData}
                    renderItem={this.renderAreaList.bind(this)}
                    extraData={this.state}
                    keyExtractor={(item,index) => index.toString()}/>
            </View>
        )
    }

    //区域弹窗列表Item内容
    renderAreaList({item,index}) {
        return (
            <TouchableOpacity
                style={{height:50}}
                onPress={() => {
                    this.selectArea(
                     item.name,
                     item.level,
                     index,
                     item.code,
                     item.communityId)
                }}>
                <Text style={{height:50,fontSize:16,marginLeft: 15}}>{item.name}</Text>
            </TouchableOpacity>
        );
    }

    //点击切换地区，主要是切换省（level=1 依此类推）市2 区3 街道4
    selectArea(name,level,pos,areaCode,communityId){
        if(typeof(communityId) === 'undefined'){
            communityId = '';
        }
        if(level === 1){
            let newData = this.state.AllAreaData;
            this.setState({
                CurrentAreaData:newData[pos].child,//获取市
                communityId:communityId
            });
        }else if(level === 2){
            let newData = this.state.CurrentAreaData;
            this.setState({
                CurrentAreaData:newData[pos].child,//获取区
                communityId:communityId
            });
        }else if(level === 3){
            let newData = this.state.CurrentAreaData;
            this.setState({
                CurrentAreaData:newData[pos].child,//获取街道
                communityId:communityId
            });
        }else if(level === 4){
            this.getCommunityList(areaCode);//获取小区
        }else {
            this.setState({
                communityId:communityId
            },()=>{
                this.getRank();
            });
            this.setAreaModalVisible(!this.state.modalAreaVisible)
        }
    }

    /**
     * 分类弹窗内容开始
     */
    renderCategoryDialog() {
        return (
            <View style={styles.area_modal_content}>
                <View style={styles.area_title_view}>
                    <Text style={{fontSize:16,color:'#FF8247'}}>请选择</Text>
                </View>
                <FlatList
                    data={this.state.CurrentCategoryData}
                    renderItem={this.renderCategoryList.bind(this)}
                    extraData={this.state}
                    keyExtractor={(item,index) => index.toString()}/>
            </View>
        )
    }

    //分类弹窗列表Item内容
    renderCategoryList({item,index}) {
        return (
            <TouchableOpacity
                style={{height:50}}
                onPress={() => {
                    this.selectCategory(item.level,item.categoryId,index)
                }}>
                <Text style={{height:50,fontSize:16,marginLeft: 15}}>{item.name}</Text>
            </TouchableOpacity>
        );
    }

    //点击切换分类列表，level = 4 到达分类底部，categoryId 分类id，pos在数组中的位置
    selectCategory(level,categoryId,pos){
        if(level === 4){
            this.setState({
                categoryId:categoryId
            },()=>{
                this.getRank();
            });
            this.setCategoryModalVisible(!this.state.modalCategoryVisible);
        }else {
            this.setState({
                CurrentCategoryData:this.state.CurrentCategoryData[pos].children,
            });
        }
    }
    /**
     * 分类 结束
     */

    //查看其他超市价格
    lookOtherPrice(name,goodsSkuId,img){
        this.getOtherPrice(goodsSkuId);
        this.setState({
            lookGoodsName:name,
            lookGoodsImg:img
        });
        this.setModalVisible(true)
    }

    //其他超市价格弹窗内容
    renderDialog() {
        return (
            <View style={styles.other_price_modal_content}>
                <Text style={styles.other_price_title}>附近超市比价</Text>
                <TouchableOpacity
                    style={{position:'absolute',right:10,top:10}}
                    onPress={() => this.setModalVisible(!this.state.modalVisible)}>
                    <Image style={{width:25,height:25}} source={require('../../img/icon_close.png')}/>
                </TouchableOpacity>
                <Image
                    source={{uri:this.state.lookGoodsImg}}
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
                    keyExtractor={(item,index) => index.toString()}/>
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
                    {item.price === -1 ? '无货/无价格' : PriceRankingPage.Fen2Yuan(item.price)+'元'}
                </Text>
            </View>
        );
    }

    //价差排行列表内容
    renderItemView({item}) {
        return (
            <View style={styles.list_item}>
                <Image style={styles.list_item_img} source={{uri:item.image}}/>
                <Text style={styles.goods_name} ellipsizeMode='tail' numberOfLines={2}>{item.fullName}</Text>
                <Text
                    style={styles.goods_attr}
                    ellipsizeMode='tail'
                    numberOfLines={2}>
                    规格：{(item.attrValues === 'null' || item.attrValues === '')?'':item.attrValues}
                </Text>
                <Text
                    style={{ position: 'absolute',
                        left:140,
                        bottom:45,
                        fontSize: 14,color:'#EC7E2D'}}
                    ellipsizeMode='tail'
                    numberOfLines={1}>价差率：{item.spreadRate}%
                </Text>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => this.lookOtherPrice(item.fullName,item.goodsSkuId,item.image)}
                    style={{position: 'absolute',left:140,bottom:15,flexDirection:'row',alignItems:'center',marginTop:5}}>
                    <Text
                        style={{
                            fontWeight:'bold',
                            fontSize: 16,}}
                        ellipsizeMode='tail'
                        numberOfLines={1}>￥{PriceRankingPage.Fen2Yuan(item.minPrice)}
                    </Text>
                    <Text style={{color:'#EC7E2D',fontSize:16,marginLeft:5}}>比价</Text>
                    <Image style={{width:15,height:10,marginLeft:5}} source={require('../../img/icon_arrows_down.png')}/>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => this.setBuyModalVisible(item)}
                    style={{position: 'absolute',
                        bottom:15,
                        width:70,
                        height:28,
                        right:10,
                        backgroundColor:"#EC7E2D",
                        borderRadius:45,
                        justifyContent:"center",
                        alignItems:'center'}}>
                    <Text style={{
                        fontSize:14,
                        color:"white"}}>立即下单</Text>
                </TouchableOpacity>
            </View>
        );
        // return (
        //     <View style={styles.list_item}>
        //         <Image style={styles.list_item_img} source={{uri:item.image}}/>
        //         <Text style={styles.goods_name} ellipsizeMode='tail' numberOfLines={1}>{item.fullName}</Text>
        //         <Text style={styles.min_price} ellipsizeMode='tail' numberOfLines={2}>
        //             最低价: {PriceRankingPage.Fen2Yuan(item.minPrice)}元 {item.minSupermarket}
        //         </Text>
        //         <TouchableOpacity
        //             style={styles.other_price_button}
        //             onPress={() => {this.lookOtherPrice(item.fullName,item.goodsSkuId)}}>
        //             <Text style={styles.other_price_button_text}>其他超市价格</Text>
        //         </TouchableOpacity>
        //         <TouchableOpacity style={styles.add_shopping_car_button} onPress={() => this.setBuyModalVisible(item)}>
        //             <Text style={styles.add_shopping_car_button_text}>立即下单</Text>
        //         </TouchableOpacity>
        //     </View>
        // );
    }

    //分转元
    static Fen2Yuan(num){
        if (typeof num !== "number" || isNaN(num)) return null;
        return (num / 100).toFixed(2);
    }

    //获取差价排行列表
    getRank(){
        fetch(HTTP_REQUEST.Host + GET_RANK,{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                "currentPage":this.state.currentPage,
                "pageSize":10,
                "brandName":this.state.brandName,
                "communityId":this.state.communityId,
                "categoryId":this.state.categoryId,
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode === 'S'){
                if(this.state.currentPage === 1){
                    this.setState({
                        item_data:responseJson.data.data,
                        refreshState: RefreshState.Idle,
                    });
                }else {
                    let data = responseJson.data.data;
                    let stateData = this.state.item_data;
                    let newData = stateData.concat(data);
                    this.setState({
                        item_data:newData,
                        refreshState: RefreshState.Idle,
                    })
                }
            }
        })
        .catch((error) =>{
            console.error(error);
        })
    }

    //获取其他超市价格 价差率
    getOtherPrice(goodsSkuId){
        fetch(HTTP_REQUEST.Host + GET_PRICE_LIST,{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                "goodsSkuId":goodsSkuId,
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.data == null && responseJson.respCode !== 'S'){
                return;
            }
            this.setState({
                spreadRate:responseJson.data.spreadRate,
                supermarketPriceList:responseJson.data.supermarketGoodsList
            });
        })
        .catch((error) =>{
            console.error(error);
        })
    }

    //获取AllArea
    getAllArea(){
        fetch(HTTP_REQUEST.Host + GET_ALL_AREA,{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({}),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.data == null || responseJson.respCode !== 'S'){
                return;
            }
            this.setState({
                AllAreaData:responseJson.data,
                CurrentAreaData:responseJson.data,//默认获取省份
            });
        })
        .catch((error) =>{
            console.error(error);
        })
    }

    //根据街道获取小区列表
    getCommunityList(areaCode){
        fetch(HTTP_REQUEST.Host + GET_COMMUNITY,{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                "areaCode":areaCode
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.data == null || responseJson.respCode !== 'S'){
                return;
            }
            this.setState({
                CurrentAreaData:responseJson.data,
            });
        })
        .catch((error) =>{
            console.error(error);
        })
    }

    //获取AllCategory全部分类
    getAllCategory(){
        fetch(HTTP_REQUEST.Host + '/goods/category/showAllCategory.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({}),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode !== 'S'){
                return;
            }
            this.setState({
                AllCategoryData:responseJson.data,
                CurrentCategoryData:responseJson.data,
            });
        })
        .catch((error) =>{
            console.error(error);
        })
    }

    //商品加入购物车
    addShopCar(skuId){
        fetch(HTTP_REQUEST.Host + addShopCar,{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                "goodsSkuId":skuId,
                "quantity":this.state.buyNowNum
            })
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode !== 'S'){
                this.refs.toast.show('加入购物车失败',1000);
                this.setBuyModalHidden()
            }else {
                this.refs.toast.show('加入购物车成功',1000);
                this.setBuyModalHidden()
            }
        })
        .catch((error) =>{
            this.refs.toast.show('请求出错',1000);
            this.setBuyModalHidden()
        })
    }

    //按照品牌搜索
    searchBrand(brandKey){
        //this.refs.InputText.blur();
        fetch(HTTP_REQUEST.Host + '/brand/brand/searchBrand.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                "brandName":brandKey
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode !== 'S'){
                return;
            }
            this.setState({
                brandSearchData:responseJson.data,
            });
        })
        .catch((error) =>{
            console.error(error);
        })
    }
}

const styles = StyleSheet.create({
    //品牌搜索输入框
    brand_search_view:{
        height:40,
        width:width*0.6,
        borderRadius:15,
        backgroundColor:'#F5F5F5'
    },
    brand_search_list:{
        height:150,
        width:width*0.6,
        backgroundColor:'white'
    },
    //顶部选择菜单栏
    top_menu_view: {
        height: 50,
        alignItems:'center',
        flexDirection: 'row',
        justifyContent:'space-around',
        backgroundColor:'white'
    },
    top_menu_text:{
        height: 50,
        fontSize:16,
        textAlignVertical:'center'
    },
    top_menu_text_selected:{
        height: 50,
        fontSize:16,
        color:'#FF8247',
        textAlignVertical:'center',
    },
    //列表相关内容
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
    goods_name: {
        position: 'absolute',
        left:140,
        right:15,
        top:12,
        fontSize: 18,
        fontWeight:'bold'
    },
    goods_attr: {
        position: 'absolute',
        left:140,
        right:15,
        top:60,
        fontSize: 14,
    },
    //列表相关内容
    // list_item: {
    //     borderTopWidth: 0,
    //     borderBottomWidth: 0.5,
    //     borderBottomColor: 'grey',
    //     alignItems:'center',
    //     height:120
    // },
    // list_item_img: {
    //     position: 'absolute',
    //     resizeMode :'contain',
    //     width:100,
    //     height:100,
    //     left:10,
    // },
    // goods_name: {
    //     position: 'absolute',
    //     left:120,
    //     right:15,
    //     top:12,
    //     fontSize: 18,
    //     fontWeight:'bold'
    // },
    // min_price: {
    //     position: 'absolute',
    //     left:120,
    //     right:15,
    //     top:45,
    //     fontSize: 14,
    //     color:'#FF8247'
    // },
    // other_price_button: {
    //     position: 'absolute',
    //     height:35,
    //     width:120,
    //     top:75,
    //     left:120,
    //     backgroundColor:"#FFFFFF",
    //     borderRadius:5,
    //     borderWidth: 0.5,
    //     borderColor: '#EC7E2D',
    //     alignItems:'center',
    //     justifyContent:'center'
    // },
    // other_price_button_text: {
    //     color:"#EC7E2D",
    //     fontSize:16
    // },
    // add_shopping_car_button: {
    //     position: 'absolute',
    //     height:35,
    //     width:80,
    //     top:75,
    //     right:15,
    //     backgroundColor:"#EC7E2D",
    //     borderRadius:5,
    //     alignItems:'center',
    //     justifyContent:'center'
    // },
    add_shopping_car_button_text: {
        color:"#FFFFFF",
        fontSize:16
    },
    //价差排行弹出框
    other_price_modal_style: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    other_price_modal_content: {
        position: 'absolute',
        height:height*0.4,
        width:width*0.9,
        left:width*0.05,
        top:height*0.3,
        borderRadius:5,
        backgroundColor:'#FFFFFF'
    },
    other_price_title: {
        marginTop:10,
        marginLeft:10,
        fontSize: 18,
        fontWeight:'bold'
    },
    other_price_img:{
        width:80,
        height:90,
        marginTop:10,
        marginLeft:10,
    },
    other_price_goods_name:{
        position:'absolute',
        fontSize: 16,
        marginTop:50,
        marginLeft:100,
        marginRight:10,
        fontWeight:'bold'
    },
    other_price_spread_rate:{
        marginTop:10,
        marginLeft:10,
        fontSize: 14,
    },
    other_price_spread_rate2:{
        marginTop:10,
        marginLeft:20,
        fontSize:18,
        fontWeight:'bold',
        color:'#FF8247'
    },
    other_price_list:{
        position: 'absolute',
        marginTop: 100,
        marginLeft:100,
        marginRight:5,
        height: height * 0.4 - 100,
        width:width*0.9-105
    },

    addressModalBtn:{
        height:55,
        width:width-160,
        alignItems:'center',
        justifyContent:'center',
        borderTopColor:'#D9D9D9',
        borderTopWidth:0.5
    },
    //区域、分类排行弹窗
    area_modal_style: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    area_modal_content: {
        position: 'absolute',
        height:height*0.8,
        width:width,
        top:height*0.2,
        borderRadius:5,
        backgroundColor:'#FFFFFF',
    },
    area_title_view:{
        flexDirection:'row',
        height:50,
        alignItems:'center',
        justifyContent:"flex-start",
        marginLeft:15
    },
    area_title_text_visible:{
        fontSize:16,
    },
    area_title_text_invisible:{
        fontSize:16,
        width:0
    },
    //立即购买弹窗
    buy_now_modal_style: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    buy_now_modal_content: {
        position: 'absolute',
        height:height*0.32,
        width:width,
        top:height*0.68,
        borderRadius:5,
        backgroundColor:'#FFFFFF'
    },
    buy_now_img:{
        position:'absolute',
        width:120,
        height:100,
        left:10,
        top:10
    },
    buy_now_name:{
        marginLeft:140,
        marginRight:10,
        marginTop:12,
        fontSize: 16,
        fontWeight:'bold'
    },
    buy_now_attr:{
        marginLeft:140,
        marginRight:10,
        marginTop:5,
        fontSize: 14
    },
    buy_now_spread_rate:{
        marginLeft:140,
        marginTop:5,
        fontSize: 14,
        color:'#EC7E2D'
    },
    buy_now_num_view:{
        flexDirection:'row',
        marginLeft:140,
        marginTop:5,
        alignItems:'center'
    },
    buy_now_price:{
        fontWeight:'bold',
        fontSize: 16
    },
    buy_now_num_reduce:{
        position: 'absolute',
        alignItems:'center',
        justifyContent:'center',
        width:35,
        height:35,
        right:100
    },
    buy_now_num_add:{
        position: 'absolute',
        alignItems:'center',
        justifyContent:'center',
        width:35,
        height:35,
        right:10
    },
    buy_now_num:{
        position: 'absolute',
        width:35,
        right:55,
        fontSize: 16,
        textAlign: 'center'
    },
    buy_now_add_shopping_car_view:{
        width:width,
        height:30,
        marginTop:20,
        justifyContent:"center",
        alignItems:'center'
    },
    buy_now_add_shopping_car_button:{
        width:width*0.5,
        height:30,
        backgroundColor:"#EC7E2D",
        borderRadius:35,
        justifyContent:"center",
        alignItems:'center'
    },
});