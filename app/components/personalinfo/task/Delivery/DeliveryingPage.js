import React ,{Component} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, Dimensions} from 'react-native';
import {HTTP_REQUEST,} from "../../../../utils/config";
import RefreshListView,{RefreshState} from "react-native-refresh-list-view";
import Toast from 'react-native-easy-toast';
import asyncStorageUtil from "../../../../utils/AsyncStorageUtil";
import BaseComponent from "../../../../views/BaseComponent";
import ListEmptyView from "../../../../views/ListEmptyView";

/**
 * 配送任务进行中
 */
export  default  class DeliveryingPage extends BaseComponent{


    constructor(props){
        super(props);
        this.state={
            deliveryingList:[],
            page:1,
            totalPage:0,
            refreshState: RefreshState.Idle,
            accessToken:'',
        }
    }

    componentDidMount(): void {
        super.componentDidMount();
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            if (data === '') {
                this.props.navigation.navigate('AppAuthNavigator')
            }else {
                this.setState({
                    accessToken: data,
                },()=>{
                    this._Refresh();
                });
            }

        });
    }


    render(): React.ReactNode {
        return (
            <View style={{flex: 1,backgroundColor:'#F5F5F5'}}>
                <View style={taskStyle.titleLayout}>
                    <Text style={taskStyle.tv_title}>配送状态</Text>
                    <Text style={taskStyle.tv_title}>合计金额</Text>
                    <Text style={taskStyle.tv_title}>订单号</Text>
                </View>

                {this.listview()}


            </View>
        );
    }

    //刷新的方法
    _Refresh(){
        fetch( HTTP_REQUEST.Host+'/delivery/deliveryList.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                communityStatus: "DELIVERING",
                currentPage:1
            }),
        }).then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    this.setState({
                        deliveryingList: responseJson.data.data,
                        page:2,
                        totalPage:responseJson.data.totalPage,
                        refreshState: RefreshState.Idle,
                    })
                }
            }).catch((error)=>{

        });
    }

    //加载更多或下拉刷新
    getData(){
        fetch( HTTP_REQUEST.Host+'/delivery/deliveryList.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                communityStatus: "DELIVERING",
                currentPage: this.state.page
            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    this.setState({
                        deliveryingList: [...this.state. deliveryingList, ...responseJson.data.data],
                        refreshState: RefreshState.Idle,
                        page: this.state.page+1,
                        totalPage:responseJson.data.totalPage,
                    })
                }

            }).catch((error)=>{

        });
    }


    listview(){
        if(this.state.deliveryingList.length===0){
            return <ListEmptyView hint={"暂无任务"}/>
        }else {
            return(
                <View>
                    <RefreshListView
                        data={this.state.deliveryingList}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={this. _renderItem}
                        refreshState={this.state.refreshState}
                        showsVerticalScrollIndicator={false}
                        onHeaderRefresh={() => {
                            this.setState({
                                refreshState: RefreshState.HeaderRefreshing,
                            },()=>this._Refresh());

                        }}
                        onFooterRefresh={() => {
                            this.setState({
                                refreshState: RefreshState.FooterRefreshing
                            },()=>this.getData());
                        }}
                    />

                    <Toast  //提示
                        ref="toast"
                        style={{backgroundColor:'gray'}}
                        position='bottom'
                        positionValue={300}
                        textStyle={{color:'white'}}
                    />
                </View>
            )
        }

    }

    //列表item
    _renderItem = ({item}) => (
        <TouchableOpacity style={taskStyle.titleLayout} onPress={()=>this._jump(item.ordersId)}>
                <Text style={[taskStyle.tv_title,]}>{item.communityStatus=='PACKED'?'已装箱':'配送中'}</Text>
                <Text style={[taskStyle.tv_title,]}>{(item.amount)/100}元</Text>
                <View style={{flexDirection: 'row',alignItems: 'center',}}>
                    <Text style={taskStyle.tv_title}>{item.ordersId}</Text>
                    <Image style={{width:15,height:15}} source={{uri:'http://qnm.laykj.cn/image/member_more.png'}}/>
                </View>

        </TouchableOpacity>
    )

    //跳转到详情,返回时并回调刷新方法
    _jump(ordersId){
        let navigate=this.props.navigation.navigate;
        navigate('DeliveryDetails', {ordersId:ordersId,title:'配送详情',refresh: ()=>this._Refresh()})
    }
}


const taskStyle=StyleSheet.create({

    titleLayout:{
        flexDirection:'row',
        backgroundColor:'#FFF',
        padding:15,
        justifyContent:'space-between',
        borderBottomWidth:0.5,
        borderBottomColor:'#D9D9D9'
    },


    tv_title:{
        color:'#999999',
        fontSize:17,
    },

})