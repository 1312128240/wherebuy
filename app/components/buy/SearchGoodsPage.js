import React, {Component} from 'react';
import {
    StyleSheet,
    TextInput,
    View,
    Image,
    Text,
    TouchableOpacity,
    Modal,
    Dimensions,
    FlatList,
    Keyboard,
} from 'react-native';
import asyncStorageUtil from "../../utils/AsyncStorageUtil";
import {HTTP_REQUEST, SEARCH, addShopCar, GET_PRICE_LIST} from "../../utils/config";
import RefreshListView,{RefreshState} from 'react-native-refresh-list-view'
import Toast from 'react-native-easy-toast';
import BaseComponent from "../../views/BaseComponent";

const {width,height} = Dimensions.get('window');
//按价格排序的图片
const PriceSortedPic = [
    require('../../img/icon_price_normal.png'),
    require('../../img/icon_price_up.png'),
    require('../../img/icon_price_down.png'),
];

/**
 * 商品搜索页面
*/
export default class SearchGoodsPage extends BaseComponent{
  
  constructor(props) {
    super(props);
    this.state = {
        accessToken:"",
        user_text: '',
        item_data: [],
        hasData:true,
        modalVisible: false,
        lookGoodsName:'',
        lookGoodsImg:'',
        buyModalVisible: false,
        name:'',//商品名称key
        searchType:1,//1为文本类型搜索、2为条码搜索、3为商品分类搜索
        categoryId:'',//分类页面的分类ID
        showHistory:true,
        SearchHistoryData:[],//用于更新本地数据
        SearchHistoryItems:[],//Text数组，用来界面展示记录
        buyNowItemData:{},
        buyNowNum:1,
        currentPage:1,
        refreshState: RefreshState.Idle,
        supermarketPriceList:[],
        spreadRate:'',
        active:1,
        priceSorted:0,
        orderType:'NORMAL'
    };
  }

  componentDidMount() {
      super.componentDidMount();
    //获取搜索历史
    asyncStorageUtil.getLocalData("SearchHistory").then(data=>{
        if (data === [] || data === '') return;
        let SearchHistoryData = JSON.parse(data);
        let SearchHistoryItems = [];
        for (let i = 0; i < SearchHistoryData.length; i++) {
            let name = SearchHistoryData[i].searchName;
            let searchType = SearchHistoryData[i].searchType;
            let categoryId = SearchHistoryData[i].categoryId;
            SearchHistoryItems.push(
                <Text style={styles.search_history_text}
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
    //获取token
    asyncStorageUtil.getLocalData("accessToken").then(data=>{
       this.setState({
          accessToken: data,
       },()=>{
           //扫一扫、首页、分类传来的 name、type type=1为文本类型搜索、2为条码搜索、3为商品分类搜索
           let type = this.props.navigation.state.params.type;
           let name = this.props.navigation.state.params.name;
           if((type === 1 || type === 2) && name != null){
               this.setState({
                   name:name,
                   searchType:type
               },()=>{
                   this.search();
               });
           }
           //分类传来的数据，获取categoryId
           if(type === 3){
               this.setState({
                   name:name,
                   searchType:type,
                   categoryId:this.props.navigation.state.params.categoryId
               },()=>{
                   this.search();
               });
           }
       });
    });
  }

  componentWillMount() {
     //监听键盘隐藏事件
     this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide',
       this.keyboardDidHideHandler.bind(this));
  }

  componentWillUnmount() {
      //卸载键盘隐藏事件监听
      if(this.keyboardDidHideListener != null) {
          this.keyboardDidHideListener.remove();
      }
  }

  //键盘隐藏事件响应
  keyboardDidHideHandler(event) {
      this.search();
  }

  //比价Modal
  setModalVisible(visible) {
      this.setState({modalVisible:visible});
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

  render() {
      return (
          <View style={{flex: 1,backgroundColor:'#F5F5F5'}}>
              <View style={styles.top_bar}>
                  <TouchableOpacity
                      style={styles.top_bar_back}
                      activeOpacity={0.7}
                      onPress={() => this.props.navigation.goBack()}>
                      <Image style={{width:20,height:25,resizeMode:'contain'}} source={require('../../img/back_img.png')}/>
                      <Text style={{color:'#FF8247',fontSize:16}}>返回</Text>
                  </TouchableOpacity>
                  <View style={styles.top_bar_search}>
                      <Image style={{left:10}} source={require('../../img/search_icon.png')}/>
                      <TextInput
                          ref={'InputText'}
                          style={{left:10,width:width*0.5}}
                          value={this.state.name}
                          onChangeText={(name) => this.setState({name,searchType:1})}
                          placeholder="请输入搜索内容">
                      </TextInput>
                  </View>
                  <TouchableOpacity
                      style={styles.top_bar_btn}
                      activeOpacity={0.7}
                      onPress={() => this.search()}>
                      <Text style={{fontSize:16}}>搜索</Text>
                  </TouchableOpacity>
              </View>
              {this.renderHeader()}
              {this.renderSearchHistory()}
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
                          this.loadData();
                      });
                  }}
                  onHeaderRefresh={()=>{
                      this.setState({
                          currentPage:1,
                          refreshState: RefreshState.HeaderRefreshing,
                      },()=>{
                          this.loadData();
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
              <View style={this.state.hasData ? {width:0,height:0} : styles.no_data_view}>
                  {/*<Image style={{width:200,height:200,resizeMode:'contain'}} source={require('../../img/search_no_data.png')}/>*/}
                  <Text style={{fontSize:16,color:'#9A9A9A'}}>暂无此商品</Text>
                  <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => this.props.navigation.navigate('DIYOrderPage',{name:this.state.name})}
                      style={styles.diy_order_button}>
                      <Text style={styles.diy_order_button_text}>获取报价</Text>
                  </TouchableOpacity>
              </View>
              {/*获取报价悬浮窗*/}
              <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => this.props.navigation.navigate('DIYOrderPage',{name:this.state.name})}
                  style={this.state.item_data.length === 0 ? {width:0,height:0} : styles.float_button}>
                  <Image style={{width:40,height:40,resizeMode:'contain'}} source={require('../../img/icon_search_get_price.png')}/>
              </TouchableOpacity>
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
                this.loadData();
            });
        }else {
            //切换重置条件
            this.setState({
                active:pos,
                priceSorted:0,
                currentPage:1,
            });
            //综合
            if(pos === 1){
                this.setState({
                    orderType:'NORMAL',
                },()=>{
                    this.loadData();
                });
            }
            //价格
            if(pos === 2){
                this.setState({
                    priceSorted:1,
                    orderType:'PRICE_UP',
                },()=>{
                    this.loadData();
                });
            }
            //销量
            if(pos === 3){
                this.setState({
                    orderType:'SPREAD_DOWN',
                },()=>{
                    this.loadData();
                });
            }
        }
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
                    <Text style={styles.buy_now_price}>￥{SearchGoodsPage.Fen2Yuan(this.state.buyNowItemData.minPrice)}</Text>
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
                <View style={styles.add_shopping_car_view}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.add_shopping_car_button}
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

