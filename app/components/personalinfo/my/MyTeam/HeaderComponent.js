import React,{Component} from 'react';
import {View, Text, TouchableOpacity,StyleSheet} from 'react-native';
import {HTTP_REQUEST} from "../../../../utils/config";
import AsyncStorageUtil from "../../../../utils/AsyncStorageUtil";

export default class HeaderComponent  extends Component{

    constructor(){
        super();
        this.state={
            checkIndex:0,
            orderNumber:'',
            date:'MONTH',
            accessToken:'',
        }

    }

    componentDidMount(): void {
        if(this.props.name=='1'){
            AsyncStorageUtil.getLocalData("accessToken").then(data => {
                this.setState({
                    accessToken: data,
                }, () => {
                    this.getOrderNumber();
                });
            });
        }else if(this.props.name=='2') {
            AsyncStorageUtil.getLocalData("accessToken").then(data => {
                this.setState({
                    accessToken:data,
                }, () => {
                    this.getMemberNumber();
                });
            });
        }

    }

    render(): React.ReactNode {
        return (
            <View style={{backgroundColor:'#FFF',padding:12}}>
                <Text style={{color:'#000',fontSize:16}}>订单统计</Text>

                <View style={{alignSelf:'center',borderRadius:8,borderWidth:1,borderColor:'#FF1D1D',flexDirection:'row'}}>
                    <TouchableOpacity style={this.state.checkIndex==0?teamStyle.checkLeftBg:teamStyle.not_checkBg}
                                      onPress={()=>this.click('MONTH',0)}>
                        <Text style={this.state.checkIndex==0?teamStyle.checkTv:teamStyle.not_checkTv}>本月</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={this.state.checkIndex==1?teamStyle.checkRightBg:teamStyle.not_checkBg}
                                      onPress={()=>this.click('ALL',1)}>
                        <Text style={this.state.checkIndex==1?teamStyle.checkTv:teamStyle.not_checkTv}>全部</Text>
                    </TouchableOpacity>
                </View>

                <View style={{backgroundColor:'#D9D9D9',marginTop:15}}>
                    <View style={{flexDirection:'row'}}>
                        <View style={{flex:1,alignItems:'center',height:65,backgroundColor:'#FFF',justifyContent:'center',marginRight:0.5,marginBottom:0.5}}>
                            <Text style={teamStyle.tv_ordernumber}>{this.state.orderNumber.numberOfOrders}</Text>
                            <View style={{height:5}}/>
                            <Text style={teamStyle. tv_ordertype}>累计订单数</Text>
                        </View>
                        <View style={{flex:1,alignItems:'center',height:65,backgroundColor:'#FFF',justifyContent:'center',marginLeft:0.5,marginBottom:0.5}}>
                            <Text style={teamStyle.tv_ordernumber}>¥ {(this.state.orderNumber.totalHundredSum)/100}</Text>
                            <View style={{height:5}}/>
                            <Text style={teamStyle. tv_ordertype}>累计订单额</Text>
                        </View>
                    </View>

                    <View style={{flexDirection:'row'}}>
                        <View style={{flex:1,alignItems:'center',height:65,backgroundColor:'#FFF',justifyContent:'center',marginRight:0.5,marginTop:0.5}}>
                            <Text style={teamStyle.tv_ordernumber}>{this.props.name=='1'?this.state.orderNumber.numberOfOrderMan:this.state.orderNumber.numberOfMembers}</Text>
                            <View style={{height:5}}/>
                            <Text style={teamStyle. tv_ordertype}>{this.props.name=='1'?'合计下单员':'合计会员'}</Text>
                        </View>
                        <View style={{flex:1,alignItems:'center',height:65,backgroundColor:'#FFF',justifyContent:'center',marginLeft:0.5,marginTop:0.5}}>
                            <Text style={teamStyle.tv_ordernumber}>¥ {this.state.orderNumber.orderProfit==null?0:(this.state.orderNumber.orderProfit)/100}</Text>
                            <View style={{height:5}}/>
                            <Text style={teamStyle. tv_ordertype}>订单额返利</Text>
                        </View>
                    </View>

                </View>

            </View>
        )
    }

    click(date,i){
        this.setState({
            date:date,
            checkIndex:i,
        },()=>{
            if(this.props.name=='1'){
                this.getOrderNumber()
            }else {
                this.getMemberNumber()
            }
        })
    }


    //下单员本月和全部订单数
    getOrderNumber(){
        fetch( HTTP_REQUEST.Host+'/promoter/promoter/myTeamOrderStatistics.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                date:this.state.date
            }),
        }).then((response) => response.json())
            .then((responseJson)=>{
              //  alert("订单数量"+responseJson.respCode)
                if('S'==responseJson.respCode){
                    this.setState({
                        orderNumber:responseJson.data,
                    })
                }

            }).catch((error)=>{
        });
    }

    //会员本月和全部了订单数
    getMemberNumber(){
        fetch( HTTP_REQUEST.Host+'/promoter/promoter/memberListOrderStatistics.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                date:this.state.date,
                orderManId: this.props.orderManId
            }),
        }).then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    this.setState({
                        orderNumber:responseJson.data,
                    })
                }

            }).catch((error)=>{
        });
    }

}

const teamStyle=StyleSheet.create({

    tv_ordernumber:{
        color:'#FF1D1D',
        fontWeight: '700',
        fontSize:16,
    },

    tv_ordertype:{
        color:'#666666',
        fontSize:15,
    },

    checkTv:{
        color:'#FFF',
        fontSize:16,
    },

    not_checkTv:{
        color:'#000',
        fontSize:16
    },

    checkLeftBg:{
        backgroundColor:'#FF1D1D',
        borderBottomLeftRadius:7,
        borderTopLeftRadius:7,
        justifyContent:'center',
        alignItems:'center',
        width:100,
        height:35,
    },

    checkRightBg:{
        backgroundColor:'#FF1D1D',
        borderBottomRightRadius:7,
        borderTopRightRadius:7,
        justifyContent:'center',
        alignItems:'center',
        width:100,
        height:35,
    },

    not_checkBg:{
      //  backgroundColor:'#FFF',
        justifyContent:'center',
        alignItems:'center',
        width:100,
        height:35,
    },



})