import React, {Component} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, Dimensions} from 'react-native';
import {HTTP_REQUEST,} from "../../../../utils/config";
import RefreshListView, {RefreshState} from 'react-native-refresh-list-view'
import {dateToString} from '../../../../utils/dateUtil';
import Toast from 'react-native-easy-toast';
import asyncStorageUtil from "../../../../utils/AsyncStorageUtil";
import BaseComponent from "../../../../views/BaseComponent";
import ListEmptyView from "../../../../views/ListEmptyView";


/**
 * 已完成的配送
 */
export default class DeliveryFinshPage extends BaseComponent{

    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            deliveryFinshList: [],
            totalPage: 0,
            refreshState: RefreshState.Idle,
            accessToken:'',
        }
    }


    render(): React.ReactNode{
        return (
            <View style={{flex: 1, backgroundColor: '#F5F5F5'}}>
                <View style={deliveryStyle.titleLayout}>
                    <Text style={deliveryStyle.tv_title}>完成时间</Text>
                    <Text style={deliveryStyle.tv_title}>合计金额</Text>
                    <Text style={deliveryStyle.tv_title}>订单号</Text>
                </View>
                {this._listView()}
            </View>
        );
    }


    componentDidMount(): void {
        super.componentDidMount();
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            },()=>{
                this._Refresh();
            });
        });
    }


    //商品列表
    _listView() {
        if(this.state.deliveryFinshList.length===0){
            return <ListEmptyView hint={"暂无任务"}/>
        }else {
            return (
                <View>
                    <RefreshListView
                        data={this.state.deliveryFinshList}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={this._renderItem}
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
                            },()=>this._getData());
                        }}
                    />

                    <Toast  //提示
                        ref="toast"
                        style={{backgroundColor: 'gray'}}
                        position='bottom'
                        positionValue={300}
                        textStyle={{color: 'white'}}
                    />
                </View>
            )
        }

    }

    _renderItem = ({item}) => (
        <TouchableOpacity style={deliveryStyle.itemLayout}
                          onPress={() => this.props.navigation.navigate('DeliveryDetails', {ordersId: item.ordersId,title:'完成配送详情'})}>

            <Text style={[deliveryStyle.tv_title,{ flex:1,}]} numberOfLines={1}
                  ellipsizeMode={'tail'}>{this._deliveryFinshTime(item)}</Text>
            <Text style={[deliveryStyle.tv_title,{ flex:1,}]} numberOfLines={1} ellipsizeMode={'tail'}>{(item.amount)/100}元</Text>
            <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                    <Text style={{color: "#999999", fontSize: 18, marginRight: 2}} numberOfLines={1}
                          ellipsizeMode={'tail'}>{item.ordersId}</Text>
                    <Image style={{width: 15, height: 15}}
                           source={{uri: 'http://192.168.0.6/image/member_info_more.png'}}/>
                </View>
            </View>

        </TouchableOpacity>
    )

    //上拉加载更多
    _getData() {
        fetch(HTTP_REQUEST.Host + '/delivery/deliveryList.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                communityStatus: "DELIVER_FINISHED",
                currentPage: this.state.page
            }),
        }).then((response) => response.json())
            .then((responseJson) => {

                if ('S' == responseJson.respCode) {
                    this.setState({
                        deliveryFinshList: [...this.state.deliveryFinshList, ...responseJson.data.data],
                        refreshState: RefreshState.Idle,
                        page: this.state.page + 1,
                        totalPage: responseJson.data.totalPage,
                    })
                }

            }).catch((error) => {

        });
    }

    //刷新
    _Refresh(){
        fetch(HTTP_REQUEST.Host + '/delivery/deliveryList.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                communityStatus: "DELIVER_FINISHED",
                currentPage: this.state.page
            }),
        }).then((response) => response.json())
            .then((responseJson) => {
                if ('S' == responseJson.respCode) {
                    this.setState({
                        deliveryFinshList:responseJson.data.data,
                        refreshState: RefreshState.Idle,
                        page:2,
                        totalPage: responseJson.data.totalPage,
                    })
                }

            }).catch((error) => {

        });
    }

    //完成时间
    _deliveryFinshTime=(item)=>item.deliveryFinishTime == null ? '' : dateToString(item.deliveryFinishTime, 'yyyy-MM-dd hh:mm:ss')
}


const deliveryStyle = StyleSheet.create({

    titleLayout: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 15,
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderBottomColor: '#D9D9D9'
    },

    tv_title: {
        color: '#999999',
        fontSize: 17,
        textAlign: 'center',
    },
    itemLayout: {
        backgroundColor: '#FFF',
        flexDirection: 'row',
        marginTop: 1,
        height: 55,
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        justifyContent: 'space-between',
        borderBottomColor: '#D9D9D9',
        borderBottomWidth: 0.5,
    },

})