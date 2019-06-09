import React, {Component} from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    TextInput,
    Modal,
    Alert
} from 'react-native';
import {HTTP_REQUEST} from "../../utils/config";
import asyncStorageUtil from "../../utils/AsyncStorageUtil";
import {dateToString} from '../../utils/dateUtil'
const {width,height} = Dimensions.get('window');

/**
 * 订单确认页面 2019年4月17日
 */
export default class ConfirmOrder extends Component{

    constructor(props) {
        super(props);
        this.state = {
            accessToken:'',
            addressData:'',
            orderData:'',
            remarks:'',//买家留言
            modalVisible: false,
            pay:'微信支付'
        };
    }

    componentDidMount(){
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            },()=>{
                this.getDefaultReceiveAddress();
                let goodsSkuId = this.props.navigation.state.params.goodsSkuId;
                let quantity = this.props.navigation.state.params.quantity;
                if(goodsSkuId !== ''){
                    this.getDirectOrderInfo(goodsSkuId,quantity)
                }else {
                    this.getOrderInfo();
                }
            });
        });
    }

    render() {
        return (
            <View style={{flex:1,backgroundColor:'#F5F5F5'}}>
                <FlatList
                    data={this.state.orderData.shopCars}
                    renderItem={this.renderView.bind(this)}
                    ListHeaderComponent={this.renderHeaderView.bind(this)}
                    ListFooterComponent={this.renderFooterView.bind(this)}
                    keyExtractor={(item,index) => index.toString()}/>
                <View style={styles.submit_order_view}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={()=> this.submitOrder()}
                        style={styles.submit_btn}>
                        <Text style={styles.submit_btn_text}>提交订单</Text>
                    </TouchableOpacity>
                    <Text style={styles.submit_total_price}>
                        共{this.state.orderData.totalPipce}件  合计: ￥{this.state.orderData.totalPrice}元
                    </Text>
                </View>
            </View>
        );
    }

    renderView({item}) {
        return (
            <View style={styles.goods_info_view}>
                <Image
                    style={styles.goods_image}
                    source={{uri:item.goodsSkuImage}}/>
                <Text
                    style={styles.goods_name}
                    ellipsizeMode='tail'
                    numberOfLines={1}>
                    {item.goodsName}
                </Text>
                <Text
                    style={styles.goods_min}
                    ellipsizeMode='tail'
                    numberOfLines={1}>
                    最低价: {item.minPrice}元 {item.minSupermarketName}
                </Text>
                <Text
                    style={styles.goods_max}
                    ellipsizeMode='tail'
                    numberOfLines={1}>
                    最高价: {item.maxPrice}元 {item.maxSupermarketName}
                </Text>
                <Text
                    style={styles.goods_spread_rate}
                    ellipsizeMode='tail'
                    numberOfLines={1}>
                    差价率: {item.spreadRate}
                </Text>
                <Text
                    style={styles.goods_total_price}
                    ellipsizeMode='tail'
                    numberOfLines={1}>
                    合计: ￥{item.heJiPrice}元
                </Text>
                <Text
                    style={styles.goods_total_quantity}
                    ellipsizeMode='tail'
                    numberOfLines={1}>
                    数量: x{item.quantity}
                </Text>
            </View>
        );
    }

    renderHeaderView() {
        return (
            <View>
                <Text style={styles.top_tip}>为保证订单准确送达，请确认收货信息</Text>
                <View style={styles.receiver_view}>
                    <Text
                        style={styles.receiver_name}>
                        收货人：{this.state.addressData.receiverName}
                        {this.state.addressData.sex === 'FEMALE'?'（女士）':'（先生）'}
                    </Text>
                    <Text
                        style={styles.receiver_phone}>
                        {this.state.addressData.mobile}
                    </Text>
                    <Text
                        style={styles.receiver_address}>
                        {this.state.addressData.areaName}
                        {this.state.addressData.smallName}
                        {this.state.addressData.addressTwo}
                    </Text>
                    <Image
                        style={styles.receiver_location_img}
                        source={require('../../img/location_yellow.png')}/>
                </View>
                <TouchableOpacity
                    style={styles.pay_view}
                    activeOpacity={0.7}
                    onPress={() => {this.setModalVisible(true)}}>
                    <Text style={styles.pay_tip}>商品货到付款：</Text>
                    <Text style={styles.pay_way}>{this.state.pay}</Text>
                    <Image
                        style={styles.pay_way_enter_img}
                        source={require('../../img/icon_arrows_right.png')}/>
                </TouchableOpacity>
            </View>
        );
    }

    renderFooterView() {
        return (
            <View>
                <View style={styles.bottom_info_item}>
                    <Text style={styles.bottom_info_name}>比价优惠</Text>
                    <Text style={styles.bottom_save_money}>省￥{this.state.orderData.offerPrice}元</Text>
                </View>
                <TouchableOpacity
                    style={styles.bottom_info_item}
                    onPress={() => this.alertInfo(1)}
                    activeOpacity={0.7}>
                    <Text style={styles.bottom_info_name}>服务费</Text>
                    <Text style={styles.bottom_info_value}>{this.state.orderData.serviceFee}元</Text>
                    <Image style={styles.bottom_info_icon} source={{uri:"http://qnm.laykj.cn/image/member_more.png"}}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.bottom_info_item}
                    activeOpacity={0.7}>
                    <Text style={styles.bottom_info_name}>另加费用</Text>
                    <Text style={styles.bottom_info_value}>{this.state.orderData.additionalFees}元</Text>
                    <Image style={styles.bottom_info_icon} source={{uri:"http://qnm.laykj.cn/image/member_more.png"}}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.bottom_info_item}
                    onPress={() => this.alertInfo(2)}
                    activeOpacity={0.7}>
                    <Text style={styles.bottom_info_name}>预计送达时间</Text>
                    <Text style={styles.bottom_info_value}>{dateToString(this.state.orderData.deliveryTime,'yyyy-MM-dd hh:mm:ss')}</Text>
                    <Image style={styles.bottom_info_icon} source={{uri:"http://qnm.laykj.cn/image/member_more.png"}}/>
                </TouchableOpacity>
                <View style={styles.bottom_info_item}>
                    <Text style={styles.remarks_input_name}>买家留言：</Text>
                    <TextInput
                        style={styles.remarks_input}
                        value={this.state.remarks}
                        onChangeText={(remarks) => this.setState({remarks})}
                        placeholder="（选填）填写您的留言内容">
                    </TextInput>
                </View>
                {this.renderPayWay()}
            </View>
        );
    }

    /**
     * 用户提示
     */
    alertInfo(type){
        //iOS和Android上都可用
        if(type === 1){
            Alert.alert(
                '服务费',
                '服务费用按照规定，不满500元，就按10元一单收费，超过500元，按照基本费用1元加上超过订单额的百分之2收费。',
                [{text: '确定'}],
                {cancelable:true}
            )
        }else {
            Alert.alert(
                '送达时间',
                '当订单数达到一定数量进行配送，或者每日有三个时间节点，分别为：11:00、13:00、16:00进行配送。',
                [{text: '确定'}],
                {cancelable:true}
            )
        }
    }

    /**
     * 支付方式选择框
     */
    renderPayWay(){
        return(
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => {this.setModalVisible(!this.state.modalVisible)}}>
                <TouchableOpacity
                    style={styles.pay_way_modal}
                    activeOpacity={1}
                    onPress={() => this.setModalVisible(!this.state.modalVisible)}>
                    <View style={styles.pay_way_content}>
                        <Text style={styles.pay_way_tip}>到货后付款方式</Text>
                        <TouchableOpacity
                            style={styles.pay_way_item}
                            onPress={() => this.onPayWaySelected('微信支付')}
                            activeOpacity={0.7}>
                            <Image style={{left:15}} source={require('../../img/icon-WeChatPay.png')}/>
                            <Text style={{position:'absolute',right:15}}>微信支付</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.pay_way_item}
                            onPress={() => this.onPayWaySelected('支付宝支付')}
                            activeOpacity={0.7}>
                            <Image style={{left:15}} source={require('../../img/icon-Alipay.png')}/>
                            <Text style={{position:'absolute',right:15}}>支付宝支付</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.pay_way_item}
                            onPress={() => this.onPayWaySelected('银联支付')}
                            activeOpacity={0.7}>
                            <Image style={{left:15}} source={require('../../img/icon-UnionPay.png')}/>
                            <Text style={{position:'absolute',right:15}}>银联支付</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.pay_way_item}
                            onPress={() => this.onPayWaySelected('现金支付')}
                            activeOpacity={0.7}>
                            <Image style={{left:15}} source={require('../../img/icon-cash.png')}/>
                            <Text style={{position:'absolute',right:15}}>现金支付</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    }

    /**
     * 支付方式选择
     */
    onPayWaySelected(way){
        this.setState({pay:way});
        this.setModalVisible(!this.state.modalVisible)
    }

    /**
     * 控制选择框的显示、隐藏
     */
    setModalVisible(visible) {
        this.setState({modalVisible:visible});
    }

    //获取默认收货地址
    getDefaultReceiveAddress(){
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
            if(responseJson.data == null || responseJson.respCode !== 'S'){
                return;
            }
            this.setState({
                addressData:responseJson.data
            })
        })
        .catch((error) =>{
            console.error(error);
        })
    }

    //获取订单信息
    getOrderInfo(){
        fetch(HTTP_REQUEST.Host + '/goods/shopCar/toOrder.do',{
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
                orderData:responseJson.data
            })
        })
        .catch((error) =>{
            console.error(error);
        })
    }

    //获取直接下单订单信息
    getDirectOrderInfo(goodsSkuId,quantity){
        fetch(HTTP_REQUEST.Host + '/goods/goods/goodsDirectOrder.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                "goodsSkuId":goodsSkuId,
                "quantity":quantity
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.data == null || responseJson.respCode !== 'S'){
                return;
            }
            this.setState({
                orderData:responseJson.data
            })
        })
        .catch((error) =>{
            console.error(error);
        })
    }

    //提交订单
    submitOrder(){
        let pay = this.state.pay;//获取支付方式
        switch (pay) {
            case "微信支付":
                pay = "WECHAT_PAY";
                break;
            case "支付宝支付":
                pay = "ALIPAY";
                break;
            case "银联支付":
                pay = "UNION_PAY";
                break;
            case "现金支付":
                pay = "CASH_PAY";
        }
        fetch(HTTP_REQUEST.Host + '/goods/order/addOrder.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                "receiveAddressId": this.state.addressData.receiveAddressId,
                "saveAmount": this.state.orderData.offerPrice,
                "serviceFee": this.state.orderData.serviceFee,
                "extraFee": this.state.orderData.additionalFees,
                "remark": this.state.remarks,
                "amount": this.state.orderData.totalPrice,
                "pay": pay,
                'goodsSkuId': this.props.navigation.state.params.goodsSkuId,
                'quantity': this.props.navigation.state.params.quantity
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode !== 'S'){
                Alert.alert(
                    '温馨提示',
                    responseJson.errorMsg+'',
                    [{text: '确定'}],
                    {cancelable:true}
                )
            }else {
                //替换路由到订单路由
                this.props.navigation.replace('AppOrderNavigator')
            }
        })
        .catch((error) =>{
            alert('服务错误，下单失败！');
        })
    }
}

