import React,{Component} from 'react';
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import RefreshListView, {RefreshState} from "react-native-refresh-list-view";
import asyncStorageUtil from "../../../../utils/AsyncStorageUtil";
import {HTTP_REQUEST} from "../../../../utils/config";
import Toast from "react-native-easy-toast";
import {dateToString} from "../../../../utils/dateUtil";

const {width} = Dimensions.get('window');

/**
 * 信息分享页
 */
export default class InformationSharePage extends Component{

    constructor(props) {
        super(props);
        this.state = {
            accessToken:"",
            refreshState: RefreshState.Idle,
            item_data: [],
            currentPage:1,
            totalPage:1,
        };
    }

    componentDidMount(){
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            },()=>{
                this.getMessage();
            });
        });
    }

    render(){
        if(this.state.item_data.length === 0){
            return (
                <View>
                    <Text style={styles.title_no_date}>暂无内容</Text>
                </View>
            );
        }else {
            return (
                <View style={{backgroundColor:'rgba(245,245,245,1)',flex:1}}>
                    <RefreshListView
                        data={this.state.item_data}
                        keyExtractor={(item,index) => index.toString()}
                        renderItem={this.renderView.bind(this)}
                        refreshState={this.state.refreshState}
                        showsVerticalScrollIndicator = {false}
                        onFooterRefresh={()=>{
                            if(this.state.currentPage >= this.state.totalPage){
                                this.refs.toast.show('全部加载完毕',1000);
                            }else {
                                let current = this.state.currentPage;
                                this.setState({
                                    currentPage: current+1,
                                    refreshState: RefreshState.FooterRefreshing
                                },()=> {
                                    this.getMessage();
                                });
                            }
                        }}
                        onHeaderRefresh={()=>{
                            this.setState({
                                currentPage:1,
                                refreshState: RefreshState.HeaderRefreshing,
                            },()=>{
                                this.getMessage();
                            });
                        }}
                    />
                    <Toast
                        ref="toast"
                        style={{backgroundColor:'gray'}}
                        position='bottom'
                        positionValue={200}
                        textStyle={{color:'white'}}
                    />
                </View>
            );
        }
    }

    renderView({item,index}) {
        if(item.status === 'WAIT_DEAL'){
            return (
                <View style={styles.list_view2}>
                    <Text style={styles.list_time}>{dateToString(item.createTime,'yyyy/MM/dd')}</Text>
                    <Text style={styles.list_state}>等待处理</Text>
                    <View style={styles.list_line}/>
                    <Text style={styles.list_goods_info}>{item.brandName} {item.goodsName} {item.attrValue}</Text>
                    <Text style={styles.list_tip}>温馨提示：请尽快处理此信息分享任务</Text>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => this.btnAction(1,index)}
                        style={styles.list_btn_to_share}>
                        <Text style={{fontSize:14,color:"white"}}>去分享价格</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => this.btnAction(2,index)}
                        style={styles.list_btn_have_price}>
                        <Text style={{fontSize:14,color:"white"}}>有价格</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => this.btnAction(3,index)}
                        style={styles.list_btn_no_price}>
                        <Text style={{fontSize:14,color:"#EC7E2D"}}>暂无价格</Text>
                    </TouchableOpacity>
                </View>
            );
        }else {
            return (
                <View style={styles.list_view}>
                    <Text style={styles.list_time}>{dateToString(item.createTime,'yyyy/MM/dd')}</Text>
                    <Text style={styles.list_state}>已处理</Text>
                    <View style={styles.list_line}/>
                    <Text style={styles.list_goods_info}>{item.brandName} {item.goodsName} {item.attrValue}</Text>
                    <Text style={styles.list_tip}>温馨提示：已完成此信息分享任务</Text>
                </View>
            );
        }
    }

    btnAction(btnNo,dataIndex){
        //无价格按钮
        if(btnNo === 3){
            fetch(HTTP_REQUEST.Host + '/order/custom/handleCustomOrder.do',{
                method: 'POST',
                headers: {
                    'Content-Type': HTTP_REQUEST.contentType,
                    'accessToken':this.state.accessToken
                },
                body: JSON.stringify({
                    'messageId': this.state.item_data[dataIndex].messageId,
                    'selfOrderId': this.state.item_data[dataIndex].selfOrderId,
                    'priceNum': '无'
                }),
            })
            .then((response) => response.json())
            .then((responseJson) => {
                if(responseJson.respCode === 'S'){
                    let changeData = this.state.item_data;
                    changeData[dataIndex].status = "SUCCESS";
                    this.setState({
                        item_data:changeData
                    });
                }else {
                    this.refs.toast.show('操作失败 '+responseJson.errorMsg,1000);
                }
            })
            .catch((error) =>{
                this.refs.toast.show('网络错误 操作失败',1000);
            })
        }
        //有价格
        if(btnNo === 2){
            fetch(HTTP_REQUEST.Host + '/order/custom/handleCustomOrder.do',{
                method: 'POST',
                headers: {
                    'Content-Type': HTTP_REQUEST.contentType,
                    'accessToken':this.state.accessToken
                },
                body: JSON.stringify({
                    'messageId': this.state.item_data[dataIndex].messageId,
                    'selfOrderId': this.state.item_data[dataIndex].selfOrderId,
                    'priceNum': '有'
                }),
            })
            .then((response) => response.json())
            .then((responseJson) => {
                if(responseJson.respCode === 'S'){
                    let changeData = this.state.item_data;
                    changeData[dataIndex].status = "SUCCESS";
                    this.setState({
                        item_data:changeData
                    });
                }else {
                    this.refs.toast.show('操作失败 '+responseJson.errorMsg,1000);
                }
            })
            .catch((error) =>{
                this.refs.toast.show('网络错误 操作失败',1000);
            })
        }
        //分享跳转按钮
        if(btnNo === 1){
            this.props.navigation.navigate('PriceCorrectionPage')
        }
    }

    //获取消息数据
    getMessage(){
        fetch(HTTP_REQUEST.Host + '/order/custom/selfOrderMessage.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                "currentPage":this.state.currentPage
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode === 'S'){
                if(this.state.currentPage === 1){
                    this.setState({
                        item_data:responseJson.data.data,
                        refreshState: RefreshState.Idle,
                        totalPage:responseJson.data.totalPage,
                    });
                }else {
                    let data = responseJson.data.data;
                    let stateData = this.state.item_data;
                    let newData = stateData.concat(data);
                    this.setState({
                        item_data:newData,
                        refreshState: RefreshState.Idle,
                        totalPage:responseJson.data.totalPage
                    })
                }
            }else {
                this.setState({
                    refreshState: RefreshState.Idle,
                });
            }
        })
        .catch((error) =>{
            this.refs.toast.show('网络错误',1000);
        })
    }
}

