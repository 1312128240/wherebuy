import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Image,
} from 'react-native';
import asyncStorageUtil from "../../../../utils/AsyncStorageUtil";
import {HTTP_REQUEST} from "../../../../utils/config";
import RefreshListView,{RefreshState} from "react-native-refresh-list-view";
import Toast from "react-native-easy-toast";

const {width} = Dimensions.get('window');

/**
 * 代顾客下单
 */
export default class HelpOrderPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            monthSelected:true,
            accessToken:'',
            statisticalOrderData:{},
            addressData:[],
            currentPage:1,
            refreshState: RefreshState.Idle,
            totalPage:0,
        };
    }

    componentDidMount(){
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            },()=>{
                this.getStatisticalOrder();
                this.getCustomerAddressList();
            });
        });
    }

    componentWillMount() {
        this.props.navigation.setParams({addCustomerAddr: this.addCustomerAddr});
    }

    /**
     * 设置导航栏
     */
    static navigationOptions = ({ navigation }) => {
        const {params} = navigation.state;
        return {
            headerTitle:"代顾客下单",
            headerTitleStyle: {flex:1, textAlign:'center'},
            headerRight: (
                <TouchableOpacity onPress={() => params.addCustomerAddr()}>
                    <Image
                        style={{width:20,height:20,right:10}}
                        source={require('../../../../img/add2.png')}/>
                </TouchableOpacity>
            ),
        }
    };

    //type:1 新增顾客地址
    addCustomerAddr = () => {
        this.props.navigation.navigate('AddCustomerAddrPage', {
            update: () => {
                this.getStatisticalOrder();
                this.getCustomerAddressList();
            },
        })
    };

    //type:2 修改顾客地址
    modificationCustomerAddr = (receiveAddressId) => {
        this.props.navigation.navigate('ModificationCustomerAddrPage', {
            update: () => {
                this.getStatisticalOrder();
                this.getCustomerAddressList();
            },
            receiveAddressId:receiveAddressId,
        })
    };

    changeDate(monthSelect){
        this.setState({
            monthSelected:monthSelect
        },()=>{
            this.getStatisticalOrder();
        });
    }

    render() {
        return (
            <View style={{flex:1,backgroundColor:'#F5F5F5'}}>
                <View style={{backgroundColor:'white',marginTop:10,marginBottom: 10}}>
                    <Text style={styles.order_title}>订单统计</Text>
                    <View style={{width:width,height:40,alignItems: 'center'}}>
                        <View style={{width:width*0.5,height:40,flexDirection:'row'}}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={()=> this.changeDate(true)}
                                style={this.state.monthSelected ? styles.order_month_view_selected : styles.order_month_view}>
                                <Text style={this.state.monthSelected ? {fontSize:18,color:'white'} : {fontSize:18}}>本月</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={()=> this.changeDate(false)}
                                style={this.state.monthSelected ? styles.order_all_view : styles.order_all_view_selected}>
                                <Text style={this.state.monthSelected ? {fontSize:18} : {fontSize:18,color:'white'}}>全部</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{width:width,height:150,marginTop: 15}}>
                        <View style={{width:width,height:70,flexDirection:'row'}}>
                            <View style={{width:width*0.5,height:75,alignItems:'center',justifyContent:'center',borderColor:'grey',borderRightWidth:0.5,borderBottomWidth:0.5}}>
                                <Text style={{fontSize:16,color:'red'}}>{this.state.statisticalOrderData.numberOfOrders}</Text>
                                <Text style={{fontSize:16}}>累计订单数</Text>
                            </View>
                            <View style={{width:width*0.5,height:75,alignItems:'center',justifyContent:'center',borderColor:'grey',borderBottomWidth:0.5}}>
                                <Text style={{fontSize:16,color:'red'}}>￥{(this.state.statisticalOrderData.totalSum)/100}</Text>
                                <Text style={{fontSize:16}}>累计订单额</Text>
                            </View>
                        </View>
                        <View style={{width:width,height:70,flexDirection:'row'}}>
                            <View style={{width:width*0.5,height:75,alignItems:'center',justifyContent:'center',borderColor:'grey',borderRightWidth:0.5}}>
                                <Text style={{fontSize:16,color:'red'}}>{this.state.statisticalOrderData.numberOfMembers}</Text>
                                <Text style={{fontSize:16}}>合计客户</Text>
                            </View>
                            <View style={{width:width*0.5,height:75,alignItems:'center',justifyContent:'center'}}>
                                <Text style={{fontSize:16,color:'red'}}>￥0</Text>
                                <Text style={{fontSize:16}}>订单额返利</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <RefreshListView
                    data={this.state.addressData}
                    keyExtractor={(item,index) => index.toString()}
                    renderItem={this.renderListItem.bind(this)}
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
                                this.getCustomerAddressList();
                            });
                        }
                    }}
                    onHeaderRefresh={()=>{
                        this.setState({
                            currentPage:1,
                            refreshState: RefreshState.HeaderRefreshing,
                        },()=>{
                            this.getCustomerAddressList();
                        });
                    }}/>
                <Toast
                    ref="toast"
                    style={{backgroundColor: 'gray'}}
                    position='bottom'
                    positionValue={200}
                    textStyle={{color: 'white'}}/>
            </View>
        );
    }

    renderListItem({item}){
        return(
            <TouchableOpacity
                activeOpacity={0.7}
                style={{width:width,height:150,backgroundColor:'white',marginBottom:10}}
                onPress={()=> this.modificationCustomerAddr(item.receiveAddressId)}>
                <Text
                    style={{position:'absolute', left:10, top:10,fontSize:16,fontWeight:'bold'}}>
                    {item.receiverName}
                    {item.sex === 'FEMALE'?'（女士）':'（先生）'}
                </Text>
                <Text style={{position:'absolute', right:50, top:10,fontSize:16,fontWeight:'bold'}}>{item.mobile}</Text>
                <Text style={{position:'absolute', left:10,right:10, top:35}}>{item.addressTwo}</Text>
                <Text style={{position:'absolute', left:10, top:70,fontSize:14}}>累计下单数: {item.numberOfOrders}</Text>
                <Text style={{position:'absolute', right:50, top:70,fontSize:14}}>累计下单金额: {(item.totalSum)/100}</Text>
                <View style={{position:'absolute',width:width,height:50,bottom:0,flexDirection:'row',borderColor:'grey',borderTopWidth:0.5}}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={()=>this.props.navigation.navigate('MyTeamOrderListPage',{memberId:null,receiveAddressId:item.receiveAddressId})}
                        style={{width:width*0.5,height:60,alignItems:'center',flexDirection:'row',justifyContent:'center',borderColor:'grey',borderRightWidth:0.5}}>
                        <Image
                            style={{height:15,width:15,resizeMode: 'contain'}}
                            source={require('../../../../img/icon_order_record.png')}/>
                        <Text style={{fontSize:16,marginLeft: 5}}>订单记录</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={()=> this.helpCustomerUpOrder(item.receiveAddressId)}
                        style={{width:width*0.5,height:65,alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
                        <Image
                            style={{height:15,width:15,resizeMode: 'contain'}}
                            source={require('../../../../img/icon_place_an_order.png')}/>
                        <Text style={{fontSize:16,marginLeft: 5}}>下单</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        )
    }

    //获取订单统计信息
    getStatisticalOrder(){
        fetch(HTTP_REQUEST.Host + '/promoter/promoter/statisticalOrder.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                'date':this.state.monthSelected ? 'MONTH' : 'ALL',
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode === 'S'){
                this.setState({
                    statisticalOrderData:responseJson.data,
                });
            }
        })
        .catch((error) =>{
            console.error(error);
        })
    }

    //获取顾客地址信息
    getCustomerAddressList(){
        fetch(HTTP_REQUEST.Host + '/promoter/promoter/customerAddressList.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                "currentPage":this.state.currentPage,
                "pageSize":10
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode === 'S'){
                if(this.state.currentPage === 1){
                    this.setState({
                        addressData:responseJson.data.data,
                        refreshState: RefreshState.Idle,
                        totalPage:responseJson.data.totalPage,
                    });
                }else {
                    let data = responseJson.data.data;
                    let stateData = this.state.addressData;
                    let newData = stateData.concat(data);
                    this.setState({
                        addressData:newData,
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
            console.error(error);
        })
    }

    //设置收货地址（帮顾客下单）
    helpCustomerUpOrder(receiveAddressId){
        fetch(HTTP_REQUEST.Host + '/promoter/promoter/helpCustomerUpOrder.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({"receiveAddressId":receiveAddressId}),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode === 'S'){
                this.props.navigation.navigate('HomePage2');
            }else {
                this.refs.toast.show(responseJson.errorMsg,1000);
            }
        })
        .catch((error) =>{
            this.refs.toast.show('发生错误，跳转失败',1000);
        })
    }
}

const styles = StyleSheet.create({
    //订单统计模块
    order_title: {
        marginLeft:10,
        marginTop:10,
        marginBottom:10,
        fontSize:18
    },
    order_month_view:{
        width:width*0.25,
        height:40,
        alignItems:'center',
        justifyContent:'center',
        borderTopLeftRadius:15,
        borderBottomLeftRadius:15,
        borderWidth:0.5,
        borderColor:'red'
    },
    order_all_view:{
        width:width*0.25,
        height:40,
        alignItems:'center',
        justifyContent:'center',
        borderTopRightRadius:15,
        borderBottomRightRadius:15,
        borderWidth:0.5,
        borderColor:'red'
    },
    order_month_view_selected:{
        width:width*0.25,
        height:40,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'red',
        borderTopLeftRadius:15,
        borderBottomLeftRadius:15,
    },
    order_all_view_selected:{
        width:width*0.25,
        height:40,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'red',
        borderTopRightRadius:15,
        borderBottomRightRadius:15,
    },
});
