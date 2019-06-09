import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Toast from "react-native-easy-toast";

const {width} = Dimensions.get('window');

/**
 * 修改手机号
 */
export default class ChangePhoneNumPage extends Component{

    constructor(props) {
        super(props);
        this.state = {
            phoneNumber:'',
        };
    }

    render() {
        return (
            <View>

                <View style={{height:50,backgroundColor:'#F5F5F5',paddingLeft:20,justifyContent: 'center'}}>
                    <Text style={{fontSize:18}}>请输入手机号</Text>
                </View>

                <View style={styles.input_view}>
                    <Text style={styles.input_name}>国家地区：</Text>
                    <Text style={styles.input_name2}>中国大陆+86</Text>
                </View>
                <View style={styles.input_view}>
                    <Text style={styles.input_name}>手机号码：</Text>
                    <TextInput
                        maxLength={11}
                        keyboardType="numeric"
                        style={styles.input}
                        onChangeText={(phone) =>{
                            this.setState({
                                phoneNumber:phone,
                            })
                        }}
                        placeholder="请输入您的手机号码">
                    </TextInput>
                </View>
                <TouchableOpacity activeOpacity={0.7} style={styles.confirm_button} onPress={()=>this.isPoneAvailable(this.state.phoneNumber)}>
                    <Text style={styles.confirm_text}>下一步</Text>
                </TouchableOpacity>

                <Toast  //提示
                    ref="toast"
                    style={{backgroundColor:'gray'}}
                    position='bottom'
                    positionValue={200}
                    textStyle={{color:'white'}}
                />
            </View>
        );
    }


    /**
     * 验证是否为手机号
     * @param {*} str
     */
    isPoneAvailable(str) {
        let myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if (str.length == 0 || str == null) {
            this.refs.toast.show('请输入正确的手机号码',1000);
           // return false;
        } else if (!myreg.test(str)) {
            this.refs.toast.show('请输入正确的手机号码',1000);
           // return false;
        } else {
           // return true;
            this.props.navigation.navigate('ChangePhoneNumPage2',);
        }
    }
}

const styles = StyleSheet.create({

    input_view: {
        backgroundColor:'#FFF',
        height:50,
        borderColor:'#D9D9D9',
        borderBottomWidth:0.5
    },

    input: {
        position:'absolute',
        left:100,
        height:50,
    },

    input_name: {
        position:'absolute',
        textAlignVertical:'center',
        height:50,
        width:100,
        fontSize:18,
        left:20
    },
    input_name2: {
        position:'absolute',
        textAlignVertical:'center',
        height:50,
        fontSize:18,
        left:100
    },
    confirm_button: {
        width:width*0.9,
        height:45,
        left:width*0.05,
        marginTop:20,
        marginBottom:40,
        backgroundColor:"#EC7E2D",
        borderRadius:5,
        justifyContent:"center",
        alignItems:'center'
    },
    confirm_text: {
        fontSize:16,
        color:"white"
    },
});
