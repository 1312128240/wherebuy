import React,{Component} from 'react';
import {
    View,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    Image,
    Text,
    TextInput,
} from 'react-native';
import asyncStorageUtil from "../utils/AsyncStorageUtil";
import {HTTP_REQUEST} from "../utils/config";
import RefreshListView, {RefreshState} from "react-native-refresh-list-view";
import Toast from "react-native-easy-toast";

const width = Dimensions.get('window').width;

/**
 * 超市搜索选择页，用户搜索超市名称。根据结果选择。
 */
export default class SuperMarketSearchPage extends Component{

    constructor(props){
        super(props);
        this.state={
            accessToken:'',
            name:'',
            address:'',
            item_data:[],
            currentPage:1,
            refreshState: RefreshState.Idle,
            totalPage:1,
        }
    }

    componentDidMount(){
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            });
        });
    }

    render(){
        return (
            <View style={{flex: 1}}>
                {this.renderInputBar()}
                <View style={addressStyle.list_line}/>
                {this.renderListView()}
                <Toast
                    ref="toast"
                    style={{backgroundColor:'gray'}}
                    position='bottom'
                    positionValue={200}
                    textStyle={{color:'white'}}/>
            </View>
        )
    }

    //头部搜索栏
    renderInputBar(){
        return(
            <View style={addressStyle.top_bar}>
                <Text style={addressStyle.top_bar_city}>深圳</Text>
                <View style={addressStyle.top_bar_search}>
                    <Image
                        style={{width: 30, height: 30}}
                        source={require('../img/search_icon.png')}/>
                    <TextInput
                        style={{width:width*0.5}}
                        onChangeText={(value) =>
                            this.setState({
                                name:value,
                                currentPage:1,
                                totalPage:1
                            },()=>{
                                this.searchAddress()
                            })
                        }
                        placeholderTextColor='#757575'
                        placeholder="请输入超市名称">
                    </TextInput>
                </View>
            </View>
        );
    }

    //数据列表View
    renderListView(){
        return(
            <RefreshListView
                data={this.state.item_data}
                keyExtractor={(item,index) => index.toString()}
                renderItem={this.renderListItem.bind(this)}
                ListEmptyComponent={
                    this.state.name !== '' ?
                        <View style={{justifyContent:'center',alignItems:'center',marginTop:30}}>
                            <Text style={{color:'#999999',fontSize:18}}>暂无结果</Text>
                        </View>
                        :
                        <View/>
                }
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
                            this.searchAddress();
                        });
                    }
                }}
                onHeaderRefresh={()=>{
                    this.setState({
                        currentPage:1,
                        refreshState: RefreshState.HeaderRefreshing,
                    },()=>{
                        this.searchAddress();
                    });
                }}
            />
        );
    }

    //数据列表Item
    renderListItem = ({item}) => (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={()=>{
                this.props.navigation.state.params.onAddressSelect(item.name,item.fullName,item.supermarketId);
                this.props.navigation.goBack()
            }}
            style={{width:width,height:60,justifyContent:'center'}}>
            <Text style={{marginLeft:10,fontSize: 17,color:'rgba(51,51,51,1)'}}>{item.name}</Text>
            <Text style={{marginLeft:10,fontSize: 16,color:'rgba(102,102,102,1)'}}>{item.fullName}</Text>
            <View style={addressStyle.list_line2}/>
        </TouchableOpacity>
    );

    //根据输入的小区关键字，返回符合条件的小区列表
    searchAddress(){
        fetch(HTTP_REQUEST.Host+'/area/Supermarket/getSupermarketByKey.do', {
            method: 'POST',
            headers: {
                'accessToken':this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body:JSON.stringify({
                "key":this.state.name,
                "pageSize":20,
                "currentPage":this.state.currentPage
            })
        })
        .then((response) => response.json())
        .then((responseJson)=>{
            if(responseJson.respCode !== 'S'){
                this.refs.toast.show(responseJson.errorMsg,1000);
                return
            }
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
        }).catch((error)=>{
            this.refs.toast.show('网络错误',1000);
        });
    }
}

const addressStyle = StyleSheet.create({
    //顶部搜索栏
    top_bar: {
        width: width,
        height: 40,
        marginTop:15,
        flexDirection: 'row',
        alignItems: 'center'
    },
    top_bar_city: {
        width:width*0.15,
        fontSize:18,
        color:'rgba(51,51,51,1)',
        textAlign: 'center'
    },
    top_bar_search: {
        position:'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        width: width*0.8,
        marginLeft: width*0.15,
        borderRadius: 35,
        backgroundColor: 'rgba(245,245,245,1)'
    },
    list_line: {
        width:width,
        height:10,
        marginTop:10,
        backgroundColor: 'rgba(245,245,245,1)'
    },
    list_line2: {
        position:'absolute',
        width:width,
        height:1,
        bottom:0,
        backgroundColor: 'rgba(245,245,245,1)'
    },
});

