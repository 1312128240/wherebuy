import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Image,
    Dimensions,
    Alert,
} from 'react-native';
import {HTTP_REQUEST} from "../../utils/config";
import asyncStorageUtil from "../../utils/AsyncStorageUtil";
import Toast from 'react-native-easy-toast';
import EmptyAddressModal from "../../views/EmptyAddressModal";

//屏幕的宽高
const {width,height} = Dimensions.get('window');

/**
 * 购物车页面 miao 2019年3月28日
*/
export default class ShoppingCar extends  Component{

  constructor(props) {
    super(props);
    this.state = {
        accessToken:"",
        isEdit:false,
        item_data: [],
        totalPrice:'',
        receiveAddressId:'',
        selectAll:true,
    };
  }

  componentDidMount(){
      this._navListener = this.props.navigation.addListener('didFocus', () => {
          asyncStorageUtil.getLocalData("accessToken").then(data=>{
              if(data === ''){
                  this.props.navigation.navigate('AppAuthNavigator')
              }else {
                  this.setState({
                      accessToken: data,
                  },()=>{
                      this.getReceiveAddress();
                  });
              }
          });
      });
  }

  componentWillUnmount() {
      this._navListener.remove();
      this.setState = (state, callback) => null;
  }

  edit(){
      if(this.state.isEdit){
          this.setState({
              isEdit:false
          });
      }else {
          this.setState({
              isEdit:true
          });
      }
  }

  //全选按钮
  allSelect(){
      if(this.state.selectAll){
          this.setState({
              selectAll:false
          });
          //取消全选
          this.shopcarSelectAll('NOT_SELECT');
      }else {
          this.setState({
              selectAll:true
          });
          //全选
          this.shopcarSelectAll('SELECTED');
      }
  }

  //检查是否全部选择，更新底部的全选按钮
  checkAllSelect(){
     let data = this.state.item_data;
     let all = true;
     for(let i = 0;i < data.length;i++){
         if(data[i].selectStatus === 'NOT_SELECT' || data[i].selectStatus === 'NOT_SELECTED'){
             all = false;
             break;
         }
     }
     this.setState({
         selectAll:all
     });
  }

  //订单确认操作
  confirmOrder(){
      let data = this.state.item_data;
      let hasSelect = false;
      for(let i = 0;i < data.length;i++){
          if(data[i].selectStatus === 'SELECTED' || data[i].selectStatus === 'SELECT'){
              hasSelect = true;
              break;
          }
      }
      if(hasSelect){
          this.props.navigation.navigate('ConfirmOrder')
      }else {
          this.refs.toast.show('请先勾选商品',1000);
      }
  }

  render() {
      if(this.state.item_data.length === 0){
          return (
              <View style={{height:height,alignItems:'center',justifyContent:'center'}}>
                  <Image style={{width:150,height:150,resizeMode: 'contain'}} source={require('../../img/cart-emptybg.png')}/>
                  <Text style={{fontSize:16,marginTop:10,marginLeft:10}}>你的购物车空空如也</Text>

                  {/* 地址提示弹窗*/}
                  <EmptyAddressModal ref={'EmptyAddressModal'} params={this.props.navigation}/>
              </View>
          );
      }else {
          return (
              <View style={{flex: 1}}>
                  <View style={{height:50,flexDirection:'row',alignItems:'center',justifyContent: 'center'}}>
                      <Text style={styles.title}>购物车</Text>
                      <TouchableOpacity
                          activeOpacity={0.7}
                          style={{position:'absolute',right:15}}
                          onPress={() => this.edit()}>
                          <Text style={{fontSize:16}}>{this.state.isEdit ? '完成':'编辑'}</Text>
                      </TouchableOpacity>
                  </View>
                  {/* 分割线 */}
                  <View style={styles.cut_off_rule}/>
                  {/* 列表 */}
                  <FlatList
                      data={this.state.item_data}
                      renderItem={this.renderListView.bind(this)}
                      extraData={this.state}
                      keyExtractor={(item,index) => index.toString()}/>
                  {/* 分割线 */}
                  <View style={styles.cut_off_rule}/>
                  {/* 下单栏 */}
                  <View style={styles.bottom_layout}>
                      <TouchableOpacity
                          style={{position: 'absolute',flexDirection:'row',width:30,height:50,left:10,alignItems:'center'}}
                          onPress={()=> this.allSelect()}
                          activeOpacity={0.7}>
                          <Image
                              style={{width:20,height:20}}
                              source={this.state.selectAll ?
                                  require('../../img/selected.png') :
                                  require('../../img/unselected.png')}/>
                          <Text style={{left:5}}>全选</Text>
                      </TouchableOpacity>
                      <Text style={styles.total_text}>合计: ￥{this.state.totalPrice}</Text>
                      <TouchableOpacity
                          activeOpacity={0.7}
                          style={styles.place_an_order_button}
                          onPress={() => this.confirmOrder()}>
                          <Text style={styles.place_an_order_text}>下单</Text>
                      </TouchableOpacity>
                  </View>

                  <Toast
                      ref="toast"
                      style={{backgroundColor:'gray'}}
                      position='bottom'
                      positionValue={200}
                      textStyle={{color:'white'}}/>

                  {/* 地址提示弹窗*/}
                  <EmptyAddressModal ref={'EmptyAddressModal'} params={this.props}/>
              </View>
          );
      }
  }

