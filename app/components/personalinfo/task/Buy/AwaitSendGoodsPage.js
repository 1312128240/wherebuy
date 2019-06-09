import React,{Component} from 'react';

import {View, Text, Image, TouchableOpacity, StyleSheet,Dimensions} from 'react-native';
import {HTTP_REQUEST,} from "../../../../utils/config";
import RefreshListView,{RefreshState} from "react-native-refresh-list-view";
import Toast from 'react-native-easy-toast'
import asyncStorageUtil from "../../../../utils/AsyncStorageUtil";
import {dateToString} from "../../../../utils/dateUtil";
import BaseComponent from "../../../../views/BaseComponent";
import ListEmptyView from "../../../../views/ListEmptyView";



export  default class AwaitSendGoodsPage extends BaseComponent{

    constructor(props){
        super(props);
        this.itemlayout=this.itemlayout.bind(this);
        this.state={
            page:1,
            totalPage:0,
            awaitSendLists:[],
            refreshState: RefreshState.Idle,
            accessToken:'',
            isAllSelect:false,
            selectItem: [],
        }
    }

    render(): React.ReactNode {
        return (
            <View style={{flex:1}}>
                {this.listView()}

                {this.allSelectView()}

                <Toast  //提示
                    ref="toast"
                    style={{backgroundColor:'gray'}}
                    position='bottom'
                    positionValue={200}
                    textStyle={{color:'white'}}
                />

            </View>
        );
    }


    componentDidMount(): void {
        super.componentDidMount();
        this._navListener = this.props.navigation.addListener('didFocus', () => {
            asyncStorageUtil.getLocalData("accessToken").then(data=>{
                this.setState({
                    accessToken: data,
                },()=>{
                    this._Refresh();
                });
            });
        })

    }

