import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  TouchableOpacity
} from 'react-native';
import {HTTP_REQUEST} from "../../../utils/config";
import AsyncStorageUtil from '../../../utils/AsyncStorageUtil';
import Toast from 'react-native-easy-toast'

const {width} = Dimensions.get('window');

/**
 * 我的去哪买/推广商/下单员首页
 */
export default class MyWhereBuyMainPage extends Component{

    constructor(props) {
        super(props);
        this.state = {
            dataBean:'',
            accessToken:'',
        };
    }

    componentDidMount(): void {
        this._navListener = this.props.navigation.addListener('didFocus', () => {
            AsyncStorageUtil.getLocalData("accessToken").then(data => {
                this.setState({
                    accessToken: data,
                }, () => {
                    this.getData();
                });
            })
        })
    }

    render() {
        return (
            <View>
                <View style={styles.top_view}>
                   <Image style={styles.head_img} source={{uri:this.state.dataBean.headImage}}/>
                   <Text style={styles.total}>总成交额</Text>
                   <Text style={styles.money}>¥ {(this.state.dataBean.homePageIncome)/100}</Text>
                   <View style={styles.data_view}>
                     <View style={[styles.gridView1,{width:this._identityStyle()}]}>
                       <Text style={[styles.data_view_text,{fontWeight:'700', fontSize:16,}]}>{this.state.dataBean.numberOfOrders}</Text>
                       <Text style={styles.data_view_text}>本月订单</Text>
                     </View>
                     <View style={[styles.gridView2,{width:this._identityStyle()}]}>
                         <Text style={[styles.data_view_text,{fontWeight:'700', fontSize:16,}]}>¥ {(this.state.dataBean.totalHundredSum)/100}</Text>
                         <Text style={styles.data_view_text}>本月成交额</Text>
                     </View>
                     <View style={[styles.gridView3,{width:this._identityStyle()}]}>
                         <Text style={[styles.data_view_text,{fontWeight:'700', fontSize:16,}]}>{this.state.dataBean.numberOfMembers}</Text>
                         <Text style={styles.data_view_text}>会员数量</Text>
                     </View>
                      {this._isShowOrderView()}
                    </View>
                    <Text style={styles.tv_identity}>{this._identity1()}</Text>
                </View>
                <View style={{flexDirection:'row',alignItems:'center',paddingLeft: 10}}>
                    <Image style={{width:21,height:21}} source={require('../../../img/tgs.png')}/>
                    <Text style={styles.my_role}>{this._identity2()}</Text>
                </View>
                <TouchableOpacity onPress={()=>this.props.navigation.goBack()} style={{position:'absolute',left:15,top:20}}>
                    <Image style={{width:25,height:25, resizeMode:'contain',}} source={require('../../../img/white_back.png')}/>
                </TouchableOpacity>
                <View style={styles.menu_view}>
                    <TouchableOpacity
                        style={styles.menu_item}
                        activeOpacity={0.7}
                        onPress={() =>this.props.navigation.navigate('InviteVIPPhone')}>
                        <Image style={styles.menu_item_img} source={require('../../../img/p_icon_1.png')}/>
                        <Text style={styles.menu_item_text}>邀请好友</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menu_item}
                        activeOpacity={0.7}
                        onPress={() => this.props.navigation.navigate('HelpOrderPage')}>
                        <Image style={styles.menu_item_img} source={require('../../../img/p_icon_2.png')}/>
                        <Text style={styles.menu_item_text}>代顾客下单</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>this._myTeam()}
                        style={styles.menu_item}
                        activeOpacity={0.7}>
                        <Image style={styles.menu_item_img} source={require('../../../img/p_icon_3.png')}/>
                        <Text style={styles.menu_item_text}>我的团队</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>this.refs.toast.show('功能暂未开放')}
                        style={styles.menu_item}
                        activeOpacity={0.7}>
                        <Image style={styles.menu_item_img} source={require('../../../img/p_icon_4.png')}/>
                        <Text style={styles.menu_item_text}>帮助与客服</Text>
                    </TouchableOpacity>
                </View>
                <Toast
                    ref="toast"
                    style={{backgroundColor: 'gray'}}
                    position='bottom'
                    positionValue={200}
                    textStyle={{color: 'white'}}
                />
            </View>
        );
    }

    getData(){
        fetch(HTTP_REQUEST.Host +'/promoter/promoter/promoterIndex.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({}),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode === 'S'){
                this.setState({
                    dataBean:responseJson.data
                })
            }
        }).catch((error) =>{})
    }

    //身份判断1
    _identity1(){
        if(this.state.dataBean.identity === "PROMOTER"){
            return "推广商"
        }else if(this.state.dataBean.identity === "COMMUNITY") {
            return "服务商"
        }else if(this.state.dataBean.identity === 'ORDER_MAN'){
            return "家庭服务师"
        }
    }

    //身份判断2
    _identity2(){
        if(this.state.dataBean.identity === "PROMOTER"){
            return "我是推广商"
        }else if(this.state.dataBean.identity === "COMMUNITY") {
            return "我是服务商"
        }else if(this.state.dataBean.identity === 'ORDER_MAN') {
            return "我是家庭服务师"
        }
    }

    //根据身份选择不同样式
    _identityStyle(){
        if(this.state.dataBean.identity === "PROMOTER" || this.state.dataBean.identity === "COMMUNITY"){
            return width/4;
        }else {
            return width/3;
        }
    }

    //我的团队
    _myTeam=()=>{
        if(this.state.dataBean.identity === "PROMOTER"||this.state.dataBean.identity === 'COMMUNITY'){ //推广商
            this.props.navigation.navigate('MyTeamPartOrderPage')
        }else if(this.state.dataBean.identity === "ORDER_MAN"){
            this.props.navigation.navigate('MyTeamMemberPage',{orderManId:this.state.dataBean.orderManId})
        }
    };

    //如果是下单员则不显示下单员数
    _isShowOrderView(){
        if(this.state.dataBean.identity === "PROMOTER"||this.state.dataBean.identity === 'COMMUNITY'){
            return (
                <View style={styles.gridView4}>
                    <Text style={[styles.data_view_text,{fontWeight:'700', fontSize:16,}]}>{this.state.dataBean.numberOfOrderMan}</Text>
                    <Text style={styles.data_view_text}>下单员数</Text>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    top_view: {
        height:250,
        backgroundColor:'#FF2E2E',
        paddingBottom:50
    },
    head_img: {
        width: 70,
        height:70,
        marginTop:20,
        marginLeft:(width/2)-35,
        borderRadius:90
    },
    total: {
        position: 'absolute',
        top:100,
        width:width,
        textAlign:'center',
        fontSize:18,
        color:"white",
        fontWeight:'bold',
    },
    money: {
        position: 'absolute',
        top:120,
        width:width,
        textAlign:'center',
        fontSize:40,
        color:"white",
        fontWeight:'bold'
    },
    data_view: {
        position:'absolute',
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems:"center",
        width:width,
        height:40,
        bottom:20,
    },
    data_view_text:{
        color:'white',

    },
    my_role:{
        height:40,
        left:10,
        textAlignVertical:'center',
        fontSize:16,
        color:'#303030',
        fontWeight:'500'
    },
    menu_view: {
        height: 90,
        flexDirection: 'row',
        justifyContent:'space-around',
        backgroundColor:'white',
        borderTopColor:'#D9D9D9',
        borderBottomColor:'#D9D9D9',
        borderTopWidth:0.5,
        borderBottomWidth:0.5,
    },
    menu_item:{
        height: 90,
        width:width/4,
        alignItems:'center',
        justifyContent:'center',
        borderRightColor:'#D9D9D9',
        borderRightWidth: 0.5,
    },
    menu_item_img:{
        width: 30,
        height: 30,
    },
    menu_item_text:{
        marginTop:5,
        color:'#595959'
    },
    tv_identity:{
        lineHeight:21,
        paddingLeft:6,
        paddingRight:6,
        color:'#FFF',
        textAlign:'center',
        backgroundColor:'#FFB11A',
        borderRadius:5,
        position:'absolute',
        right:10,
        top:20,
    },
    gridView1:{
        height:40,
        alignItems:"center",
        justifyContent:'center',
    },
     gridView2:{
         height:40,
         alignItems:"center",
         justifyContent:'center',
         borderColor:'white',
         borderRightWidth:1,
         borderLeftWidth:1
     },
     gridView3:{
         height:40,
         alignItems:"center",
         justifyContent:'center',
     },
    gridView4:{
        height:40,
        width:width/4,
        alignItems:"center",
        justifyContent:'center',
        borderLeftWidth:1,
        borderLeftColor:'#FFF'
    }
});
