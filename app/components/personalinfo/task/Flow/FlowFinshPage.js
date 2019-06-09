import React,{Component} from 'react';

import {View, Text, StyleSheet, Image, TouchableOpacity,Dimensions} from 'react-native';
import RefreshListView,{RefreshState} from 'react-native-refresh-list-view'
import {HTTP_REQUEST,} from "../../../../utils/config";
import Toast from "react-native-easy-toast";
import {dateToString} from '../../../../utils/dateUtil'
import asyncStorageUtil from "../../../../utils/AsyncStorageUtil";
import ListEmptyView from "../../../../views/ListEmptyView";
/**
 * 流转中心已完成
 */
export default class FlowFinshPage extends Component{

    constructor(props){
        super(props);
        this.itemlayout=this.itemlayout.bind(this);
        this.state={
            flowFinshList:[],
            page:1,
            totalPage:0,
            refreshState: RefreshState.Idle,
            accessToken:'',
        }
    }

    render(): React.ReactNode {
        return(
            <View style={{flex:1}}>
                {this._listView()}
                <Toast
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
        if(this.state.flowFinshList.length===0){
            return <ListEmptyView hint={"暂无任务"}/>
        }else {
            return (
                <RefreshListView
                    data={this.state.flowFinshList}
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

 /*   componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
        //this.Refresh();
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            },()=>{
                this.Refresh();
            });
        });
    }
*/
    Refresh(){
        fetch( HTTP_REQUEST.Host+'/procurement/procurement/getDeliverGoodsList.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
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
                        flowFinshList: responseJson.data.data,
                        refreshState: RefreshState.Idle,
                        page:2,
                        totalPage:responseJson.data.totalPage,
                    })
                }

            }).catch((error)=>{
            // alert("失败"+error)
        });
    }


    getData(){
        fetch( HTTP_REQUEST.Host+'/procurement/procurement/getDeliverGoodsList.do', {
            method: 'POST',
            headers: {
                accessToken: this.state.accessToken,
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
                        flowFinshList: [...this.state. flowFinshList, ...responseJson.data.data],
                        refreshState: RefreshState.Idle,
                        page: this.state.page+1,
                        totalPage:responseJson.data.totalPage,
                    })
                }

            }).catch((error)=>{
           // alert("失败"+error)
        });
    }


    itemlayout({item}){
        return(
            <View style={flowFinsStyle.itemlayout}>
                <Image style={{width:110,height:120,marginRight:8}} source={{uri:item.image}}/>
                <View style={{justifyContent:'space-between',width:w-138,}}>
                    <Text style={[flowFinsStyle.tv,{fontSize:18}]} numberOfLines={1} ellipsizeMode={'tail'}>社区网点:{item.communityName}</Text>
                    <Text style={[flowFinsStyle.tv,{fontSize:18}]} numberOfLines={2} ellipsizeMode={'tail'}>{item.fullName}</Text>
                    <View style={{flexDirection:'row'}}>
                        <Text style={[flowFinsStyle.tv,{marginRight:50}]}>单价 : {(item.price)/100}元</Text>
                        <Text style={flowFinsStyle.tv}>数量 : x{item.totalProcureQuantity}</Text>
                    </View>
                    <Text style={flowFinsStyle.tv}>合计 : {(item.totalPrice)/100}元</Text>

                    <Text style={flowFinsStyle.tv}>发货时间 : {this.flowOutTime(item)}</Text>
                </View>
            </View>
        )
    }

    //发货时间
    flowOutTime=(item)=>item.flowOutTime==null?'':dateToString(item.flowOutTime,'yyyy-MM-dd hh:mm:ss')

}

const w=Dimensions.get('window').width;

const flowFinsStyle=StyleSheet.create({
    itemlayout:{
        flexDirection:'row',
        paddingLeft:10,
        paddingRight:10,
        paddingTop:8,
        paddingBottom:6,
        borderBottomColor:'#D9D9D9',
        borderBottomWidth:0.5
    },

    tv:{
        fontSize:15,
        color:'#303030',
    }
})