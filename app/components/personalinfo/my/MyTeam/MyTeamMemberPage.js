import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native'
import HeaderComponent from './HeaderComponent'
import RefreshListView,{RefreshState} from 'react-native-refresh-list-view'
import {HTTP_REQUEST} from "../../../../utils/config";
import AsyncStorageUtil from "../../../../utils/AsyncStorageUtil";
import Toast  from 'react-native-easy-toast'
import BaseComponent from "../../../../views/BaseComponent";

export default class MyTeamMemberPage extends BaseComponent{

    constructor(props){
        super(props);
        this.state={
            accessToken:'',
            currentPage:1,
            totalPage:0,
            lists:[],
            orderManId:props.navigation.state.params.orderManId,
        }
    }

    componentDidMount(): void {
        super.componentDidMount();
        AsyncStorageUtil.getLocalData("accessToken").then(data => {
            this.setState({
                accessToken: data,
            }, () => {
                this.Refresh();
            });
        });
    }

    render(): React.ReactNode {
        return (
            <View style={{flex:1,backgroundColor:'#F4F3F1'}}>
                <RefreshListView
                    data={this.state.lists}
                    keyExtractor={(item, index) =>index.toString()}
                    showsVerticalScrollIndicator = {false}
                    renderItem={this._renderItem}
                    refreshState={this.state.refreshState}
                    ListEmptyComponent={
                        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                            <Text>暂无数据!</Text>
                        </View>}
                    ListHeaderComponent={this.header()}
                    onHeaderRefresh={()=>{
                        this.setState({
                            refreshState: RefreshState.HeaderRefreshing,
                        },()=>{
                            this.Refresh();
                        });
                    }}
                    onFooterRefresh={()=>{
                        this.setState({
                            refreshState: RefreshState.FooterRefreshing
                        },()=>{
                            this.LoadMore();
                        });
                    }}
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

    header(){
        return (
            <View>
                <HeaderComponent name={'2'} orderManId={this.state.orderManId}/>
                <View style={{flexDirection: 'row',backgroundColor:'#FFF',marginTop:5,marginBottom:1,height:36,alignItems:'center'}}>
                    <View style={{width:2,height:15,marginLeft:10,marginRight:8,backgroundColor:'#fa3314'}}/>
                    <Text style={{fontSize:15,color:'#303030'}}>会员列表</Text>
                </View>
            </View>
        )
    }

    Refresh(){
        fetch( HTTP_REQUEST.Host+'/promoter/promoter/memberList.do', {
            method: 'POST',
            headers: {
                'accessToken':this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                currentPage: 1,
                orderManId:this.state.orderManId,
                pageSize: 8
            }),
        })
        .then((response) => response.json())
        .then((responseJson)=>{
            if(responseJson.respCode=='S'){
                this.setState({
                    lists:responseJson.data.data,
                    refreshState: RefreshState.Idle,
                    currentPage:2,
                    totalPage:responseJson.data.totalPage,
                })
            }
        }).catch((error)=>{});
    }

    //加载或者下拉更多
    LoadMore(){
        fetch( HTTP_REQUEST.Host+'/promoter/promoter/memberList.do', {
            method: 'POST',
            headers: {
                'accessToken':this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                currentPage:this.state.currentPage,
                pageSize: 8

            }),
        })
        .then((response) => response.json())
        .then((responseJson)=>{
            if(responseJson.respCode=='S'){
                this.setState({
                    lists: [...this.state.lists, ...responseJson.data.data],
                    refreshState: RefreshState.Idle,
                    currentPage: this.state.currentPage+1,
                    totalPage:responseJson.data.totalPage,
                })
            }
        }).catch((error)=>{});
    }

    _renderItem = ({item}) => (
        <View style={teamStyle.itemlayout}>
            <Image style={{width:65,height:65,marginRight:10,borderRadius:90,borderColor:"#D9D9D9",borderWidth: 0.5}} source={{uri:item.headImage}}/>
            <View style={{flex:1,marginRight:120,}}>
                <Text style={{color:'#000',fontWeight: '700',}}>{item.nickname}</Text>
                <Text>加入时间: 2019-03-23 18:08</Text>
                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                    <Text>合计订单: {item.numberOfOrders}单</Text>
                    <Text>总金额: ¥{(item.totalSum)/100} </Text>
                </View>
            </View>
            <TouchableOpacity
                style={teamStyle.orderList}
                onPress={()=>this.props.navigation.navigate('MyTeamOrderListPage',{memberId:item.memberId,receiveAddressId:null})}>
                <Text style={{color:'#FF1D1D'}}>订单列表</Text>
            </TouchableOpacity>
        </View>
    );
}


const teamStyle=StyleSheet.create({
    itemlayout:{
        backgroundColor:'#FFF',
        flexDirection:'row',
        alignItems:'center',
        borderBottomColor:'#F4F3F1',
        borderBottomWidth:0.5,
        padding:10,
    },
    orderList:{
        position:'absolute',
        borderColor:'#FF1D1D',
        borderWidth:1,
        borderRadius:3,
        right:20,
        top:13,
        width:75,
        height:25,
        justifyContent:'center',
        alignItems: 'center',
    }
});