const styles = StyleSheet.create({
    title_no_date:{
        width:width,
        fontSize:18,
        textAlign:'center',
        textAlignVertical:'center',
        marginTop:30
    },
    //列表样式
    list_view:{
        height:100,
        width:width*0.95,
        backgroundColor:'white',
        borderRadius:5,
        marginLeft:width*0.025,
        marginTop:10
    },
    list_view2:{
        height:150,
        width:width*0.95,
        backgroundColor:'white',
        borderRadius:5,
        marginLeft:width*0.025,
        marginTop:10
    },
    list_time:{
        fontSize:14,
        marginTop:10,
        marginLeft:10
    },
    list_state:{
        position:'absolute',
        color:'#EC7E2D',
        fontSize:14,
        top:10,
        right:10
    },
    list_line:{
        width:width*0.95,
        height: 0.7,
        backgroundColor:'#D9D9D9',
        marginTop:5
    },
    list_goods_info:{
        fontSize:18,
        fontWeight:'bold',
        color:'#333333',
        marginTop:5,
        marginLeft:10
    },
    list_tip:{
        fontSize:14,
        marginTop:5,
        marginLeft:10
    },
    list_btn_no_price:{
        position: 'absolute',
        bottom:10,
        width:90,
        height:28,
        right:210,
        borderColor:'#EC7E2D',
        borderWidth:0.5,
        borderRadius:5,
        justifyContent:"center",
        alignItems:'center'
    },
    list_btn_have_price:{
        position: 'absolute',
        bottom:10,
        width:90,
        height:28,
        right:110,
        backgroundColor:"#EC7E2D",
        borderRadius:5,
        justifyContent:"center",
        alignItems:'center'
    },
    list_btn_to_share:{
        position: 'absolute',
        bottom:10,
        width:90,
        height:28,
        right:10,
        backgroundColor:"#EC7E2D",
        borderRadius:5,
        justifyContent:"center",
        alignItems:'center'
    },
});