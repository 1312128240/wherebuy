import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Dimensions
} from 'react-native';

import Toast,{DURATION} from 'react-native-easy-toast'


const {width} = Dimensions.get('window');

/**
 * 修改密码
 */
export default class ChangePWDPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            oldPassWord: '',
            newPassWord: '',
            againPassWord: '',
        };
    }

    render() {
        return (
            <View style={{backgroundColor: '#F5F5F5', flex: 1}}>
                <View style={styles.input_view}>
                    <Text style={styles.input_name}>当前密码：</Text>
                    <TextInput
                        keyboardType={'numeric'}
                        maxLength={20}
                        style={styles.input}
                        secureTextEntry={true}
                        onChangeText={(result) => {
                            this.setState({
                                oldPassWord: result,
                            })
                        }}
                        placeholder="请输入当前登录密码">
                    </TextInput>
                </View>
                <View style={styles.input_view}>
                    <Text style={styles.input_name}>新密码：</Text>
                    <TextInput
                        keyboardType={'numeric'}
                        style={styles.input}
                        maxLength={20}
                        secureTextEntry={true}
                        onChangeText={(result) => {
                            this.setState({
                                newPassWord: result,
                            })
                        }}
                        placeholder="请输入新密码">
                    </TextInput>
                </View>
                <View style={styles.input_view}>
                    <Text style={styles.input_name}>确认新密码：</Text>
                    <TextInput
                        keyboardType={'numeric'}
                        style={styles.input}
                        maxLength={20}
                        secureTextEntry={true}
                        onChangeText={(result) => {
                            this.setState({
                                againPassWord: result,
                            })
                        }}
                        placeholder="再次输入新密码">
                    </TextInput>
                </View>
                <View style={styles.tip}>
                    <Text>必须是6-20个英文字母、数字或符号（除空格），且字母、数字和标点符号至少含两种。</Text>
                </View>

                <TouchableOpacity activeOpacity={0.7} style={styles.confirm_button} onPress={() => {
                    this._confirm()
                }}>
                    <Text style={styles.confirm_text}>下一步</Text>
                </TouchableOpacity>

                <Toast  //提示
                    ref="toast"
                    style={{backgroundColor: 'gray'}}
                    position='bottom'
                    positionValue={200}
                    textStyle={{color: 'white'}}
                />
            </View>
        );
    }

    _confirm() {
        if (this.state.oldPassWord == '' || this.state.oldPassWord.length < 6) {
            // alert("请输入当前密码")
            this.refs.toast.show('请输入6-20位当前密码', 1000);
            return;
        } else if (this.state.newPassWord == '' || this.state.newPassWord.length < 6) {
            this.refs.toast.show('请输入6-20位新密码', 1000);
            return;
        }

        if(!this._isPassWord(this.state.newPassWord)){
             return;
        };

         if(this.state.newPassWord!=this.state.againPassWord){
            this.refs.toast.show('确认密码和新密码不一致',1000);
            return;
        }

        alert("提交")

    }



    _isPassWord(v) {
        let numasc = 0;
        let charasc = 0;
       // let otherasc = 0;

        for (var i = 0; i < v.length; i++) {
            var asciiNumber = v.substr(i, 1).charCodeAt();
            if (asciiNumber >= 48 && asciiNumber <= 57) {
                numasc += 1;
            }
            if ((asciiNumber >= 65 && asciiNumber <= 90) || (asciiNumber >= 97 && asciiNumber <= 122)) {
                charasc += 1;
            }
          /*  if ((asciiNumber >= 33 && asciiNumber <= 47) || (asciiNumber >= 58 && asciiNumber <= 64) || (asciiNumber >= 91 && asciiNumber <= 96) || (asciiNumber >= 123 && asciiNumber <= 126)) {
                otherasc += 1;
            }*/
        }
        if (0 == numasc) {
            return this.refs.toast.show('密码必须含有数字',1000);
        } else if (0 == charasc) {
            return this.refs.toast.show('密码必须含有字母',1000);
        } /*else if (0 == otherasc) {
            return "密码必须含有特殊字符";
        }*/ else {
            return true;
        }
    }


}

const styles = StyleSheet.create({
    input_view: {
        height:50,
        backgroundColor:'#FFF',
        borderColor:'#D9D9D9',
        borderBottomWidth:0.5
    },
    input: {
        position:'absolute',
        left:130,
        height:50,
    },
    input_name: {
        position:'absolute',
        textAlignVertical:'center',
        height:50,
        width:130,
        fontSize:18,
        left:15
    },
    confirm_button: {
        width:width*0.9,
        height:45,
        left:width*0.05,
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
    tip: {
       paddingTop:10,
       paddingBottom:10,
       justifyContent:'center',
        marginLeft:15,
       width:width*0.9,
    },
});