    //刷新
    _Refresh(){
        fetch( HTTP_REQUEST.Host+'/procurement/procurement/getCommunityPros.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                currentPage:1,
                pageSize: 15,
                procureStatus: "WAIT_OUT"
            }),
        }).then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    let tempList=[];
                    for(let i=0;i<responseJson.data.data.length;i++){
                        let bean=responseJson.data.data[i];
                        bean.select=false;
                        tempList.push(bean)
                    }
                    this.setState({
                        awaitSendLists: tempList,
                        page:2,
                        totalPage:responseJson.data.totalPage,
                        refreshState: RefreshState.Idle,
                    })
                }

            }).catch((error)=>{
        });
    }

    getData(){
        fetch( HTTP_REQUEST.Host+'/procurement/procurement/getCommunityPros.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                currentPage: this.state.page,
                pageSize: 15,
                procureStatus: "WAIT_OUT"
            }),
        }).then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    this.setState({
                        awaitSendLists: [...this.state. awaitSendLists, ...responseJson.data.data],
                        refreshState: RefreshState.Idle,
                        page: this.state.page+1,
                        totalPage:responseJson.data.totalPage,
                    })
                }

            }).catch((error)=>{
        });
    }


    //底部全选布局
    allSelectView(){
        if(this.state.awaitSendLists.length>0){
            return (
                <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',padding:10}}>
                    <TouchableOpacity onPress={()=>this._allSelectItemPress()}
                                      style={awaitStyle.selectBtn}>
                        <Text style={{color:'#FFF',fontSize:16}}>{this.state.isAllSelect?'取消全选':'全选'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{width:20}}/>

                    <TouchableOpacity  style={awaitStyle.selectBtn} onPress={()=>this._bottomDeliver()}>
                        <Text style={{color:'#FFF',fontSize:16}}>发货</Text>
                    </TouchableOpacity>
                </View>
            )
        }

    }

    
    listView(){
        if(this.state.awaitSendLists.length===0){
            return <ListEmptyView hint={"暂无任务"}/>
        }else {
            return(
                <RefreshListView
                    data={this.state.awaitSendLists}
                    keyExtractor={(item, index) => index.toString()}
                    ListEmptyComponent={<ListEmptyView height={h-100} hint={"暂无任务！！"}/>}
                    renderItem={this.itemlayout}
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
            )
        }

    }

    itemlayout({item,index}){
        return(
            <View style={awaitStyle.itemlayout} >

                <TouchableOpacity onPress={()=>this._selectItemPress(item,index)}>
                    <Image style={{width:20,height:20}}
                           source={item.select?require('../../../../img/selected.png') : require('../../../../img/unselected.png')}/>
                </TouchableOpacity>


                <Image style={{width:110,height:110,marginRight:8}} source={{uri:item.goodsImage}}/>

                <View style={{justifyContent: 'space-between',width:w-158,}}>
                    <Text style={{color:'#303030',fontSize:18,width:w-270}} numberOfLines={2} ellipsizeMode={'tail'}>{item.goodsSkuName}</Text>
                    <Text style={awaitStyle.tv}>单价 : {(item.price)/100}元</Text>
                    <View style={{flexDirection: 'row',justifyContent:'space-between',width:w-170}}>
                        <Text style={awaitStyle.tv}>数量 : x{item.totalQuantity}</Text>

                        <Text style={awaitStyle.tv}>采买数量:{item.totalProcureQuantity}元</Text>
                    </View>

                    <View style={{flexDirection: 'row',justifyContent:'space-between',width:w-170}}>
                        <Text style={awaitStyle.tv}>合计 : {(item.totalPrice)/100}元</Text>
                        <Text style={awaitStyle.tv}>合计:{(item.totalProcurePrice)/100}元</Text>
                    </View>
                    <Text style={awaitStyle.tv}>采买时间:  {this.setTime(item.procureTime)}</Text>
                    <TouchableOpacity style={awaitStyle.btn} onPress={()=>this._itemDeliver(item)}>
                        <Text style={{color:'#FFF',fontSize:18}}>确认发货</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    //发货时间
    setTime=(timeStr)=>timeStr==null?"":dateToString(timeStr,'yyyy-MM-dd hh:mm:ss')


    //切换选中状态
    _selectItemPress = (item,index) => {
        if (item.select) {
            let position=this.state.selectItem.indexOf(item.procurementTaskIdList);
            this.state.selectItem.splice(position,1)
        } else {
            this.state.selectItem.push(item.procurementTaskIdList)
        }
        this.state.awaitSendLists[index].select=!item.select;
        this.setState({awaitSendLists: this.state.awaitSendLists})
    }

    //全部选中
    _allSelectItemPress=()=>{
        this.setState({
             selectItem:[],  //不管是全选还是取消全选都清空此数组
             isAllSelect:!this.state.isAllSelect
        },()=>{
            for (let i = 0; i <this.state.awaitSendLists.length ; i++) {
                 //根据全选还是取消全选改变每个状态
                 this.state.awaitSendLists[i].select=this.state.isAllSelect;
                 //如果是全选就添加进数组
                if (this.state.isAllSelect){
                    this.state.selectItem.push(this.state.awaitSendLists[i].procurementTaskIdList)
                }
            }

            this.setState({awaitSendLists: this.state.awaitSendLists})
        })

    }


    //item确认发货
    _itemDeliver(item){
        fetch( HTTP_REQUEST.Host+'/procurement/procurement/updateProcurReceiveStatus.do', {
            method: 'POST',
            headers: {
                accessToken: this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                goodsSkuId: item.goodsSkuId,
                procureTimeStr: item.procureTime,
                procurementTaskIdList: item.procurementTaskIdList
            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    //刷新页面
                    this._Refresh()
                    //跳转到下个页面
                    // this.props.navigation.navigate('taskpage3',)
                }

            }).catch((error)=>{
        });
    }

    //底部确认发货
    _bottomDeliver(){
        if(this.state.selectItem.length===0){
            this.refs.toast.show("请选择商品")
        }else {
            fetch( HTTP_REQUEST.Host+'/procurement/procurement/updateProcurReceiveStatus.do', {
                method: 'POST',
                headers: {
                    accessToken: this.state.accessToken,
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                body: JSON.stringify({
                    procurementTaskIdList:this.state.selectItem.toString()
                }),
            }).then((response) => response.json())
                .then((responseJson)=>{
                    if('S'==responseJson.respCode){
                        this._Refresh()
                    }else {
                        this.refs.toast.show("发货失败")
                    }

                }).catch((error)=>{
            });
        }

    }


}

const w=Dimensions.get('window').width;
const h=Dimensions.get('window').height;
const awaitStyle=StyleSheet.create({
    itemlayout:{
        flexDirection:'row',
        paddingLeft:10,
        paddingRight:10,
        paddingTop:10,
        paddingBottom:20,
        borderBottomWidth:1,
        borderBottomColor:'#D9D9D9',
        alignItems:'center',
    },

    tv:{
        color:'#303030',
        fontSize: 16,
    },
    btn:{
        position:'absolute',
        top:0,
        right:10,
        width:100,
        height:45,
        backgroundColor:'#EC7E2D',
        borderRadius:8,
        justifyContent:'center',
        alignItems: 'center'
    },

    selectBtn:{
        width:100,
        height:45,
        backgroundColor:'#EC7E2D',
        borderRadius:8,
        justifyContent:'center',
        alignItems: 'center'
    }
})