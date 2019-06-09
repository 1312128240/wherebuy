/**
 * 所有组件的基类
 * 实现android端物理返回键的监听
 */
import React, {Component} from 'react';
import {HTTP_REQUEST, USER_INFO} from "../utils/config";
import asyncStorageUtil from "../utils/AsyncStorageUtil";


export default class BaseComponent extends Component {

    constructor(props) {
        super(props);
        this.state={
            accessToken:'',
        }
    }

    componentDidMount(): void {
        this._navListener = this.props.navigation.addListener('didFocus', () => {
            asyncStorageUtil.getLocalData("accessToken").then(data => {
                if (data ==='') {
                    this.props.navigation.navigate('AppAuthNavigator')
                } else {
                    this.setState({
                        accessToken: data,
                    }, () => {
                        this.getUserInfor()
                    });
                }

            });
        })

    }


    //我们应该在组件销毁的时候将异步方法和状态撤销
    componentWillUnmount(): void {
        this._navListener.remove();
        this.setState = (state, callback) => null;
    }

    /**
     * 随便用一个接口测试，如果失效则退出
     */
    getUserInfor(){
        fetch(HTTP_REQUEST.Host + USER_INFO,{
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken':this.state.accessToken
            },
            body: JSON.stringify({}),
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if(responseJson.respCode==='F'){
                    if(responseJson.errorMsg.indexOf("accessToken失效")>-1){
                        asyncStorageUtil.putLocalData("accessToken","");
                        this.props.navigation.navigate('AppAuthNavigator')
                    }
                }
            })
            .catch((error) =>{
        })

    }


}