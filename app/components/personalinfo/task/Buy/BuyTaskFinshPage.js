import React ,{Component} from 'react';
import {View, Text, StyleSheet,Image,Dimensions} from 'react-native';
import RefreshListView,{RefreshState} from "react-native-refresh-list-view";
import {HTTP_REQUEST} from "../../../../utils/config";
import Toast from 'react-native-easy-toast'
import {dateToString} from '../../../../utils/dateUtil'
import asyncStorageUtil from "../../../../utils/AsyncStorageUtil";
import BaseComponent from "../../../../views/BaseComponent";
import ListEmptyView from "../../../../views/ListEmptyView";


export  default class  BuyTaskFinshPage extends BaseComponent{

    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            refreshState: RefreshState.Idle,
            taskFinshList: [],
            totalPage: 0,
            accessToken:'',
        }
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



    render(): React.ReactNode {

        return (
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
        if(this.state.taskFinshList.length===0){
            return <ListEmptyView hint={"暂无任务"}/>
        }else {
            return (
                <RefreshListView
                    data={this.state.taskFinshList}
                    keyExtractor={(item, index) => index.toString()}
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
                procureStatus: "FINISHED"
            }),
        }).then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    this.setState({
                        taskFinshList: responseJson.data.data,
                        refreshState: RefreshState.Idle,
                        page:2,
                        totalPage:responseJson.data.totalPage,
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
                procureStatus: "FINISHED"
            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    this.setState({
                        taskFinshList: [...this.state. taskFinshList, ...responseJson.data.data],
                        refreshState: RefreshState.Idle,
                        page: this.state.page+1,
                        totalPage:responseJson.data.totalPage,
                    })
                }

            }).catch((error)=>{
           // alert("失败"+error)
        });
    }


    itemlayout({item}) {
        return (
            <View style={taskFinshStyle.itemlayout}>
                <Image style={{width: 115, height: 125,marginRight:8}} source={{uri:item.goodsImage}}/>

                <View style={{justifyContent:'space-between',width:w-143}}>
                    <Text style={{color:'#303030',fontSize: 18}} numberOfLines={2} ellipsizeMode={'tail'}>{item.goodsSkuName}</Text>
                    <Text style={taskFinshStyle.tv}>单价 : {(item.price) / 100}元</Text>
                    <View style={{flexDirection: 'row',justifyContent:'space-between',width:w-160}}>
                        <Text style={[taskFinshStyle.tv,]}>数量 : x{item.totalQuantity}</Text>
                        <Text style={taskFinshStyle.tv}>采买数量:{item.totalProcureQuantity}</Text>
                    </View>
                    <View style={{flexDirection: 'row',justifyContent:'space-between',width:w-160}}>
                        <Text style={[taskFinshStyle.tv,]}>合计 : {(item.totalPrice) / 100}元</Text>
                        <Text style={taskFinshStyle.tv}>合计:{(item.totalProcurePrice)/100}元</Text>
                    </View>

                    <Text style={taskFinshStyle.tv}>发货时间:  {item.procureOutTime==null?'':dateToString(item.procureOutTime,'yyyy-MM-dd hh:mm:ss')}</Text>
                </View>
            </View>
        )
    }

}

const  w=Dimensions.get('window').width;
const  h=Dimensions.get('window').height;

const taskFinshStyle=StyleSheet.create({

    itemlayout:{
        flexDirection:'row',
        paddingLeft:10,
        paddingRight: 10,
        paddingTop:5,
        paddingBottom: 5,
        borderBottomColor: '#D9D9D9',
        borderBottomWidth: 1
    },

    tv:{
        color:'#303030',
        fontSize:16
    }
})