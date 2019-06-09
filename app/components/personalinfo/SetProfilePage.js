import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    View,
    Dimensions,
    TouchableOpacity,
    Text,
    TextInput,
    DatePickerAndroid,
    Modal
} from 'react-native';
import {HTTP_REQUEST,SAVE_USER_INFO} from '../../utils/config'
import asyncStorageUtil from "../../utils/AsyncStorageUtil";
import BaseComponent from "../../views/BaseComponent";

const {width,height} = Dimensions.get('window');

/**
 * 设置昵称、生日、性别 苗 2019年4月9日
 */
export default class SetProfilePage extends BaseComponent{
  
    constructor(props) {
      super(props);
      this.state = {
          accessToken:'',
          type:0,
          newName: '',
          newBirthday:'',
          newGender:'',
          modalVisible: false
      };
    }

    /**
     * 将saveChange方法添加到props.navigation中
     */
    componentWillMount() {
        this.props.navigation.setParams({saveChange: this.saveChange});
    }

    componentDidMount(){
        super.componentDidMount();

        let type = this.props.navigation.state.params.type;
        this.setState({type:type});
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({accessToken: data,});
        });
    }

    /**
     * 设置导航栏
     */
    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state;
        return {
            title: params ? params.title : 'SetProfilePage',
            headerRight: (
                <TouchableOpacity onPress={() => params.saveChange()}>
                    <Text style={styles.save_button_text}>保存</Text>
                </TouchableOpacity>
            ),
        }
    };

    /**
     * 保存设置，调用修改接口
     */
    saveChange = () => {
        let formdata = new FormData();
        let newValue;
        if(this.state.type === 1){
            newValue = this.state.newName;
            formdata.append("nickname",this.state.newName);
        }else if(this.state.type === 2){
            newValue = this.state.newBirthday;
            formdata.append("birthday",this.state.newBirthday);
        }else if(this.state.type === 3){
            newValue = this.state.newGender;
            formdata.append("sex",this.state.newGender);
        }
        fetch(HTTP_REQUEST.Host + SAVE_USER_INFO,{
            method: 'POST',
            headers: {
                //'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: formdata
        })
        .then((response) => response.json())
        .then((responseJson) => {
            //将修改成功的参数回调给上个页面
            this.props.navigation.state.params.returnPara(this.state.type,newValue);
            this.props.navigation.goBack();
        })
        .catch((error) =>{
            console.error(error);
        })
    };

    /**
     * 控制性别选择弹窗框显隐
     */
    setModalVisible(visible) {
        this.setState({modalVisible:visible});
    }

    /**
     * 设置性别并且隐藏弹窗
     */
    setGenderHideModal(gender) {
        this.setState({newGender:gender});
        this.setModalVisible(!this.state.modalVisible);
    }

    /**
     * 返回弹出框里面的布局
     */
    renderDialog() {
        return (
            <View style={styles.modal_content}>
                <TouchableOpacity
                    onPress={() => this.setModalVisible(!this.state.modalVisible)}
                    style={{
                        position: 'absolute',
                        width:60,
                        height:50,
                        justifyContent:"center",
                        alignItems:'center'
                     }}>
                    <Text style={{fontSize:18,color:"#EC7E2D"}}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => this.setGenderHideModal('男')}
                    style={{
                        position: 'absolute',
                        width:width,
                        height:50,
                        top:60,
                        justifyContent:"center",
                        alignItems:'center'
                    }}>
                    <Text style={{fontSize:18}}>男</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => this.setGenderHideModal('女')}
                    style={{
                        position: 'absolute',
                        width:width,
                        height:50,
                        top:110,
                        justifyContent:"center",
                        alignItems:'center'
                    }}>
                    <Text style={{fontSize:18}}>女</Text>
                </TouchableOpacity>
            </View>
        )
    }

    /**
     * 打开日期选择器 目前只支持Android版本
     */
    async openDatePicker() {
        if(Platform.OS === "ios"){
            return ;
        }
        try {
            const {action, year, month, day} = await DatePickerAndroid.open({
                date: new Date(),
                maxDate:new Date()
            });
            if (action !== DatePickerAndroid.dismissedAction) {
                this.setState({
                    newBirthday: year+'-'+(month+1)+'-'+day
                })
            }
        } catch ({code, message}) {
            console.warn('Cannot open date picker', message);
        }
    }

    /**
     * 界面渲染
     */
    render() {
        let type = this.props.navigation.state.params.type;
        if(type === 1){
            return (
                <View style={{alignItems:"center",flex:1}}>
                    <TextInput
                        style={styles.name_input}
                        onChangeText={(newName) => this.setState({newName})}
                        placeholder="请输入新的用户名">
                    </TextInput>
                </View>
            );
        }else if(type === 2){
            return (
                <View style={{alignItems:"center",flex:1}}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.birthday_input}
                        onPress={() => this.openDatePicker()}>
                        <Text style={{fontSize:18}}>{this.state.newBirthday}</Text>
                    </TouchableOpacity>
                </View>
            );
        }else if(type === 3){
            return (
                <View style={{alignItems:"center",flex:1}}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.birthday_input}
                        onPress={() => {this.setModalVisible(true)}}>
                        <Text style={{fontSize:18}}>{this.state.newGender}</Text>
                    </TouchableOpacity>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={this.state.modalVisible}
                        onRequestClose={() => {this.setModalVisible(!this.state.modalVisible)}}>
                        <TouchableOpacity
                            style={styles.modal_style}
                            activeOpacity={1}
                            onPress={() => this.setModalVisible(!this.state.modalVisible)}>
                            {this.renderDialog()}
                        </TouchableOpacity>
                    </Modal>
                </View>
            );
        }
    }

}

const styles = StyleSheet.create({
    save_button_text: {
      fontSize:18,
      color:"#EC7E2D",
      right:15
    },
    name_input: {
      height: 60,
      width:width*0.9,
      borderColor: '#EC7E2D',
      borderWidth:0.5,
      top:15,
      borderRadius:5,
      fontSize:18
    },
    birthday_input: {
      height: 60,
      width:width*0.9,
      borderColor: '#EC7E2D',
      borderWidth:0.5,
      top:15,
      borderRadius:5,
      justifyContent:"center",
      alignItems:'center'
    },
    modal_style: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modal_content: {
      position: 'absolute',
      height:height*0.3,
      width:width,
      top:height*0.7,
      borderRadius:5,
      backgroundColor:'#FFFFFF'
    },
});
