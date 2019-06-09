import React, { Component } from 'react';
import {
    View,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Image,
    Text,
    Dimensions, FlatList
} from 'react-native';
import {HTTP_REQUEST,GET_PRICE_LIST} from "../utils/config";

const {width,height} = Dimensions.get('window');

/**
 * 超市比价、价格排行弹窗
 */
export default class PriceRankingModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            accessToken:'',
            modalVisible:this.props.visible,
            supermarketPriceList:[],
            spreadRate:'',
            lookGoodsName:'',
            lookGoodsImg:'',
        }
    }

    close() {
        this.setState({
            modalVisible: false
        });
    }

    show(name,goodsSkuId,img,accessToken) {
        this.setState({
            modalVisible: true,
            accessToken: accessToken,
            lookGoodsName:name,
            lookGoodsImg:img
        },()=>{
            this.getOtherPrice(goodsSkuId);
        });
    }

    render() {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => this.close()}>
                <View
                    style={styles.other_price_modal_style}>
                    {this.renderDialog()}
                </View>
            </Modal>
        );
    }

    renderDialog() {
        return (
            <View style={styles.other_price_modal_content}>
                <Text style={styles.other_price_title}>附近超市比价</Text>
                <TouchableOpacity
                    style={{position:'absolute',right:10,top:10}}
                    onPress={() => this.close()}>
                    <Image style={{width:25,height:25}} source={require('../img/icon_close.png')}/>
                </TouchableOpacity>
                <Image
                    source={{uri:this.state.lookGoodsImg}}
                    style={styles.other_price_img}/>
                <Text
                    ellipsizeMode='tail'
                    numberOfLines={2 }
                    style={styles.other_price_goods_name}>
                    {this.state.lookGoodsName}
                </Text>
                <Text style={styles.other_price_spread_rate}>最高价差率</Text>
                <Text style={styles.other_price_spread_rate2}>{this.state.spreadRate}%</Text>
                <FlatList
                    style={styles.other_price_list}
                    data={this.state.supermarketPriceList}
                    renderItem={this.renderSupermarketPriceList.bind(this)}
                    keyExtractor={(item,index) => index.toString()}/>
            </View>
        )
    }

    renderSupermarketPriceList({item}) {
        return (
            <View style={{height:30,flexDirection:'row'}}>
                <Text ellipsizeMode='tail'
                      numberOfLines={1}
                      style={{flex:2}}>{item.supermarketName}</Text>
                <Text style={{flex:1.5}}>
                    {item.price === -1 ? '无货/无价格' : this.Fen2Yuan(item.price)+'元'}
                </Text>
            </View>
        );
    }

    //分转元
    Fen2Yuan(num){
        if (typeof num !== "number" || isNaN(num)) return null;
        return (num / 100).toFixed(2);
    }

    //获取其他超市价格 价差率
    getOtherPrice(goodsSkuId){
        fetch(HTTP_REQUEST.Host + GET_PRICE_LIST,{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({
                "goodsSkuId":goodsSkuId,
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode === 'S'){
                this.setState({
                    spreadRate:responseJson.data.spreadRate,
                    supermarketPriceList:responseJson.data.supermarketGoodsList
                });
            }
        })
        .catch((error) =>{})
    }
}

const styles = StyleSheet.create({
    other_price_modal_style: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    other_price_modal_content: {
        position: 'absolute',
        height:height*0.4,
        width:width*0.9,
        left:width*0.05,
        top:height*0.3,
        borderRadius:5,
        backgroundColor:'#FFFFFF'
    },
    other_price_title: {
        marginTop:10,
        marginLeft:10,
        fontSize: 18,
        fontWeight:'bold'
    },
    other_price_img:{
        width:80,
        height:90,
        marginTop:10,
        marginLeft:10,
    },
    other_price_goods_name:{
        position:'absolute',
        fontSize: 16,
        marginTop:50,
        marginLeft:100,
        marginRight:10,
        fontWeight:'bold'
    },
    other_price_spread_rate:{
        marginTop:10,
        marginLeft:10,
        fontSize: 14,
    },
    other_price_spread_rate2:{
        marginTop:10,
        marginLeft:20,
        fontSize:18,
        fontWeight:'bold',
        color:'#FF8247'
    },
    other_price_list:{
        position:'absolute',
        marginTop:100,
        marginLeft:100,
        marginRight:5,
        height:height*0.4-100,
        width:width*0.9-105
    },
});