  /**
   * 加载搜索历史记录
   */
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
                          <Image style={{width:25,height:25}} source={require('../../img/delete_search_history.png')}/>
                      </TouchableOpacity>
                  </View>
                  <View style={{flexDirection: 'row',flexWrap:'wrap'}}>
                      {this.state.SearchHistoryItems.map((elem,index) => {
                          return elem;
                      })}
                  </View>
              </View>
          );
      }else {
          return (
              <View/>
          );
      }
  }

  /**
   * 删除搜索记录
  */
  deleteHistory(){
      asyncStorageUtil.putLocalData("SearchHistory",JSON.stringify([]));
      this.setState({
          SearchHistoryData: [],
          SearchHistoryItems:[],
      });
  }

  /**
    * 点击搜索记录
   */
  clickHistory(name,searchType,categoryId){
      this.setState({
          categoryId:categoryId,
          name:name,
          searchType:searchType,
      },() => {
          this.search()
      });
  }

  /**
   * 返回 flatList 里面的布局
   * @param item
   * @returns {XML}
   */
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
                  numberOfLines={1}>￥{SearchGoodsPage.Fen2Yuan(item.minPrice)}
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
  }

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
                    {item.price === -1 ? '无货/无价格': SearchGoodsPage.Fen2Yuan(item.price)+'元'}
                </Text>
            </View>
        );
    }

  //分转元
  static Fen2Yuan(num){
      if (typeof num !== "number" || isNaN(num)) return null;
      return (num / 100).toFixed(2);
  }

  search(){
    this.refs.InputText.blur();
    if(this.state.name === ''){
        this.refs.toast.show('请输入搜索内容',1000);
        return
    }
    //本地存储搜索历史
    let SearchHistory = this.state.SearchHistoryData;
    let searchKey = {};
    searchKey.searchName = this.state.name;
    searchKey.searchType = this.state.searchType;
    searchKey.categoryId = this.state.categoryId
    //去重
    let hasSearch = false;
    for(let i = 0;i < SearchHistory.length;i++){
        if(SearchHistory[i].searchName === this.state.name){
            hasSearch = true;
            break
        }
    }
    if(!hasSearch){
        SearchHistory.push(searchKey);
    }
    asyncStorageUtil.putLocalData("SearchHistory",JSON.stringify(SearchHistory));
    //判断是是扫一扫搜索、普通文本搜索、分类搜索
    let body;
    if(this.state.searchType === 1){
        body = {
            "currentPage": 1,
            "key": this.state.name,
            "orderType": this.state.orderType,
            "pageSize": 10
        };
    }else if(this.state.searchType === 2){
        body = {
            "currentPage": 1,
            "barcode": this.state.name,
            "orderType": this.state.orderType,
            "pageSize": 10
        };
    }else if(this.state.searchType === 3){
        body = {
            "currentPage": 1,
            "categoryId": this.state.categoryId,
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
        if(this.state.searchType === 1 || this.state.searchType === 3){
            if(responseJson.respCode !== 'S' || responseJson.data.data == null || responseJson.data.data.length === 0){
                this.refs.toast.show('无数据',1000);
                this.setState({
                    hasData:false,
                    showHistory:false,
                    item_data:[],
                });
            }else {
                this.setState({
                    item_data:responseJson.data.data,
                    showHistory:false,
                    hasData:true,
                })
            }
        }else if(this.state.searchType === 2){
            if(responseJson.respCode !== 'S'){
                this.refs.toast.show(responseJson.errorMsg,1000);
                this.setState({
                    hasData:false,
                    showHistory:false,
                    item_data:[],
                });
            }else {
                this.setState({
                    item_data:[responseJson.data],
                    showHistory:false,
                    hasData:true,
                })
            }
        }
    })
    .catch((error) =>{
        this.refs.toast.show('请求出错',1000);
    })
  }

  //搜索，无本地记录缓存
  loadData(){
      let body;
      if(this.state.searchType === 1){
          body = {
              "currentPage": this.state.currentPage,
              "key": this.state.name,
              "orderType": this.state.orderType,
              "pageSize": 10
          };
      }else if(this.state.searchType === 2){
          body = {
              "currentPage": this.state.currentPage,
              "barcode": this.state.name,
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
      }
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
        if(this.state.searchType === 1 || this.state.searchType === 3){
            if(this.state.currentPage === 1
                && (responseJson.respCode !== 'S'
                || responseJson.data.data == null
                || responseJson.data.data.length === 0))
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
                        showHistory:false,
                        refreshState: RefreshState.Idle,
                        hasData:true,
                    })
                }
            }
        }else if(this.state.searchType === 2){
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
                    refreshState: RefreshState.Idle,
                    showHistory:false,
                    hasData:true,
                })
            }
        }
    })
    .catch((error) =>{
        this.refs.toast.show('请求出错',1000);
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
            if(responseJson.respCode !== 'S' || responseJson.data == null){
                this.refs.toast.show('价格获取失败',1000);
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
     //列表item
     list_item: {
        borderTopWidth: 0.5,
        borderTopColor: 'grey',
        alignItems:'center',
        height:150,
        backgroundColor:'white'
     },
     //商品图片
     list_item_img: {
        position: 'absolute',
        resizeMode :'contain',
        width:120,
        height:120,
        left:10,
     },
     //商品名字
     goods_name: {
        position: 'absolute',
        left:140,
        right:15,
        top:12,
        fontSize: 18,
        fontWeight:'bold'
    },
    //商品属性
    goods_attr: {
        position: 'absolute',
        left:140,
        right:15,
        top:60,
        fontSize: 14,
    },
   // //弹出框
   // modal_style: {
   //    flex: 1,
   //    backgroundColor: 'rgba(0, 0, 0, 0.5)'
   // },
   // //弹出框内容
   // modal_content: {
   //    position: 'absolute',
   //    alignItems:'center',
   //    height:height*0.5,
   //    width:width*0.8,
   //    left:width*0.1,
   //    top:height*0.25,
   //    borderRadius:5,
   //    backgroundColor:'#FFFFFF'
   // },
   // //弹出框标题
   // modal_title: {
   //    top:10,
   //    fontSize: 18,
   //    fontWeight:'bold'
   // },
   search_history_text:{
       padding:8,//内边距
       marginLeft:10,
       marginTop:15,
       borderRadius:28,
       textAlignVertical:'center',
       backgroundColor:'white'
   },
    //立即购买弹窗
    buy_now_modal_style: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    buy_now_modal_content: {
        position: 'absolute',
        height:height*0.35,
        width:width,
        top:height*0.65,
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
    add_shopping_car_view:{
        width:width,
        height:30,
        marginTop:20,
        justifyContent:"center",
        alignItems:'center'
    },
    add_shopping_car_button:{
        width:width*0.5,
        height:30,
        backgroundColor:"#EC7E2D",
        borderRadius:35,
        justifyContent:"center",
        alignItems:'center'
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
        position:'absolute',
        marginTop:100,
        marginLeft:100,
        marginRight:5,
        height:height*0.4-100,
        width:width*0.9-105
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
    float_button:{
        position:'absolute',
        alignItems:'center',
        justifyContent:'center',
        bottom:150,
        right:20,
        width:70,
        height:70,
        backgroundColor:'rgba(0, 0, 0, 0.65)',
        borderRadius:90
    },

    addressModalBtn:{
        height:55,
        width:width-160,
        alignItems:'center',
        justifyContent:'center',
        borderTopColor:'#D9D9D9',
        borderTopWidth:0.5
    }
});
