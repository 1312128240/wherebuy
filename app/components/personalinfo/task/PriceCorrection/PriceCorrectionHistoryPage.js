import React,{Component} from 'react'

import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    FlatList,
    Dimensions,
    Modal,
    TouchableWithoutFeedback
} from 'react-native'
import {HTTP_REQUEST,} from "../../../../utils/config";
import RefreshListView,{RefreshState} from "react-native-refresh-list-view";
import Toast from "react-native-easy-toast";
import {dateToString} from '../../../../utils/dateUtil'
import asyncStorageUtil from "../../../../utils/AsyncStorageUtil";
import BaseComponent from "../../../../views/BaseComponent";
/**
 * 分享价格纠错历史记录
 */

const  w=Dimensions.get('window').width;

export default class PriceCorrectionHistoryPage extends BaseComponent{

    constructor(){
        super();
        this.state={
            currentPage:1,
            fullName:'',
            lists:[],
            refreshState: RefreshState.Idle,
            totalPage:0,
            modalVisible:false,
            dataBean:'',
            accessToken:'',
        }
    }

    render(): React.ReactNode {
        return  (
            <View style={{flex:1,backgroundColor:'#F3F3F3'}}>
                {this._headerView()}
                {this._listView()}
                {this._historyModal()}
                <Toast
                    ref="toast"
                    style={{backgroundColor:'gray'}}
                    position='center'
                    positionValue={200}
                    textStyle={{color:'white'}}
                />
            </View>
        );
    }

