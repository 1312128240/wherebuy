import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Image,
    TouchableOpacity
} from 'react-native';
import {HTTP_REQUEST} from "../../utils/config";
import asyncStorageUtil from "../../utils/AsyncStorageUtil";
import {dateToString} from "../../utils/dateUtil";
import RefreshListView, {RefreshState} from "react-native-refresh-list-view";

const {width} = Dimensions.get('window');

/**
 * 消息页
 */
export default class Message extends Component {

    constructor(props) {
        super(props);
        this.state = {
            accessToken:"",
            refreshState: RefreshState.Idle,
            item_data: [],
        };
    }

    componentDidMount(){
        this._navListener = this.props.navigation.addListener('didFocus', () => {
            asyncStorageUtil.getLocalData("accessToken").then(data=>{
                if(data === ''){
                    this.props.navigation.navigate('AppAuthNavigator')
                }else {
                    this.setState({
                        accessToken: data,
                    },()=>{
                        this.getMessage();
                    });
                }
            });
        });
    }

    componentWillUnmount(): void {
        this._navListener.remove();
    }

    render() {
        if(this.state.item_data.length === 0){
            return (
                <View>
                    <Text style={styles.title}>消息中心</Text>
                    <View style={{height:0.7,backgroundColor:"gray"}}/>
                    <Text style={styles.title2}>暂时没有消息!</Text>
                </View>
            );
        }else {
            return (
                <View style={{flex:1}}>
                    <Text style={styles.title}>消息中心</Text>
                    <View style={{height:0.7,backgroundColor:"gray"}}/>
                    <RefreshListView
                        data={this.state.item_data}
                        renderItem={this.renderMessageView.bind(this)}
                        keyExtractor={(item,index) => index.toString()}
                        refreshState={this.state.refreshState}
                        showsVerticalScrollIndicator = {false}
                        onHeaderRefresh={()=>{
                            this.setState({
                                refreshState: RefreshState.HeaderRefreshing,
                            },()=>{
                                this.getMessage();
                            });
                        }}
                    />
                </View>
            );
        }
    }

    renderMessageView({item}) {
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => this.messageClick(item)}
                style={styles.message_item}>
                <Image
                    style={styles.message_img}
                    source={{uri:'http://qnm.laykj.cn/image/msglogo.jpg'}}/>
                <View style={item.viewStatus === 'VIEWED' ? '' : styles.message_dot} />
                <Text
                    ellipsizeMode='tail'
                    numberOfLines={1}
                    style={styles.message_type}>
                    {(item.messageType === 'SELF_ORDER' && item.userType==='USER') ? '我的自定义下单' : '我的分享任务'}
                    {item.viewStatus === 'NOT_VIEW' ? '(待查看)' : ''}
                </Text>
                <Text
                    ellipsizeMode='tail'
                    numberOfLines={2}
                    style={styles.message_title}>
                    {item.title}
                </Text>
                <Text
                    style={styles.message_time}>
                    {dateToString(item.createTime,'MM-dd hh:mm')}
                </Text>
            </TouchableOpacity>
        );
    }

    messageClick(item){
        if (item.viewStatus === 'NOT_VIEW') {
            this.changeMsgStatus(item)
        }else {
            if(item.messageType === 'SELF_ORDER' && item.userType === 'USER'){
                //跳转待查询订单页
                this.props.navigation.navigate('OrderListPage2')
            }else {
                //跳转信息分享页面
                this.props.navigation.navigate('InformationShare')
            }
        }
    }

    //改变消息状态，变为已查看
    changeMsgStatus(item){
        fetch(HTTP_REQUEST.Host + '/order/custom/updateMessageStatus.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                messageId: item.messageId,
                viewStatus: item.viewStatus
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {})
        .catch((error) =>{});
        //直接跳转
        if(item.messageType === 'SELF_ORDER' && item.userType === 'USER'){
            //跳转待查询订单页
            this.props.navigation.navigate('OrderListPage2')
        }else {
            //跳转信息分享页面
            this.props.navigation.navigate('InformationShare')
        }
    }

    //获取消息数据
    getMessage(){
        fetch(HTTP_REQUEST.Host + '/order/custom/message.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({}),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode === 'S'){
                this.setState({
                    refreshState: RefreshState.Idle,
                    item_data:responseJson.data,
                });
            }else {
                this.setState({
                    refreshState: RefreshState.Idle,
                    item_data:[]
                });
            }
        })
        .catch((error) =>{
            alert('网络错误');
        })
    }
}

const styles = StyleSheet.create({
    title:{
        width:width,
        height:50,
        fontSize:20,
        textAlign:'center',
        textAlignVertical:'center',
    },
    title2:{
        width:width,
        height:50,
        fontSize:18,
        textAlign:'center',
        textAlignVertical:'center',
    },
    message_item: {
        borderTopWidth: 0,
        borderBottomWidth: 0.5,
        borderBottomColor: 'grey',
        alignItems:'center',
        height:90,
    },
    message_img: {
        position:'absolute',
        resizeMode:'contain',
        width: 70,
        height: 70,
        left:10,
        top:10,
    },
    message_dot: {
        position:'absolute',
        height:10,
        width:10,
        left:80,
        top:10,
        borderRadius:90,
        backgroundColor:'red'
    },
    message_type: {
        position:'absolute',
        fontSize:16,
        left:90,
        top:10,
        color:'black'
    },
    message_title: {
        position:'absolute',
        fontSize:14,
        left:90,
        right:10,
        top:40
    },
    message_time: {
        position:'absolute',
        fontSize:14,
        right:10,
        top:10
    },
});
