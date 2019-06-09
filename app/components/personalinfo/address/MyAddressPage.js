import React,{Component} from 'react'
import {Text, View, FlatList,StyleSheet, Image,TouchableOpacity} from 'react-native'
import {HTTP_REQUEST} from '../../../utils/config'
import AsyncStorageUtil from '../../../utils/AsyncStorageUtil'
import Toast from 'react-native-easy-toast';
import BaseComponent from "../../../views/BaseComponent";


export  default  class  MyAddressPage extends BaseComponent{

    constructor(){
        super();
        this.state={
            accessToken:'',
            addressList:[],
            defaultAddressId:'',
            currentIndex:0,
        }
    }

    render(){
        return(
            <View style={{backgroundColor:'#F5F5F5',flex:1}}>

                <FlatList
                    renderItem={this._renderItem}
                    data={this.state.addressList}
                    keyExtractor={(item,index)=>index.toString()}
                />

                <TouchableOpacity style={{backgroundColor:"#EC7E2D",height:55,justifyContent:'center',alignItems:'center'}}
                                  onPress={()=>this.props.navigation.navigate('CreateAddressPage',{ refresh:()=>this._getDefaultAddress()})}>
                    <Text style={{color:'#FFF',fontSize:18,fontWeight:'500'}}>新增地址</Text>
                </TouchableOpacity>

                <Toast
                    ref="toast"
                    style={{backgroundColor: 'gray'}}
                    position='bottom'
                    positionValue={200}
                    textStyle={{color: 'white'}}
                />

            </View>
        )
    }


    componentDidMount(): void {
        super.componentDidMount();
        AsyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            },()=>{
                this._getDefaultAddress();
            });
        });
    }


    _renderItem=({item,index})=>{

        return (
            <View key={index} style={{backgroundColor:'#FFF',marginBottom:8}}>

                <View style={addressStyle.itemTop}>
                    <Text style={addressStyle.tv1}>{item.receiverName+"      "}( {item.sex=='FEMALE'?'女':'男'} ){"      "+item.mobile}</Text>
                    <View style={{height:5}}/>
                    <Text>{item.areaName}{item.smallName}{item.addressTwo}</Text>
                </View>

                <View style={addressStyle.itemBottom}>
                    <TouchableOpacity onPress={()=>this.changeDefault(item,index)} style={{color:'#000',flexDirection:'row'}}>

                        <Image style={{width:20,height:20,marginRight:8}}
                               source={item.select?require('../../../img/selected.png') : require('../../../img/unselected.png')}/>
                        <Text>设为默认</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}}
                                      onPress={()=>this._deleteAddress(item,index)}>
                        <Image style={{width:15,height:16,marginRight:5}} source={{uri:'http://qnm.laykj.cn/image/shanchu.png'}}/>
                        <Text style={{color:'#303030'}}>删除</Text>
                    </TouchableOpacity>
                </View>

            </View>
        )
    }

    //获取默认地址
    _getDefaultAddress(){
        fetch(HTTP_REQUEST.Host+'/user/address/getDefaultReceiveAddress.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body:'{ }'

        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if(responseJson.respCode=='S'){
                    this.setState({
                        defaultAddressId:responseJson.data.receiveAddressId
                    },()=>this._getAddressData())
                }else {
                     this.refs.toast.show("未设置默认地址",1000)
                }
            }).catch((error)=>{
        });
    }

    //获取地址列表
    _getAddressData(){
           fetch(HTTP_REQUEST.Host+'/user/address/getUserAddr.do', {
               method: 'POST',
               headers: {
                   accessToken:this.state.accessToken,
                   'Content-Type': 'application/json;charset=UTF-8',
               },
               body:'{ }'

           })
               .then((response) => response.json())
               .then((responseJson)=>{
                   if(responseJson.respCode=='S'){
                       let tempList=[];
                       let receiveIdList=[];

                       for(let i=0;i<responseJson.data.length;i++){
                           let bean=responseJson.data[i];
                         //  bean.select=false;
                          // tempList.push(bean)
                           //将列表收货人id放入数组
                           receiveIdList.push(bean.receiveAddressId);

                           if(bean.receiveAddressId===this.state.defaultAddressId){
                               bean.select=true;
                           }else {
                               bean.select=false;
                           }

                           tempList.push(bean)
                       }
                       if(receiveIdList.length!=0){
                           //找出默认id在存放id数组中的位置
                           let index =receiveIdList.indexOf(this.state.defaultAddressId);
                           //如果默认地址不在第一个,就将这个位置移到第一位
                           if(index!==0){
                               let list1 =tempList.splice(index,1);
                               tempList.unshift(list1[0]);
                           }
                       }

                       this.setState({
                           addressList: tempList,
                       })
                   }
               }).catch((error)=>{
           });

       }


     //设置默认地址
    changeDefault(item,index){
        if(item.select===true){
            this.refs.toast.show("默认地址不能取消")
        }else {
            let lists=[];
            for (let i = 0; i <this.state.addressList.length ; i++) {
                 let bean=this.state.addressList[i];
                 if(i===index){
                     bean.select=true;
                 }else {
                     bean.select=false;
                 }
                 lists.push(bean);
            }

            this.setState({addressList:lists},()=>this._default(item.receiveAddressId))
        }
    }

    _default(id){
        fetch(HTTP_REQUEST.Host+'/user/address/accGoodsAddrDef.do',{
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                receiveAddressId:id
            }),

        }).then((response) => response.json())
            .then((responseJson)=>{
                if(responseJson.respCode=='S'){
                    this.refs.toast.show("设置成功",1000)
                }else {
                    this.refs.toast.show(responseJson.errorMsg,1000)
                }
            }).catch((error)=>{
        });
    }

    //删除
    _deleteAddress(item,index){

        fetch(HTTP_REQUEST.Host+'/user/address/deleteGoodsAddrDef.do',{
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                receiveAddressId:item.receiveAddressId
            }),

        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if(responseJson.respCode=='S'){
                    this.refs.toast.show("删除成功",1000);
                    if(this.state.addressList.length==1){
                        this.state.addressList=[];
                    }else {
                        this.state.addressList.splice(index,1);
                    }
                    this.setState({
                        addressList:this.state.addressList,
                    })
                }else {
                    this.refs.toast.show("删除失败",1000)
                }
            }).catch((error)=>{
        });
    }

}



const addressStyle=StyleSheet.create({

    tv1:{
        color:'#000',
        fontSize:18,
        fontWeight: '700'
    },

    itemTop:{
        marginRight:12,
        marginLeft:12,
        marginTop:12,
        paddingBottom:12,
        borderBottomWidth:1,
        borderBottomColor:'#D9D9D9'
    },

    itemBottom:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        paddingLeft:12,
        paddingRight:12,
        paddingTop:8,
        paddingBottom:8,
    }
})