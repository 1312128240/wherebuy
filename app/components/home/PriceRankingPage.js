import React, {Component} from 'react';
import {
    Image,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
    Dimensions,
    TextInput
} from 'react-native';
import {GET_COMMUNITY, GET_ALL_AREA, GET_RANK, HTTP_REQUEST, addShopCar} from "../../utils/config";
import asyncStorageUtil from "../../utils/AsyncStorageUtil";
import Toast from 'react-native-easy-toast';
import RefreshListView,{RefreshState} from 'react-native-refresh-list-view'
import BuyItNowModal from "../../views/BuyItNowModal";
import PriceRankingModal from "../../views/PriceRankingModal";

const {width,height} = Dimensions.get('window');

/**
 * 价差排行（特价商品）页面
*/
export default class PriceRankingPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            active:1,
            accessToken:"",
            currentPage:1,
            item_data: [],
            modalCategoryVisible: false,
            modalAreaVisible: false,
            AllAreaData:[],//全部地区数据
            CurrentAreaData:[],//当前需要显示的地区数据
            AllCategoryData:[],//全部的分类数据
            CurrentCategoryData:[],//当前需要显示的分类数据
            communityId:'',
            categoryId:'',
            showBrandSearch:false,//是否需要显示品牌搜索框
            brandSearchData:[],//品牌搜索结果
            brandName:'',//品牌名称
            refreshState: RefreshState.Idle,
        };
    }

    componentDidMount(): void {
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            },()=>{
                this.getRank();
            });
        });
    }

    //区域弹窗显示与隐藏
    setAreaModalVisible(visible) {
        this.setState({modalAreaVisible:visible});
    }

    //分类弹窗显示与隐藏
    setCategoryModalVisible(visible) {
        this.setState({modalCategoryVisible:visible});
    }

    render() {
      return (
        <View style={{flex: 1,backgroundColor:'#F5F5F5'}}>
            {this.renderTopMenu()}
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
                textStyle={{color:'white'}}/>
        </View>
      );
    }

    renderTopMenu(){
        return(
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
        );
    }

    //价差排行列表内容
    renderItemView({item}) {
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
                        ￥{PriceRankingPage.Fen2Yuan(item.minPrice)}
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

    //分类弹窗内容
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
    addShopCar(skuId,buyNowNum){
        fetch(HTTP_REQUEST.Host + addShopCar,{
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
                this.refs.BuyItNowModal.close();
            }else {
                this.refs.toast.show('加入购物车成功',1000);
                this.refs.BuyItNowModal.close();
            }
        })
        .catch((error) =>{
            this.refs.toast.show('请求出错',1000);
            this.refs.BuyItNowModal.close();
        })
    }

    //按照品牌搜索
    searchBrand(brandKey){
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
});