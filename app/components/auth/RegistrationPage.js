import React, {Component} from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    View,
    Dimensions,
    TouchableOpacity
} from 'react-native';
import {HTTP_REQUEST,getValidCode} from '../../utils/config'
import Toast from 'react-native-easy-toast'

const {width} = Dimensions.get('window');

/**
 * 注册页面、创建账号
 */
export default class RegistrationPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user_name: '',
            message_code:'',
            get_code_btn:'获取验证码',
            new_pwd:'',
            confirm_pwd:'',
            wait:false,//发送验证码后，不能点击
        };
    }

    //退出登录需要把定时器清理
    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }

    render() {
        return (
            <View style={{alignItems:"center",flex:1}}>
                <Image style={styles.logo_img} source={{uri:'http://qnm.laykj.cn/image/login-logo.png'}}/>
                <View style={styles.user_name_view}>
                    <Text style={styles.user_name_86}>+86</Text>
                    <TextInput
                        ref={'InputText_Phone'}
                        keyboardType={'numeric'}
                        style={styles.input}
                        onChangeText={(user_name) => this.setState({user_name})}
                        placeholder="请输入您的手机号">
                    </TextInput>
                </View>
                <View style={styles.code_view}>
                    <Image
                        style={styles.code_img}
                        source={{uri:"http://qnm.laykj.cn/image/login-sms.png"}}
                    />
                    <TextInput
                        keyboardType={'numeric'}
                        style={styles.input}
                        onChangeText={(message_code) => this.setState({message_code})}
                        placeholder="请输入短信验证码">
                    </TextInput>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => this.getCode()}
                        style={styles.get_code_btn}>
                        <Text style={{color: 'white'}}>{this.state.get_code_btn}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.code_view}>
                    <Image
                        style={styles.code_img}
                        source={{uri:"http://qnm.laykj.cn/image/login-pwa.png"}}
                    />
                    <TextInput
                        style={styles.input}
                        secureTextEntry={true}
                        onChangeText={(new_pwd) => this.setState({new_pwd})}
                        placeholder="密码由6-20英文字母、数字组成">
                    </TextInput>
                </View>
                <View style={styles.confirm_pwd_view}>
                    <Image
                        style={styles.code_img}
                        source={{uri:"http://qnm.laykj.cn/image/login-paw.png"}}
                    />
                    <TextInput
                        style={styles.input}
                        secureTextEntry={true}
                        onChangeText={(confirm_pwd) => this.setState({confirm_pwd})}
                        placeholder="请再次填写密码">
                    </TextInput>
                </View>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => this.confirm()}
                    style={styles.confirm_button}>
                    <Text style={styles.confirm_text}>创建账号</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => this.props.navigation.navigate('LoginPage')}
                    style={styles.to_login_view}>
                    <Text style={styles.to_login_text}>已有账号？去登录</Text>
                </TouchableOpacity>
                <Toast
                    ref="toast"
                    style={{backgroundColor:'gray'}}
                    position='bottom'
                    positionValue={300}
                    textStyle={{color:'white'}}/>
            </View>
        );
    }

    //验证手机号码
    checkMobile() {
        const reg = /^((1[3-9][0-9])+\d{8})$/;
        return reg.test(this.state.user_name)
    }

    // 验证密码
    checkPassword(key) {
        const reg = /^(?=.*?[A-Za-z])(?=.*\d)[A-Za-z\d_@\$\*\.]{6,20}$/;
        return reg.test(key)
    }

    //获取验证码
    getCode(){
        this.refs.InputText_Phone.blur();
        if(this.state.wait){
            return;
        }
        if(this.state.user_name === ''){
            this.refs.toast.show('请输入手机号码！',1000);
            return;
        }
        if(!this.checkMobile()){
            this.refs.toast.show('手机号码格式不正确！',1000);
            return;
        }
        this.setState({
            wait:true,
        });
        this.getValidCode();
    }

    /**
     * 验证码发送成功后，重新发送需要等待120s
     */
    setWait(){
        let time = 120;
        this.timer = setInterval(() => {
            if(time <= 0){
                this.setState({
                    get_code_btn:'获取验证码',
                    wait:false,
                },()=>{
                    clearInterval(this.timer);
                });
            }else {
                this.setState({
                    get_code_btn:'重新发送'+(time-1),
                },()=>{
                    time = time-1;
                });
            }
        }, 1000);
    }

    getValidCode(){
        fetch(HTTP_REQUEST.Host + '/account/account/getValidCode.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
            },
            body: JSON.stringify({
                "mobile":this.state.user_name,
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode !== 'S'){
                this.refs.toast.show('发送失败',1000);
                this.setState({
                    wait:false,
                });
            }else {
                this.refs.toast.show('发送成功，请输入您的验证码',1000);
                this.setWait();
            }
        })
        .catch((error) =>{
            console.error(error);
        })
    }

    /**
     * 确认注册
     */
    confirm(){
        if(this.state.user_name === ''){
            this.refs.toast.show('请输入手机号码！',1000);
            return;
        }
        if(!this.checkMobile()){
            this.refs.toast.show('手机号码格式不正确！',1000);
            return;
        }
        if(this.state.message_code === ''){
            this.refs.toast.show('请输入短信验证码',1000);
            return;
        }
        if (this.state.new_pwd === '') {
            this.refs.toast.show('请输入密码',1000);
            return;
        }
        if(!this.checkPassword(this.state.new_pwd)) {
            this.refs.toast.show('密码格式不正确',1000);
            return;
        }
        if (this.state.confirm_pwd === '') {
            this.refs.toast.show('请再次输入密码',1000);
            return;
        }
        if (!this.checkPassword(this.state.confirm_pwd)) {
            this.refs.toast.show('密码格式不正确',1000);
            return;
        }
        if (this.state.new_pwd !== this.state.confirm_pwd) {
            this.refs.toast.show('两次输入的密码不一致',1000);
            return;
        }
        this.registration();
    }

    registration(){
        fetch(HTTP_REQUEST.Host + '/account/account/regist.do',{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
            },
            body: JSON.stringify({
                "mobile": this.state.user_name,
                "code": this.state.message_code,
                "password": this.state.new_pwd
            }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode !== 'S'){
                if (responseJson.errorCode === '1904') {
                    this.refs.toast.show('该手机号已注册',1000);
                } else {
                    this.refs.toast.show(responseJson.errorMsg,1000);
                }
            }else {
                this.refs.toast.show('注册成功！即将跳转到登录页',1000);
                setTimeout(() => {
                    this.props.navigation.goBack();
                }, 1000)
            }
        })
        .catch((error) =>{
            console.error(error);
        })
    }
}