  renderListView({item}) {
    return (
      <View style={this.state.isEdit ? styles.list_item_delete : styles.list_item}>
        <TouchableOpacity
            style={{width:30,height:30,left:10}}
            activeOpacity={0.7}
            onPress={() => this.onSelect(item.quantity,item.shoppingCarId,item.selectStatus)}>
              <Image
                  style={{width:20,height:20}}
                  source={item.selectStatus === 'SELECTED'?
                      require('../../img/selected.png') :
                      require('../../img/unselected.png')}/>
        </TouchableOpacity>
        {/* 图片 */}
        <Image style={styles.goods_pic} source={{uri:item.goodsSkuImage}}/>
        {/* 名称 */}
        <Text style={styles.goods_name} ellipsizeMode='tail' numberOfLines={1}>{item.goodsName}</Text>
        {/* 最低价超市 */}
        <Text style={styles.min_price} ellipsizeMode='tail' numberOfLines={2}>最低价: ￥{item.minPrice}元 {item.minSupermarketName}</Text>
        {/* 增加商品+ */}
        <TouchableOpacity
            style={styles.item_add_button}
            onPress={() => this.itemAdd(item.quantity,item.shoppingCarId,item.selectStatus)}>
          <Image style={styles.add_reduce_icon} source={{uri:'http://qnm.laykj.cn/image/jia.png'}}/>
        </TouchableOpacity>
        {/* 数量 */}
        <Text style={styles.goods_quantity}>{item.quantity}</Text>
        {/* 减少商品- */}
        <TouchableOpacity
            style={styles.item_reduce_button}
            onPress={() => this.itemReduce(item.quantity,item.shoppingCarId,item.selectStatus)}>
          <Image style={styles.add_reduce_icon } source={{uri:'http://qnm.laykj.cn/image/jian.png'}}/>
        </TouchableOpacity>
        <TouchableOpacity
            style={styles.item_reduce_button}
            onPress={() => this.itemReduce(item.quantity,item.shoppingCarId,item.selectStatus)}>
            <Image style={styles.add_reduce_icon } source={{uri:'http://qnm.laykj.cn/image/jian.png'}}/>
        </TouchableOpacity>
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => this.deleteGoods(item.shoppingCarId)}
            style={styles.delete_goods}>
            <Text style={{color:'white',fontSize:16}}>删除</Text>
        </TouchableOpacity>
      </View>
     );
   }

   /**
    * 商品勾选
    */
   onSelect(quantity,shoppingCarId,currentStatus) {
      let status = '';
      currentStatus === 'SELECTED' ? status = 'NOT_SELECT' : status = 'SELECTED';
      this.updateShoppingCar(quantity,shoppingCarId,status)
    }

    /**
     * 商品数量减少，数量为1的时候不操作
     */
    itemReduce(quantity,shoppingCarId,currentStatus){
        if(quantity > 1){
            this.updateShoppingCar(parseInt(quantity)-1,shoppingCarId,currentStatus)
        }
    }

    /**
     * 商品数量增加
     */
    itemAdd(quantity,shoppingCarId,currentStatus){
        this.updateShoppingCar(parseInt(quantity)+1,shoppingCarId,currentStatus)
    }

    //获取收货地址，并在此判断token是否失效
    getReceiveAddress(){
        fetch(HTTP_REQUEST.Host + '/user/address/getDefaultReceiveAddress.do',{
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
                if(responseJson.errorCode === '1915'){
                    this.refs.EmptyAddressModal.setAddressModal(true);
                }else if(responseJson.errorMsg.indexOf("accessToken失效")>-1){
                    asyncStorageUtil.putLocalData("accessToken","");
                    this.props.navigation.navigate('AppAuthNavigator')
                }

            }else {
                this.setState({
                    receiveAddressId:responseJson.data.receiveAddressId
                });
                this.getShoppingCarData(responseJson.data.receiveAddressId);
            }
        })
        .catch((error) =>{
            console.error(error);
        })
    }

    //获取购物车商品列表
    getShoppingCarData(receiveAddressId){
        fetch(HTTP_REQUEST.Host + '/goods/shopCar/listAdd.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({"receiveAddressId":receiveAddressId}),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode !== 'S'){
                this.refs.toast.show(responseJson.errorMsg,1000);
            }else {
                this.setState({
                    item_data:responseJson.data.ShoppingCars,
                    totalPrice:responseJson.data.totalPrice,
                },()=>{
                    this.checkAllSelect();
                });
            }
        })
        .catch((error) =>{
            console.error(error);
        })
    }

    //购物车数据更新
    updateShoppingCar(quantity,shoppingCarId,selectStatus){
        fetch(HTTP_REQUEST.Host + '/goods/shopCar/updateGoodsNum.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                "quantity":quantity,
                "shoppingCarId":shoppingCarId,
                "selectStatus":selectStatus
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode !== 'S'){
                return;
            }
            //重新获取购物车数据，刷新界面
            this.getReceiveAddress();
        })
        .catch((error) =>{
            console.error(error);
        })
    }

    //删除某个商品，当它数量为1的时候
    deleteGoods(shoppingCarId){
        fetch(HTTP_REQUEST.Host + '/goods/shopCar/deleteShopcar.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                "shoppingCarId":shoppingCarId
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode !== 'S'){
                return;
            }
            //重新获取购物车数据，刷新界面
            this.getReceiveAddress();
        })
        .catch((error) =>{
            console.error(error);
        })
    }

    //购物车全选
    shopcarSelectAll(type){
        fetch(HTTP_REQUEST.Host + '/goods/shopCar/shopcarSelectAll.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                "receiveAddressId":this.state.receiveAddressId,
                "selectStatus":type
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode !== 'S'){
                return;
            }
            //重新获取购物车数据，刷新界面
            this.getReceiveAddress();
        })
        .catch((error) =>{
            console.error(error);
        })
    }
}