const styles = StyleSheet.create({
    //顶部提示语
    top_tip: {
        width:width,
        height:40,
        textAlign:'center',
        textAlignVertical:'center',
        backgroundColor:"#EC7E2D",
        color:'white'
    },
    //收货地址栏
    receiver_view: {
        width:width,
        height:100,
        backgroundColor:'white',
    },
    receiver_name: {
        position:'absolute',
        left:50,
        top:20
    },
    receiver_phone: {
        position:'absolute',
        right:50,
        top:20
    },
    receiver_address: {
        position:'absolute',
        left:50,
        right:10,
        top:40
    },
    receiver_location_img: {
        position:'absolute',
        left:10,
        width:30,
        height:30,
        top:35,
        resizeMode:'contain'
    },
    //支付栏
    pay_view: {
        width:width,
        height:40,
        marginTop:10,
        marginBottom:10,
        backgroundColor:'white'
    },
    pay_tip: {
        height:40,
        textAlignVertical:'center',
        left:10
    },
    pay_way: {
        position:'absolute',
        height:40,
        textAlignVertical:'center',
        right:35,
        color:'#EC7E2D'
    },
    pay_way_enter_img: {
        position:'absolute',
        right:10,
        width:15,
        height:15,
        top:12.5,
        resizeMode:'contain'
    },
    //ListFoot订单信息栏
    bottom_info_item: {
        width: width,
        height:40,
        marginBottom:2,
        alignItems:'center',
        flexDirection:'row',
        backgroundColor:'white',
    },
    bottom_save_money:{
        position:'absolute',
        fontSize:16,
        right:35,
        color:'#EC7E2D'
    },
    bottom_info_name: {
        position:'absolute',
        fontSize:14,
        left:10
    },
    bottom_info_value: {
        position:'absolute',
        fontSize:16,
        right:35
    },
    bottom_info_icon: {
        position:'absolute',
        width: 15,
        height:15,
        resizeMode:'contain',
        right:10
    },
    remarks_input: {
        position:'absolute',
        left:80,
        height:40,
    },
    remarks_input_name: {
        position:'absolute',
        textAlignVertical:'center',
        height:50,
        width:100,
        fontSize:14,
        left:10
    },
    //底部确认下单栏
    submit_order_view:{
        height:50,
        flexDirection:'row',
        borderTopWidth:0.5,
        borderTopColor: '#8F8F8F'
    },
    submit_btn:{
        position: 'absolute',
        width:100,
        height:50,
        right:0,
        backgroundColor:'#FF8247',
        alignItems:'center',
        justifyContent: 'center'
    },
    submit_btn_text:{
        color:'white',
        fontSize:16
    },
    submit_total_price:{
        position: 'absolute',
        fontSize:16,
        height:50,
        right:120,
        color:'#FF8247',
        textAlignVertical:'center'
    },
    //商品信息item
    goods_info_view:{
        backgroundColor:'white',
        alignItems:'center',
        height:120,
        marginBottom:5
    },
    goods_image:{
        position: 'absolute',
        resizeMode :'contain',
        width:100,
        height:100,
        left:10,
    },
    goods_name:{
        position: 'absolute',
        left:120,
        right:45,
        top:12,
        fontSize: 16,
        fontWeight:'bold'
    },
    goods_min:{
        position: 'absolute',
        left:120,
        right:60,
        top:35,
        fontSize: 14,
    },
    goods_max:{
        position: 'absolute',
        left:120,
        right:60,
        top:55,
        fontSize: 14,
    },
    goods_spread_rate:{
        position: 'absolute',
        left:120,
        top:75,
        fontSize: 14,
        color:'#FF8247'
    },
    goods_total_price:{
        position: 'absolute',
        left:250,
        top:75,
        fontSize: 14,
    },
    goods_total_quantity:{
        position: 'absolute',
        top:50,
        right:10,
        fontSize: 14,
    },
    //支付方式弹出框
    pay_way_modal: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    pay_way_content: {
        position: 'absolute',
        alignItems:'center',
        height:height*0.3,
        width:width*0.5,
        left:width*0.25,
        top:height*0.35,
        borderRadius:5,
        backgroundColor:'#FFFFFF'
    },
    pay_way_tip:{
        width:width*0.5,
        height:height*0.05,
        textAlign:'center',
        fontSize:18,
        fontWeight:'bold',
        textAlignVertical:'center',
        marginBottom:15
    },
    pay_way_item:{
        flexDirection:'row',
        alignItems:'center',
        height:height*0.05,
        width:width*0.5,
    },
});
