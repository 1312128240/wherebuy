import React,{Component} from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity
} from 'react-native';

export default class ApplySucceedModal extends Component{

    constructor(){
        super();
        this.state={
            modalVisibleSucceed:false,
        }
    }

    render() {
        let text = '已经提交至系统审核' + '\n稍后会以短信的方式通知您';
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.modalVisibleSucceed}
                onRequestClose={() => { this.setApplySucceedModal(false)}}>
                <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.6)',justifyContent: 'center',alignItems:'center'}}>
                    <View style={{width:260,backgroundColor:'#FFF',padding:10,alignItems:'center',justifyContent:'center',borderRadius:8}}>
                        <Text style={{fontWeight: '700',fontSize:17,lineHeight:30,color:'#303030'}}>提示</Text>
                        <Text style={{paddingTop:5,paddingBottom:10,textAlign:'center', color:'#999999',width:235,
                            borderBottomColor:'#D9D9D9',borderBottomWidth:0.5,lineHeight:20,}}>{text}</Text>
                        <TouchableOpacity onPress={()=>this.click()}>
                            <Text style={{color:'#EC7E2D',fontSize:17,paddingTop:10}}>确定</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }

    click(){
        this.props.navi.goBack();
        this.setApplySucceedModal(false)
    }

    setApplySucceedModal(b){
        this.setState({
            modalVisibleSucceed:b,
        })
    }
}