    componentDidMount(): void {
        super.componentDidMount();
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            },()=>{
                this.Refresh();
            });
        });
    }


    //刷新数据
    Refresh(){
        fetch( HTTP_REQUEST.Host+'/correct/correct/searchgoodsname.do', {
            method: 'POST',
            headers: {
                accessToken: this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                currentPage:1,
                fullName:this.state.fullName
            }),
        }).then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    this.setState({
                        lists: responseJson.data.data,
                        refreshState: RefreshState.Idle,
                        currentPage:2,
                        totalPage:responseJson.data.totalPage,
                    })
                }

            }).catch((error)=>{
            // alert("价格纠错错误"+error)
        });
    }

    //加载更多或下拉刷新
    getData() {
        fetch( HTTP_REQUEST.Host+'/correct/correct/searchgoodsname.do', {
            method: 'POST',
            headers: {
                accessToken: this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                currentPage: this.state.currentPage,
                fullName: this.state.fullName
            }),
        }).then((response) => response.json())
            .then((responseJson)=>{

                this.setState({
                    lists: [...this.state.lists, ...responseJson.data.data],
                    refreshState: RefreshState.Idle,
                    currentPage: this.state.currentPage+1,
                    totalPage:responseJson.data.totalPage,
                })

            }).catch((error)=>{

        });
    }

    //弹窗
    _historyModal(){
        return(
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => { this._setModalVisible(false)}}
            >
                <TouchableWithoutFeedback onPress={()=>this._setModalVisible(false)}   keyboardShouldPersistTap={true}>
                    <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.6)',justifyContent:'flex-end',}}>
                        <View style={{width:w,backgroundColor:'#FFF'}}>
                            <Text style={{height:70,textAlign:'center',color:'#303030',lineHeight:70,fontSize:19}}>{this._getTitle(this.state.dataBean.status)}</Text>
                            <Text style={style.pop_tv}>价格类型: {this.state.dataBean.priceTypeForCha}</Text>
                            <Text style={style.pop_tv}>开始时间: {this.state.dataBean.strStartTime}</Text>
                            <Text style={style.pop_tv}>结束时间: {this.state.dataBean.strEndTime}</Text>
                            <Text style={style.pop_tv}>纠错价格: {(this.state.dataBean.price)/100}元</Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
         )

    }

    _headerView(){
        return(
            <View>
                <View style={style.heaerContainer}>
                    <TextInput
                        style={style.et}
                        placeholder="请输入商品名称"
                        onChangeText={(result)=>{this.setState({fullName:result})}}/>

                    <TouchableOpacity style={style.seach} onPress={()=>this.Refresh()}>
                        <Image style={{width:20,height:20}} source={{uri:'http://192.168.0.6/image/search.png'}}/>
                    </TouchableOpacity>
                </View>
            </View>

        )
    }

    _listView(){
        return (
            <RefreshListView
                data={this.state.lists}
                keyExtractor={(item,index) =>index.toString()}
                renderItem={this._renderItem}
                ListEmptyComponent={
                    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                        <Text style={{color:'#303030',fontSize:18}}>暂无记录!</Text>
                    </View>}
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

    //商品列表item
    _renderItem = ({item}) => (
        <View style={{ backgroundColor:"#FFF", padding:10,borderBottomColor:'#F5F5F5',borderBottomWidth:5,}}>
            <View style={style.item_title}>
                <Text style={{color:'#303030',}}>{dateToString(item.updateTime,'yyyy-MM-dd')}</Text>
                <Text style={{color:'#EC7E2D'}}>{this._priiceStatus(item.historyButtonType)}</Text>
            </View>

            <View style={{flexDirection: 'row',}}>
                <Image style={{width:100,height:95,marginRight:8}} source={{uri:item.goodsImage}}/>

                <View style={{width:w-130,justifyContent:'space-between'}}>
                    <Text style={{fontSize:18,color:'#000',fontWeight:'700'}} numberOfLines={2} ellipsizeMode={'tail'}>{item.fullName}</Text>

                    <View>
                        <Text style={{color:'#303030'}}>价格:{(item.price)/100}元</Text>

                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                            <Text style={{color:'#303030',width:w-220}}>超市:{item.name}</Text>

                            <TouchableOpacity
                                onPress={()=>this._next(item)}
                                style={{width:85,height:30,backgroundColor:'#EC7E2D',justifyContent:'center',alignItems:'center',borderRadius:8,}}>
                                <Text style={{color: '#FFF'}}>{this._buttonType(item.historyButtonType)}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </View>

        </View>
    )

    //控件popwindow显示与隐藏
    _setModalVisible =(visible)=>{
        this.setState({
            modalVisible: visible,
        });
    }

    //获取弹窗数据
    _getPopWindowData(correctId){
        fetch( HTTP_REQUEST.Host+'/correct/correct/historyView.do', {
            method: 'POST',
            headers: {
                accessToken: this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                correctId:correctId,
            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                this.setState({
                    dataBean: responseJson.data,
                })
            }).catch((error)=>{
            // alert("价格纠错错误"+error)
        });
    }


    //弹窗的title
    _getTitle(status){
        if(status=='RECALL'){
            return '价格已撤销';
        }else if(status=='EXPIRED'){
            return '价格已过期';
        }else if(status=='AUDIT_FAIL'){
            return '价格审核失败';
        }
    }

    //是否是使用中
    _priiceStatus(status) {
        if ('VIEW' == status) {
            return ''
        } else if ('RECALL' == status) {
            return '价格审核中'
        } else if ("CORRECT" == status) {
            return '价格使用中'
        }
    }

    //类型判断
    _buttonType(status){
        if('VIEW'==status){
            return '查看价格'
        }else if('RECALL'==status){
            return '撤销价格'
        }else if("CORRECT"==status){
            return '价格纠错'
        }/*else if("SHARE"){
            return '价格分享'
        }*/
    }

    //根据状态点击下一步
    _next(item){
        if('VIEW'==item.historyButtonType){
            this._getPopWindowData(item.correctId);
            this._setModalVisible(true)
        }else if('RECALL'==item.historyButtonType){
            this._recall(item.correctId)
        }else if("CORRECT"==item.historyButtonType){
           this.props.navigation.navigate('CorrectionAndSharePage',{title:'价格纠错'})
        }else if("SHARE"){
           this.props.navigation.navigate('CorrectionAndSharePage',{title:'价格分享'})
        }
    }


    //撤销价格
    _recall(correctId){
        fetch( HTTP_REQUEST.Host+'/correct/correct/recall.do', {
            method: 'POST',
            headers: {
                accessToken: this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                correctId:correctId
            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{
               if(responseJson.respCode=='S'){
                   this.refs.toast.show('撤销成功',1000);
                   this.Refresh();
               }else {
                   this.refs.toast.show(responseJson.errorMsg,1000);
               }
            }).catch((error)=>{
            // alert("价格纠错错误"+error)
        });
    }
}

const  style=StyleSheet.create({
    heaerContainer:{
        paddingTop:15,
        paddingBottom:15,
        paddingLeft:40,
        paddingRight:40,
        flexDirection:'row',
        backgroundColor:'#FFF',
        marginBottom:2,
        justifyContent:'center',
        alignItems:'center',
        borderTopColor:'#E3E3E3',
        borderTopWidth:1,
    },

    seach:{
        borderRadius:8,
        backgroundColor:'#EC7E2D',
        width:50,
        height:40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    et:{
        height:40,
        backgroundColor:'#F4F4F4',
        paddingLeft:8,
        flex:1,
        marginRight:15,
        borderRadius:8,
        borderColor:'#EC7E2D',
        borderWidth:1,
    },
    pop_tv:{
       height:50,
       paddingLeft:15,
       paddingRight: 15,
       justifyContent:'center',
       color:'#303030',
       fontSize:16,
       borderTopColor: '#CCCCCC',
       borderTopWidth: 0.5,
        lineHeight:50
    },

    item_title:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        borderBottomColor:"#D9D9D9",
        borderBottomWidth:0.5,
        paddingBottom: 5,
        marginBottom: 8
    }

})