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
 * 搜索页的消息直达功能
 */
export default class SearchPageJumpModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            modalVisible: this.props.visible,
        }
    }

    close() {
        this.setState({
            modalVisible: false
        });
    }

    show() {
        this.setState({
            modalVisible: true,
        });
    }

    render() {
        return (
            <Modal
                animationType="fade"
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
                <Text style={styles.modal_title}>功能直达</Text>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.modal_close_view}
                    onPress={() => {this.close()}}>
                    <Image
                        style={styles.modal_close_img}
                        source={require('../img/icon_search_jump_close.png')}/>
                </TouchableOpacity>
                <View style={styles.modal_action_view}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.modal_button_view}
                        onPress={() => {
                            this.close();
                            this.props.navigation.navigate('HomePage2')
                        }}>
                        <Image
                            style={styles.modal_button_img}
                            source={require('../img/icon_search_jump_home.png')}/>
                        <Text style={styles.modal_button_text}>首页</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.modal_button_view}
                        onPress={() => {
                            this.close();
                            this.props.navigation.navigate('MessagePage')
                        }}>
                        <Image
                            style={styles.modal_button_img}
                            source={require('../img/icon_search_jump_message.png')}/>
                        <Text style={styles.modal_button_text}>消息</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.modal_button_view}
                        onPress={() => {
                            this.close();
                            this.props.navigation.navigate('ShoppingCarPage')
                        }}>
                        <Image
                            style={styles.modal_button_img}
                            source={require('../img/icon_search_jump_Cart.png')}/>
                        <Text style={styles.modal_button_text}>购物车</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    modal_style: {
        flex: 1,
    },
    modal_content: {
        position: 'absolute',
        height:height*0.2,
        width:width,
        top:0,
        borderBottomLeftRadius:5,
        borderBottomRightRadius:5,
        backgroundColor: 'rgba(0, 0, 0, 0.65)'
    },
    modal_title:{
        fontWeight:'bold',
        fontSize:18,
        color:'white',
        marginTop:15,
        marginLeft:15
    },
    modal_close_view:{
        position: 'absolute',
        width: 30,
        height:30,
        right:15,
        top: 15
    },
    modal_close_img:{
        width: 25,
        height:25,
        resizeMode:'contain'
    },
    modal_action_view:{
        flexDirection:'row',
        justifyContent:'space-around',
        marginTop:15,
        width:width,
        height:height*0.2-40
    },
    modal_button_view:{
        height:height*0.2-40,
        alignItems:"center"
    },
    modal_button_img:{
        width: 45,
        height:45,
        resizeMode:'contain'
    },
    modal_button_text:{
        fontWeight:'bold',
        fontSize:16,
        marginTop:10,
        color:'white'
    }
});