const styles = StyleSheet.create({
    title: {
      fontSize: 20,
    },
    cut_off_rule: {
      height:0.7,
      backgroundColor:"gray"
    },
    bottom_layout: {
      height:50,
      flexDirection:'row'
    },
    total_text: {
      position: 'absolute',
      right:110,
      top:15,
      fontSize: 16,
      color:'#FF8247'
    },
    place_an_order_button: {
      position: 'absolute',
      width:100,
      height:50,
      left:width-100,
      backgroundColor:'#FF8247',
      alignItems:'center',
      justifyContent: 'center'
    },
    place_an_order_text: {
      color:'white',
      fontSize: 18
    },
    list_item: {
      flexDirection:'row',
      borderTopWidth: 0, 
      borderBottomWidth: 0.5, 
      borderBottomColor: 'grey',
      height:120,
      width:width+60,
      alignItems:'center',
    },
    list_item_delete: {
        flexDirection:'row',
        borderTopWidth: 0,
        borderBottomWidth: 0.5,
        borderBottomColor: 'grey',
        height:120,
        width:width+60,
        alignItems:'center',
        right:60
    },
    delete_goods:{
        position: 'absolute',
        height:119,
        width:60,
        right:0,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'red',
    },
    goods_pic: {
      position: 'absolute',
      width:100,
      height:100,
      top:10,
      left:40
    },
    goods_name: {
      position: 'absolute',
      left:140,
      right:75,
      top:12,
      fontSize: 18,
      fontWeight:'bold'
    },
    min_price: {
      position: 'absolute',
      left:140,
      right:75,
      top:50,
      fontSize: 14,
      color:'#FF8247'
    },
    item_add_button: {
      position: 'absolute',
      width:25,
      height:25,
      left:width-45,
      top:80
    },
    add_reduce_icon: {
      width:25,
      height:25,
    },
    goods_quantity: {
      position: 'absolute',
      width:25,
      left:width-70,
      top:80,
      fontSize: 16,
      textAlign: 'center'
    },
    item_reduce_button: {
      position: 'absolute',
      width:25,
      height:25,
      left:width-96,
      top:80
    },
});
