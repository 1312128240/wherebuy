/**
 * Component基类
 */
import React,{Component} from 'react';
import asyncStorageUtil from "../utils/AsyncStorageUtil";

export default class BaseComponent extends Component{

    /**
     * 此处的accessToken提供给所有子类使用
     */
    constructor(props){
        super(props);
        this.state={
            accessToken:'',
        }
    }

    /**
     * 获取本地存储的accessToken
     */
    componentDidMount(){
        asyncStorageUtil.getLocalData("accessToken").then(data => {
            if (data ==='') {
                this.props.navigation.navigate('AppAuthNavigator')
            } else {
                this.setState({
                    accessToken: data,
                }, () => {
                    this.onToken()
                });
            }
        });
    }

    /**
     * 提供给子类accessToken获取完成以后的操作
     */
    onToken(){}

    /**
     * 帮助子类判断accessToken是否失效
     */
    checkToken(response){
        if(response.respCode !== 'S' && response.errorCode+'' === '1906'){
            alert('response.errorCode === 1906');
            asyncStorageUtil.putLocalData("accessToken","");
            this.props.navigation.navigate('AppAuthNavigator')
        }
    }
}