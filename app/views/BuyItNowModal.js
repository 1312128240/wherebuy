import React, { Component } from 'react';
import {
    View,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Image,
    Text,
    Dimensions
} from 'react-native';

const {width,height} = Dimensions.get('window');

/**
 * 立即购买弹窗
 */
export default class BuyItNowModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            modalVisible: this.props.visible,
            buyNowItemData:{},
            buyNowNum:1,
        }
    }

    close() {
        this.setState({modalVisible: false});
    }

    show(item) {
        this.setState({
            modalVisible: true,
            buyNowItemData:item,
            buyNowNum:1,
        });
    }

    render() {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => this.close()}>
                <TouchableOpacity
                    style={styles.modal_style}
                    activeOpacity={1}
                    onPress={() => this.close()}>
                    {this.renderDialog()}
                </TouchableOpacity>
            </Modal>
        );
    }

    renderDialog() {
        return (
            <View style={styles.modal_content}>
                <Image source={{uri:this.state.buyNowItemData.image}} style={styles.buy_now_img}/>
                <Text
                    style={styles.buy_now_name}
                    ellipsizeMode='tail'
                    numberOfLines={2}>
                    {this.state.buyNowItemData.fullName}
                </Text>
                <Text
                    style={styles.buy_now_attr}
                    ellipsizeMode='tail'
                    numberOfLines={1}>
                    规格：
                    {(this.state.buyNowItemData.attrValues === 'null' || this.state.buyNowItemData.attrValues === '')
                    ? '' :
                    this.state.buyNowItemData.attrValues}
                </Text>
                <Text style={styles.buy_now_spread_rate}>价差率：{this.state.buyNowItemData.spreadRate}%</Text>
                <View style={styles.buy_now_num_view}>
                    <Text style={styles.buy_now_price}>￥{this.Fen2Yuan(this.state.buyNowItemData.minPrice)}</Text>
                    <TouchableOpacity
                        style={styles.buy_now_num_reduce}
                        onPress={() => this.changeBuyNowNum('reduce')}>
                        <Image style={{width:25,height:25}} source={require('../img/reduce.png')}/>
                    </TouchableOpacity>
                    <Text style={styles.buy_now_num}>{this.state.buyNowNum}
                    </Text>
                    <TouchableOpacity
                        style={styles.buy_now_num_add}
                        onPress={() => this.changeBuyNowNum('add')}>
                        <Image style={{width:25,height:25}} source={require('../img/add.png')}/>
                    </TouchableOpacity>
                </View>
                <View style={styles.add_shopping_car_view}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.add_shopping_car_button}
                        onPress={() =>
                            this.props.addShopCar(this.state.buyNowItemData.goodsSkuId,this.state.buyNowNum)
                        }>
                        <Text style={{fontSize:17,color:"#EC7E2D"}}>加入购物车</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.but_now_button}
                        onPress={() => {
                            this.close();
                            this.props.navigation.navigate('ConfirmOrder', {
                                goodsSkuId: this.state.buyNowItemData.goodsSkuId,
                                quantity: this.state.buyNowNum
                            })
                        }}>
                        <Text style={{fontSize:17,color:"white"}}>直接购买</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    changeBuyNowNum(type){
        let num = this.state.buyNowNum;
        if(type === 'reduce'){
            if(num > 1){
                this.setState({
                    buyNowNum:num-1,
                })
            }
        }else {
            this.setState({
                buyNowNum:num+1,
            })
        }
    }

    //分转元
    Fen2Yuan(num){
        if (typeof num !== "number" || isNaN(num)) return null;
        return (num / 100).toFixed(2);
    }
}

const styles = StyleSheet.create({
    modal_style: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modal_content: {
        position: 'absolute',
        height:height*0.3,
        width:width,
        bottom:0,
        borderRadius:5,
        backgroundColor:'#FFFFFF'
    },
    buy_now_img:{
        position:'absolute',
        width:120,
        height:100,
        left:10,
        top:10
    },
    buy_now_name:{
        marginLeft:140,
        marginRight:10,
        marginTop:12,
        fontSize: 16,
        fontWeight:'bold'
    },
    buy_now_attr:{
        marginLeft:140,
        marginRight:10,
        marginTop:5,
        fontSize: 14
    },
    buy_now_spread_rate:{
        marginLeft:140,
        marginTop:5,
        fontSize: 14,
        color:'#EC7E2D'
    },
    buy_now_num_view:{
        flexDirection:'row',
        marginLeft:140,
        marginTop:5,
        alignItems:'center'
    },
    buy_now_price:{
        fontWeight:'bold',
        fontSize: 16
    },
    buy_now_num_reduce:{
        position: 'absolute',
        alignItems:'center',
        justifyContent:'center',
        width:35,
        height:35,
        right:100
    },
    buy_now_num_add:{
        position: 'absolute',
        alignItems:'center',
        justifyContent:'center',
        width:35,
        height:35,
        right:10
    },
    buy_now_num:{
        position: 'absolute',
        width:35,
        right:55,
        fontSize: 16,
        textAlign: 'center'
    },
    add_shopping_car_view:{
        position: 'absolute',
        width:width,
        height:45,
        bottom:15,
        flexDirection:'row',
        justifyContent:"center",
        alignItems:'center'
    },
    add_shopping_car_button:{
        width:width*0.35,
        height:45,
        borderColor:"#EC7E2D",
        borderWidth:1,
        borderTopLeftRadius:35,
        borderBottomLeftRadius:35,
        justifyContent:"center",
        alignItems:'center'
    },
    but_now_button:{
        width:width*0.35,
        height:45,
        backgroundColor:"#EC7E2D",
        borderTopRightRadius:35,
        borderBottomRightRadius:35,
        justifyContent:"center",
        alignItems:'center'
    },
});