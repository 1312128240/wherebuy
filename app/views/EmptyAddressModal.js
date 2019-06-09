import React,{Component} from 'react';
import {View, Text, TouchableOpacity, StyleSheet,Dimensions, Modal} from 'react-native';

export default class EmptyAddressModal extends Component{

    constructor(props){
        super(props);
        this.state={
            addressVisible:false,
            navis:props.params,
        }
    }

    render(): React.ReactNode {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.addressVisible}
                onRequestClose={() =>this.setAddressModal(true)}>
                <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent: 'center',alignItems:'center'}}>
                    <View style={styles.modalView}>
                        <Text style={{fontSize:18,paddingTop:30,color:'#333333'}}>温馨提示</Text>
                        <Text style={{paddingTop:15,paddingBottom:20,color:'#303030'}}>您没有设置默认收货地址!</Text>
                        <TouchableOpacity style={styles.addressModalBtn} onPress={()=>this.goAddressPage()}>
                            <Text style={{color:'#FC9153',fontSize:18}}>去设置</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    setAddressModal(b){
        this.setState({
            addressVisible:b,
        })
    }

    //去选择地址
    goAddressPage(){
        this.setAddressModal(false);
        this.state.navis.navigate('MyAddressPage');
    }

}
const width=Dimensions.get('window').width;


const styles=StyleSheet.create({

    modalView:{
        width:width-140,
        borderRadius:3,
        backgroundColor:'#FFF',
        alignItems:'center',
    },

    addressModalBtn:{
        height:55,
        width:width-140,
        alignItems:'center',
        justifyContent:'center',
        borderTopColor:'#D9D9D9',
        borderTopWidth:0.5
    }
})