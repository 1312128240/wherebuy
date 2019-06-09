import React,{Component} from 'react';

import {View, Text, Image, TouchableOpacity,StyleSheet,Dimensions} from 'react-native';
import Toast from 'react-native-easy-toast'
import RefreshListView,{RefreshState} from "react-native-refresh-list-view";
import {HTTP_REQUEST,} from "../../../../utils/config";
import asyncStorageUtil from "../../../../utils/AsyncStorageUtil";
import ListEmptyView from "../../../../views/ListEmptyView";

/**
 * 流转中心待发货
 */
export  default class FlowAwaitSendGoodsPage extends Component{

    constructor(props){
        super(props);
        this.itemlayout=this.itemlayout.bind(this);
        this.state={
            page:1,
            totalPage:0,
            flowAwaitList:[],
            refreshState: RefreshState.Idle,
            accessToken:'',
        }
    }


    render(): React.ReactNode {

        return(
            <View style={{flex:1}}>
                {this._listView()}
                <Toast  //提示
                    ref="toast"
                    style={{backgroundColor:'gray'}}
                    position='bottom'
                    positionValue={200}
                    textStyle={{color:'white'}}
                />
            </View>
        )
    }

    _listView(){
        if(this.state.flowAwaitList.length===0){
            return <ListEmptyView hint={"暂无任务"}/>
        }else {
            return (
                <RefreshListView
                    data={this.state.flowAwaitList}
                    keyExtractor={(item, index) =>index.toString()}
                    renderItem={this.itemlayout}
                    refreshState={this.state.refreshState}
                    showsVerticalScrollIndicator = {false}
                    onHeaderRefresh={()=>{
                        this.setState({
                            refreshState: RefreshState.HeaderRefreshing,
                        },()=>this.Refresh());

                    }}
                    onFooterRefresh={()=>{
                        this.setState({
                            refreshState: RefreshState.FooterRefreshing
                        },()=>this.getData());
                    }}
                />
            )
        }
    }

   /* componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            },()=>{
                this.Refresh();
            });
        });

    }*/


    componentDidMount(): void {
        this._navListener = this.props.navigation.addListener('didFocus', () => {
            asyncStorageUtil.getLocalData("accessToken").then(data=>{
                this.setState({
                    accessToken: data,
                },()=>{
                    this.Refresh();
                });
            });
        })

    }

    getData(){
        fetch( HTTP_REQUEST.Host+'/procurement/procurement/getNotDeliverGoods.do', {
            method: 'POST',
            headers: {
                accessToken:this.state. accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                currentPage: this.state.page,
                pageSize: 6
            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    this.setState({
                        flowAwaitList: [...this.state. flowAwaitList, ...responseJson.data.data],
                        refreshState: RefreshState.Idle,
                        page: this.state.page+1,
                        totalPage:responseJson.data.totalPage,
                    })
                }

            }).catch((error)=>{

        });
    }

    //刷新
    Refresh(){
        fetch( HTTP_REQUEST.Host+'/procurement/procurement/getNotDeliverGoods.do', {
            method: 'POST',
            headers: {
                accessToken:this.state. accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                currentPage:1,
                pageSize: 6
            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    this.setState({
                        flowAwaitList: responseJson.data.data,
                        refreshState: RefreshState.Idle,
                        page:2,
                        totalPage:responseJson.data.totalPage,
                    })
                }

            }).catch((error)=>{

        });
    }


    itemlayout({item}){
        return(
            <View style={flowAwaitStyle.itemlayout} >
                <Image style={{width:110,height:110,marginRight:8}} source={{uri:item.image}}/>
                <View style={{justifyContent: 'space-between',width:w-138}}>
                    <Text style={{fontSize:18,color:'#303030'}} numberOfLines={2} ellipsizeMode={'tail'}>{item.fullName}</Text>
                    <Text style={flowAwaitStyle.tv}>单价 : {(item.price)/100}元</Text>
                    <Text style={flowAwaitStyle.tv}>数量 : x{item.totalProcureQuantity}元</Text>
                    <Text style={flowAwaitStyle.tv}>合计 : {(item.totalPrice)/100}元</Text>

                    <TouchableOpacity style={flowAwaitStyle.btn} onPress={()=>this.sureDelivery(item.procurementTaskIdList)} >
                        <Text style={{color:'#FFF',fontSize:18}}>确认发货</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    //确认发货
    sureDelivery(id){
        fetch( HTTP_REQUEST.Host+'/procurement/procurement/confirmDeliverGoods.do', {
            method: 'POST',
            headers: {
                accessToken:this.state. accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                procurementTaskIdList: id
            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    this.Refresh();
                   // this.props.navigation.navigate('flowpage3')
                }

            }).catch((error)=>{

        });
    }

}

const w=Dimensions.get('window').width;

const flowAwaitStyle=StyleSheet.create({
    itemlayout:{
        flexDirection:'row',
        paddingLeft:10,
        paddingRight:10,
        paddingTop:5,
        paddingBottom:5,
        borderBottomWidth:0.5,
        borderBottomColor:'#D9D9D9'
    },
    tv:{
        color:'#303003',
        fontSize: 15,
    },
    btn:{
        position:'absolute',
        bottom:0,
        right:10,
        width:100,
        height:45,
        backgroundColor:'#EC7E2D',
        borderRadius:8,
        justifyContent:'center',
        alignItems: 'center'
    }
})