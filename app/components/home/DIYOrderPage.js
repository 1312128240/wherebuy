import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    TextInput,
    Text,
    TouchableOpacity,
    FlatList, Alert
} from 'react-native';
import {HTTP_REQUEST} from "../../utils/config";
import asyncStorageUtil from "../../utils/AsyncStorageUtil";

const width = Dimensions.get('window').width;

/**
 * 自定义下单界面
 */
export default class DIYOrderPage extends Component{

    constructor(props) {
        super(props);
        this.state = {
            accessToken: "",
            name:'',
            brand:'',
            specification:'',
            brandSearchData:[],
            showBrandList:false,
        };
    }

    componentDidMount(){
        if(this.props.navigation.state.params.name != null){
            this.setState({
                name:this.props.navigation.state.params.name
            });
        }
        asyncStorageUtil.getLocalData("accessToken").then(data => {
            this.setState({
                accessToken: data,
            });
        });
    }

    render() {
        return (
            <View style={{backgroundColor:'rgba(245,245,245,1)',flex:1}}>
                <View style={{alignItems: 'center',height:180,backgroundColor:'white'}}>
                    <TextInput
                        style={styles.input}
                        value={this.state.brand}
                        onChangeText={(name) => this.getBrandList(name)}
                        placeholder="请输入品牌名">
                    </TextInput>
                    <View style={styles.view}>
                        <Text style={styles.input2}>{' '+this.state.name}</Text>
                        <TextInput
                            style={styles.input3}
                            onChangeText={(specification) => this.setState({specification})}
                            placeholder="请输入规则参数">
                        </TextInput>
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => this.submit()}
                        style={styles.diy_order_button}>
                        <Text style={styles.diy_order_button_text}>提交</Text>
                    </TouchableOpacity>
                    <FlatList
                        style={this.state.showBrandList ? styles.brand_search_list : styles.brand_search_list_hide}
                        data={this.state.brandSearchData}
                        renderItem={this.renderBrandListView.bind(this)}
                        keyExtractor={(item,index) => index.toString()}/>
                </View>
            </View>
        );
    }

    renderBrandListView({item}) {
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => this.setState({
                    brand:item.name,
                    brandSearchData:[],
                    showBrandList:false
                })}
                style={{height:30}}>
                <Text
                    numberOfLines={1}
                    style={{height:30,fontSize:16,marginLeft:5,textAlignVertical:'center'}}>
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    }

    getBrandList(name){
        this.setState({
            brand:name,
        });
        if(name === '' || name === ' '){
            this.setState({
                brandSearchData:[],
                showBrandList:false,
            });
            return;
        }
        fetch(HTTP_REQUEST.Host + '/brand/brand/searchBrand.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                "brandName":name
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode !== 'S' || responseJson.data.length === 0){
                this.setState({
                    brandSearchData:[],
                    showBrandList:false,
                });
                return;
            }
            this.setState({
                showBrandList:true,
                brandSearchData:responseJson.data
            })
        })
        .catch((error) =>{
            alert('失败 网络错误')
        })
    }

    submit(){
        if(this.state.name === '' || this.state.specification === '' || this.state.brand === ''){
            Alert.alert(
                '温馨提示',
                '请填写完整的信息',
                [{text: '确定'}],
                {cancelable: true}
            );
        }else {
            fetch(HTTP_REQUEST.Host + '/order/custom/insertMessage.do',{
                method: 'POST',
                headers: {
                    'Content-Type': HTTP_REQUEST.contentType,
                    'accessToken':this.state.accessToken
                },
                body: JSON.stringify({
                    'brandName': this.state.brand,
                    'goodsName': this.state.name,
                    'attrValue': this.state.specification
                }),
            })
            .then((response) => response.json())
            .then((responseJson) => {
                if(responseJson.respCode === 'S'){
                    Alert.alert(
                        '温馨提示',
                        '你的搜索信息已提交给系统,稍后请到待查询订单查看！',
                        [{text: '确定', onPress: () => this.props.navigation.pop()}],
                        {cancelable: false}
                    );
                }
            })
            .catch((error) =>{
                alert('失败 网络错误')
            })
        }
    }
}

const styles = StyleSheet.create({
    input: {
        width:width*0.8,
        height: 40,
        borderColor: '#ec7e2d',
        backgroundColor:'#efefef',
        borderWidth: 1,
        borderRadius:45,
        marginTop:15,
    },
    view: {
        flexDirection:'row',
        width:width*0.8,
        height: 40,
        marginTop:15,
    },
    input2: {
        position:'absolute',
        width:width*0.38,
        height: 40,
        borderColor: '#ec7e2d',
        backgroundColor:'#efefef',
        borderWidth: 1,
        borderRadius:45,
        textAlignVertical:'center',
        left:0
    },
    input3: {
        position:'absolute',
        width:width*0.38,
        height: 40,
        borderColor: '#ec7e2d',
        backgroundColor:'#efefef',
        borderWidth: 1,
        borderRadius:45,
        right:0
    },
    diy_order_button:{
        marginTop:15,
        width:90,
        height:35,
        backgroundColor:"#EC7E2D",
        borderRadius:45,
        justifyContent:"center",
        alignItems:'center',
    },
    diy_order_button_text:{
        fontSize:16,
        color:"white"
    },
    brand_search_list:{
        position:'absolute',
        height:130,
        width:width*0.8,
        top:55,
        backgroundColor:'white'
    },
    brand_search_list_hide:{
        height:0,
        width:0,
    },
});