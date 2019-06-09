import React, {Component} from 'react';
import {
    StyleSheet,
    TextInput,
    View,
    Image,
    Text,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import asyncStorageUtil from "../../utils/AsyncStorageUtil";
import {HTTP_REQUEST,SEARCH,addShopCar} from "../../utils/config";
import RefreshListView,{RefreshState} from 'react-native-refresh-list-view'
import Toast from 'react-native-easy-toast';
import BuyItNowModal from "../../views/BuyItNowModal";
import PriceRankingModal from "../../views/PriceRankingModal";
import SearchPageJumpModal from "../../views/SearchPageJumpModal";

const {width,height} = Dimensions.get('window');
const PriceSortedPic = [
    require('../../img/icon_price_normal.png'),
    require('../../img/icon_price_up.png'),
    require('../../img/icon_price_down.png'),
];
let offsetY = 0;

/**
 * 商品搜索页面，三个入口：首页、商品分类页、条码扫描页。
*/
export default class SearchGoodsPage extends Component{

    constructor(props) {
        super(props);
        this.state = {
            accessToken:"",
            item_data: [],
            hasData:true,
            showJumpModal:false,//是否展示消息直达按钮
            active:1,
            priceSorted:0,
            orderType:'NORMAL',
            searchType:1,//1普通搜索、2条码搜索、3搜索分类、4分类下搜索
            categoryId:'',
            categoryName:'',
            searchName:'',
            refreshState: RefreshState.Idle,
            currentPage:1,
            totalPage:1,
            showHistory:true,//搜索历史数据
            SearchHistoryData:[],
            SearchHistoryItems:[],
            scrollDown:false//列表滚动方向
        };
    }

    componentDidMount() {
        this.getSearchHistory();
        this.getToken();
    }

    getSearchHistory(){
        asyncStorageUtil.getLocalData("SearchHistory").then(data=>{
            if (data === [] || data === '') return;
            let SearchHistoryData = JSON.parse(data);
            let SearchHistoryItems = [];
            for (let i = 0; i < SearchHistoryData.length; i++) {
                let name = SearchHistoryData[i].searchName;
                let searchType = SearchHistoryData[i].searchType;
                let categoryId = SearchHistoryData[i].categoryId;
                SearchHistoryItems.push(
                    <Text
                        style={styles.search_history_text}
                        key={i}
                        onPress={() => this.clickHistory(name,searchType,categoryId)}>
                        {name}
                    </Text>
                );
            }
            this.setState({
                SearchHistoryData: SearchHistoryData,
                SearchHistoryItems:SearchHistoryItems,
            });
        });
    }

    getToken(){
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            },()=>{
                let type = this.props.navigation.state.params.type;
                //搜索条码
                if(type === 2){
                    let barcode = this.props.navigation.state.params.code;
                    this.setState({
                        searchName:barcode,
                        searchType:type
                    },()=>{
                        this.search();
                    })
                }
                //搜索商品分类
                if(type === 3){
                    let categoryName = this.props.navigation.state.params.categoryName;
                    let categoryId = this.props.navigation.state.params.categoryId;
                    this.setState({
                        searchName:categoryName,
                        categoryName:categoryName,
                        categoryId:categoryId,
                        searchType:type
                    },()=>{
                        this.search();
                    })
                }
            });
        });
    }

    render() {
        return (
            <View style={{flex: 1,backgroundColor:'#F5F5F5'}}>
                {this.renderTopBar()}
                {this.renderHeader()}
                {this.renderSearchHistory()}
                {this.renderGoodsList()}
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
                <SearchPageJumpModal
                    ref={'SearchPageJumpModal'}
                    visible={false}
                    navigation={this.props.navigation}
                />
                <Toast
                    ref="toast"
                    style={{backgroundColor:'gray'}}
                    position='bottom'
                    positionValue={200}
                    textStyle={{color:'white'}}
                />
                {this.renderDIYButton()}
                {this.renderDIYFloat()}
            </View>
        );
    }

    //顶部搜索栏
    renderTopBar(){
        return(
            <View style={styles.top_bar}>
                <TouchableOpacity
                    style={styles.top_bar_back}
                    activeOpacity={0.7}
                    onPress={() => this.props.navigation.goBack()}>
                    <Image
                        style={{width:20,height:25,resizeMode:'contain'}}
                        source={require('../../img/back_img.png')}/>
                    <Text style={{color:'#FF8247',fontSize:16}}>返回</Text>
                </TouchableOpacity>
                <View style={styles.top_bar_search}>
                    <Image
                        style={{left:10}}
                        source={require('../../img/search_icon.png')}/>
                    <TextInput
                        ref={'InputText'}
                        style={{left:10,width:width*0.5}}
                        value={this.state.searchName}
                        onSubmitEditing={() => this.search()}
                        onChangeText={(name) => this.onTextInput(name)}
                        placeholder="请输入搜索内容">
                    </TextInput>
                </View>
                {
                    this.state.showJumpModal ?
                    <TouchableOpacity
                        style={styles.top_bar_btn}
                        activeOpacity={0.7}
                        onPress={() => this.refs.SearchPageJumpModal.show()}>
                        <Image
                            style={{width:25,height:25,resizeMode:'contain'}}
                            source={require('../../img/icon_search_jump.png')}/>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity
                        style={styles.top_bar_btn}
                        activeOpacity={0.7}
                        onPress={() => this.search()}>
                        <Text style={{fontSize:16}}>搜索</Text>
                    </TouchableOpacity>
                }
            </View>
        );
    }

    //头部搜索条件
    renderHeader(){
        if(this.state.item_data.length === 0){
            return (<View/>)
        }else {
            return (
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
                        <Text style={this.state.active === 2 ? styles.top_menu_text_selected :styles.top_menu_text}>价格</Text>
                        <Image
                            style={{width:12,height:16,marginLeft:10}}
                            source={PriceSortedPic[this.state.priceSorted]}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {this.topTabClick(3)}}>
                        <Text style={this.state.active === 3 ? styles.top_menu_text_selected :styles.top_menu_text}>价差率</Text>
                    </TouchableOpacity>
                </View>
            )
        }
    }

    //商品列表View
    renderGoodsList(){
        return(
            <RefreshListView
                data={this.state.item_data}
                renderItem={this.renderItemView.bind(this)}
                keyExtractor={(item,index) => index.toString()}
                refreshState={this.state.refreshState}
                showsVerticalScrollIndicator = {false}
                onScroll={this.onScroll.bind(this)}
                scrollEventThrottle={100}
                onFooterRefresh={()=>{
                    if(this.state.currentPage >= this.state.totalPage){
                        this.refs.toast.show('全部加载完毕',1000);
                    }else {
                        let current = this.state.currentPage;
                        this.setState({
                            currentPage: current+1,
                            refreshState: RefreshState.FooterRefreshing
                        },()=> {
                            this.search();
                        });
                    }
                }}
                onHeaderRefresh={()=>{
                    this.setState({
                        currentPage:1,
                        refreshState: RefreshState.HeaderRefreshing,
                    },()=>{
                        this.search();
                    });
                }}
            />
        );
    }

    //自定义下单按钮、自定义下单悬浮窗
    renderDIYButton(){
        return(
            <View style={this.state.hasData ? {width:0,height:0} : styles.no_data_view}>
                <Text style={{fontSize:16,color:'#9A9A9A'}}>暂无此商品</Text>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => this.props.navigation.navigate('DIYOrderPage',{name:this.state.searchName})}
                    style={styles.diy_order_button}>
                    <Text style={styles.diy_order_button_text}>自定义下单</Text>
                </TouchableOpacity>
            </View>
        );
    }

    //自定义下单悬浮窗
    renderDIYFloat(){
        return(
            <View style={this.state.item_data.length === 0 ? {width:0,height:0} : styles.float_button_view}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => this.props.navigation.navigate('DIYOrderPage',{name:this.state.searchName})}
                    style={this.state.scrollDown ? styles.float_button : styles.float_button_unfold}>
                    <Image
                        style={{width:35,height:35,resizeMode:'contain'}}
                        source={require('../../img/icon_search_get_price.png')}/>
                    <Text style={{color:'white',fontSize:15,marginLeft:10}}>自定义下单</Text>
                </TouchableOpacity>
            </View>
        );
    }

    //头部选项点击事件
    topTabClick(pos){
        //判断是否重复点击价格排序
        if(pos === 2 && this.state.priceSorted !== 0){
            let sorted = this.state.priceSorted === 1 ? 2:1;
            let orderType =  this.state.priceSorted === 1 ? 'PRICE_DOWN':'PRICE_UP';
            this.setState({
                priceSorted:sorted,
                orderType:orderType,
            },()=>{
                this.search();
            });
        }else {
            //切换重置条件
            this.setState({
                active:pos,
                priceSorted:0,
                currentPage:1,
                item_data:[],
            });
            //综合
            if(pos === 1){
                this.setState({
                    orderType:'NORMAL',
                },()=>{
                    this.search();
                });
            }
            //价格
            if(pos === 2){
                this.setState({
                    priceSorted:1,
                    orderType:'PRICE_UP',
                },()=>{
                    this.search();
                });
            }
            //销量
            if(pos === 3){
                this.setState({
                    orderType:'SPREAD_DOWN',
                },()=>{
                    this.search();
                });
            }
        }
    }

    //监听列表的滚动事件，控制自定义下单悬浮按钮
    onScroll(event){
        let offset = parseInt(event.nativeEvent.contentOffset.y) - offsetY;
        if(offset > 0 && !this.state.scrollDown){
            this.setState({
                scrollDown:true
            })
        }
        if(offset < 0 && this.state.scrollDown){
            this.setState({
                scrollDown:false
            })
        }
        offsetY = parseInt(event.nativeEvent.contentOffset.y);
    }

    //当文本输入时，根据当前不同的type做出响应。
    onTextInput(name){
        //关闭消息直达按钮
        this.setState({
            showJumpModal:false
        });
        //正常文本搜索
        if(this.state.searchType === 1){
            this.setState({
                searchName:name,
            })
        }
        //条码搜索，输入时切换为文本搜索。
        if(this.state.searchType === 2){
            this.setState({
                searchName:name,
                searchType:1,
            })
        }
        //点击分类，输入时切换到分类下搜索。米面类/米
        if(this.state.searchType === 3){
            this.setState({
                searchName:name,
                searchType:4
            })
        }
        //分类下搜索
        if(this.state.searchType === 4){
            this.setState({
                searchName:name,
            })
        }
    }

    //加载搜索历史记录
    renderSearchHistory() {
        if(this.state.showHistory){
            return (
                <View style={{marginLeft:15,marginRight:15}}>
                    <View style={{flexDirection: 'row',alignItems:'center',marginTop:10}}>
                        <Text style={{fontSize:16}}>搜索历史</Text>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={()=> this.deleteHistory()}
                            style={{position: 'absolute',width:25,height:25,right:0}}>
                            <Image
                                style={{width:25,height:25}}
                                source={require('../../img/delete_search_history.png')}/>
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection: 'row',flexWrap:'wrap'}}>
                        {this.state.SearchHistoryItems.map((elem,index) => {
                            return elem;
                        })}
                    </View>
                </View>
            );
        }else{
            return (
                <View/>
            );
        }
    }

    //清空搜索记录
    deleteHistory(){
        asyncStorageUtil.putLocalData("SearchHistory",JSON.stringify([]));
        this.setState({
            SearchHistoryData: [],
            SearchHistoryItems:[],
        });
    }

    //点击搜索记录
    clickHistory(name,searchType,categoryId){
        if(searchType === 4){
            this.setState({
                categoryId:categoryId,
                categoryName:name.split('/')[0],
                searchName:name.split('/')[1],
                searchType:searchType,
            },() => {
                this.search()
            });
        }else {
            this.setState({
                categoryId:categoryId,
                searchName:name,
                searchType:searchType,
            },() => {
                this.search()
            });
        }
    }

    //商品列表布局
    renderItemView({item}) {
        return (
            <View style={styles.list_item}>
                <Image
                    style={styles.list_item_img}
                    source={{uri:item.image}}/>
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
                    numberOfLines={1}>价差率：{item.spreadRate}%
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
                        numberOfLines={1}>￥{SearchGoodsPage.Fen2Yuan(item.minPrice)}
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

    //本地存储搜索历史
    saveSearchHistory(){
        let SearchHistory = this.state.SearchHistoryData;
        let searchKey = {};
        if(this.state.searchType === 1){
            searchKey.searchName = this.state.searchName;
            searchKey.searchType = 1;
            searchKey.categoryId = '';
        }else if(this.state.searchType === 2){
            searchKey.searchName = this.state.searchName;
            searchKey.searchType = 2;
            searchKey.categoryId = '';
        }else if(this.state.searchType === 3){
            searchKey.searchName = this.state.searchName;
            searchKey.searchType = 3;
            searchKey.categoryId = this.state.categoryId;
        }else if(this.state.searchType === 4){
            searchKey.searchName = this.state.categoryName+'/'+this.state.searchName;
            searchKey.searchType = 4;
            searchKey.categoryId = this.state.categoryId;
        }
        //去重
        let hasSearch = false;
        for(let i = 0;i < SearchHistory.length;i++){
            if(SearchHistory[i].searchName === searchKey.searchName){
                hasSearch = true;
                break
            }
        }
        if(!hasSearch){
            SearchHistory.push(searchKey);
        }
        asyncStorageUtil.putLocalData("SearchHistory",JSON.stringify(SearchHistory));
    }

    search(){
        //展示消息直达按钮
        this.setState({
            showJumpModal:true
        });
        //关闭键盘
        this.refs.InputText.blur();
        if(this.state.searchName === ''){
            this.refs.toast.show('请输入搜索内容',1000);
            return
        }
        this.saveSearchHistory();
        let body;
        if(this.state.searchType === 1){
            body = {
                "currentPage": this.state.currentPage,
                "key": this.state.searchName,
                "orderType": this.state.orderType,
                "pageSize": 10
            };
        }else if(this.state.searchType === 2){
            body = {
                "currentPage": this.state.currentPage,
                "barcode": this.state.searchName,
                "orderType": this.state.orderType,
                "pageSize": 10
            };
        }else if(this.state.searchType === 3){
            body = {
                "currentPage": this.state.currentPage,
                "categoryId": this.state.categoryId,
                "orderType": this.state.orderType,
                "pageSize": 10
            };
        }else if(this.state.searchType === 4){
            body = {
                "currentPage": this.state.currentPage,
                "categoryId": this.state.categoryId,
                "key": this.state.searchName,
                "orderType": this.state.orderType,
                "pageSize": 10
            };
        }
        //调用搜索
        fetch(HTTP_REQUEST.Host + SEARCH,{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify(body),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            //条码搜索、普通搜索返回的数据格式不一致，暂且按此方式处理
            if(this.state.searchType === 2){
                if(responseJson.respCode !== 'S'){
                    this.refs.toast.show(responseJson.errorMsg,1000);
                    this.setState({
                        hasData:false,
                        showHistory:false,
                        item_data:[],
                        refreshState: RefreshState.Idle,
                    });
                }else {
                    this.setState({
                        item_data:[responseJson.data],
                        totalPage:1,
                        refreshState: RefreshState.Idle,
                        showHistory:false,
                        hasData:true,
                    })
                }
            }else{
                if(this.state.currentPage === 1 &&
                    (responseJson.data.data === null || responseJson.data.data.length === 0))
                {
                    this.refs.toast.show('无数据',1000);
                    this.setState({
                        hasData:false,
                        showHistory:false,
                        item_data:[],
                        refreshState: RefreshState.Idle,
                    });
                }else {
                    if(this.state.currentPage === 1){
                        this.setState({
                            item_data:responseJson.data.data,
                            totalPage:responseJson.data.totalPage,
                            showHistory:false,
                            refreshState: RefreshState.Idle,
                            hasData:true,
                        });
                    }else {
                        let data = responseJson.data.data;
                        let stateData = this.state.item_data;
                        let newData = stateData.concat(data);
                        this.setState({
                            item_data:newData,
                            totalPage:responseJson.data.totalPage,
                            showHistory:false,
                            refreshState: RefreshState.Idle,
                            hasData:true,
                        })
                    }
                }
            }
        })
        .catch((error) =>{
            this.refs.toast.show('请求出错',1000);
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
    top_bar:{
        flexDirection:'row',
        alignItems:'center',
        height:60,
        width:width,
        backgroundColor:'white'
    },
    top_bar_search:{
        flexDirection:'row',
        alignItems:'center',
        height:40,
        width:width*0.7,
        borderRadius:45,
        backgroundColor:'#F5F5F5'
    },
    top_bar_back:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        height:40,
        width:width*0.17,
    },
    top_bar_btn:{
        alignItems:'center',
        justifyContent:'center',
        height:40,
        width:width*0.13,
    },
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
   search_history_text:{
        padding:8,//内边距
        marginLeft:10,
        marginTop:15,
        borderRadius:28,
        textAlignVertical:'center',
        backgroundColor:'white'
   },
    //顶部选择菜单栏
    top_menu_view: {
        height: 40,
        alignItems:'center',
        flexDirection: 'row',
        justifyContent:'space-around',
        borderTopWidth:0.5,
        borderTopColor:'gray',
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
    //无数据布局
    no_data_view:{
        position:'absolute',
        width:width,
        height:300,
        top:(height/2)-150,
        alignItems:'center',
        justifyContent:'center'
    },
    //自定义下单
    diy_order_button:{
        marginTop:5,
        width:90,
        height:33,
        backgroundColor:"#EC7E2D",
        borderRadius:45,
        justifyContent:"center",
        alignItems:'center'
    },
    diy_order_button_text:{
        fontSize:15,
        color:"white"
    },
    //获取报价悬浮窗
    float_button_view:{
        position:'absolute',
        justifyContent:'center',
        bottom:150,
        right:0,
        width:150,
        height:55,
    },
    float_button:{
        width:150,
        height:55,
        marginLeft:90,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        borderBottomLeftRadius:45,
        borderTopLeftRadius:45,
        backgroundColor:'rgba(0, 0, 0, 0.65)',
    },
    float_button_unfold:{
        width:150,
        height:55,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        borderBottomLeftRadius:45,
        borderTopLeftRadius:45,
        backgroundColor:'rgba(0, 0, 0, 0.65)',
    },
});