const styles = StyleSheet.create({
    logo_img: {
        width: 160,
        height: 100,
        top:10,
        resizeMode :'stretch',
    },
    //所有输入框的通用样式
    input: {
        position:'absolute',
        left:60,
        width:width*0.7,
        height:50,
        borderColor:'#EC7E2D',
        borderLeftWidth:0.5
    },
    user_name_view: {
        height:50,
        width:width*0.95,
        marginTop:30,
        borderColor:'#EC7E2D',
        borderTopWidth:0.5
    },
    user_name_86: {
        position:'absolute',
        textAlign:'center',
        textAlignVertical:'center',
        height:50,
        width:50,
        fontSize:18,
        color:"#EC7E2D",
        left:10
    },
    code_view: {
        height:50,
        width:width*0.95,
        justifyContent:'center',
        borderColor:'#EC7E2D',
        borderTopWidth:0.5,
    },
    code_img: {
        position:'absolute',
        resizeMode:'contain',
        height:25,
        width:25,
        left:20
    },
    get_code_btn: {
        height:30,
        width:90,
        right:10,
        position:'absolute',
        borderRadius:5,
        backgroundColor:'gray',
        justifyContent:'center',
        alignItems: 'center'
    },
    confirm_pwd_view: {
        height:50,
        width:width*0.95,
        justifyContent:'center',
        borderColor:'#EC7E2D',
        borderTopWidth:0.5,
        borderBottomWidth:0.5
    },
    confirm_button: {
        width:width*0.9,
        height:40,
        marginTop:20,
        backgroundColor:"#EC7E2D",
        borderRadius:5,
        justifyContent:"center",
        alignItems:'center'
    },
    confirm_text: {
        fontSize:16,
        color:"white"
    },
    to_login_view: {
        width:width*0.9,
        height:40,
        marginTop:35
    },
    to_login_text: {
        textAlign:'center',
        textAlignVertical:'center',
        fontSize:18,
        color:"#EC7E2D"
    },
});
