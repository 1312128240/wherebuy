import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    Modal,
} from 'react-native';
import {RadioGroup, RadioButton} from 'react-native-flexi-radio-button'
import BaseComponent from "../../../views/BaseComponent";

const  w=Dimensions.get('window').width;
const h=Dimensions.get('window').height;
/**
 * 注销账户
 */
export default class UnsubscribePage extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            result:'需要解绑手机',
            modalVisible:true,
        };
    }

    render() {
        return (

            <View style={styles.parent}>

                    <Text style={{color:'#303030',fontSize: 16}}>请选择注销原因</Text>

                    <RadioGroup
                        style={{width:w-30,marginTop:15,}}
                        selectedIndex={0}
                        color='#EC7E2D'
                        onSelect = {(index, value) => this.setState({esult:index+value,})}
                    >

                        <RadioButton value={'需要解绑手机'} style={styles.radioButton} >
                            <Text>需要解绑手机</Text>
                        </RadioButton>

                        <RadioButton value={'需要解绑邮箱'} style={styles.radioButton}>
                            <Text>需要解绑邮箱</Text>
                        </RadioButton>

                        <RadioButton value={'安全/隐私顾虑'} style={styles.radioButton}>
                            <Text>安全/隐私顾虑</Text>
                        </RadioButton>

                        <RadioButton value={'安全/这是多余的账户'} style={styles.radioButton}>
                            <Text>安全/这是多余的账户</Text>
                        </RadioButton>

                        <RadioButton value={'无法需该会员名'} style={styles.radioButton}>
                            <Text>无法需该会员名</Text>
                        </RadioButton>

                        <RadioButton value={'其它'} style={styles.radioButton}>
                            <Text>其它</Text>
                        </RadioButton>
                    </RadioGroup>


                    <TouchableOpacity onPress={()=>this._commit()}>
                        <View style={styles.button}>
                            <Text style={{color:'white'}}>确定注销</Text>
                        </View>
                    </TouchableOpacity>


                {this._unsubscribeModal()}
            </View>
        );
    }

    //弹窗
    _unsubscribeModal(){
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => { this.setModalVisible(false)}}
            >
                <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.6)',padding:40,alignItems:'center',justifyContent:'center',}}>
                    <View style={{width:320,borderRadius:8,alignItems:'center',backgroundColor:'#FFF',}}>
                        <View>
                            <Text style={{fontSize:18,color:'#000',fontWeight:'700',padding:20,textAlign:'center'}}>账户注销确定</Text>

                            <Text style={{color:'#303030',textAlign:'center'}}>账户注销后,你已完成的交易将无法处理售后</Text>

                            <View style={{height:50,borderTopColor:'#D9D9D9',marginTop:20,borderTopWidth:0.5,flexDirection:'row',}}>

                                <TouchableOpacity onPress={()=>this.props.navigation.goBack()}>
                                    <Text style={[styles.tv_diss,{borderRightColor:'#D9D9D9',borderRightWidth:0.5}]}>暂不注销</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={()=>this.setModalVisible(false)}>
                                    <Text style={styles.tv_diss}>确定继续注销</Text>
                                </TouchableOpacity>

                            </View>

                        </View>
                    </View>
                </View>

            </Modal>
        )
    }

    //控件显示与隐藏
    setModalVisible(visible) {
        this.setState({ modalVisible: visible });
    }

    //最后提交
    _commit=()=>{
      //  alert(this.state.result)
    }


}

const styles = StyleSheet.create({

    parent:{
        flex:1,
        backgroundColor:'#F5F5F5',
      //  alignItems: 'center',
        padding:15,
    },

     modalContainer:{
         borderRadius: 10,
         alignItems: 'center',
         backgroundColor: '#fff',
         padding: 20
     },

    button:{
        width:w-30,
        height:50,
        marginTop:10,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#EC7E2D',
        borderRadius:8,
    },

    radioButton:{
        height:50,
      //  justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#FFF',
        borderColor:'#D9D9D9',
        borderWidth:0.5,
        borderRadius:8,
        marginTop: 10,
    },

    tv_diss:{
        flex:1,
        color:'#EC7E2D',
       // backgroundColor:"#fa3314",
        textAlign:'center',
        textAlignVertical: 'center',
        height:50,
        width:160,
    }
});