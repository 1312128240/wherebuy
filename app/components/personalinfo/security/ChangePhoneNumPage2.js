
import React ,{Component}from 'react'
import {View,Text,TextInput,TouchableOpacity,Dimensions,StyleSheet} from 'react-native'
import  Toast from 'react-native-easy-toast'
import BaseComponent from "../../../views/BaseComponent";


let w=Dimensions.get('window').width;

export default class ChangePhoneNumPage2 extends BaseComponent{

     constructor(){
         super();
         this.state = {
             ConfirmationCode:'',
         };
     }

    render(){
        return(
         <View style={{backgroundColor:'#F5F5F5',flex:1,alignItems:'center'}}>
             <View style={{height:90,justifyContent:'center',alignItems:'center'}}>
                 <Text style={{color:'#000',bold:'700',fontSize:18,marginBottom:10}}>我们已经发送验证码到您的手机</Text>
                 <Text style={{color:'#000',fontSize:16}}>{this._subStr('15989541735')}</Text>
             </View>

             <View style={{backgroundColor:'#FFF',height:45,flexDirection:'row',paddingLeft:10,paddingRight:10,alignItems:'center'}}>
                 <Text style={{width:80,color:'#303030',fontSize:16,}}>校验码</Text>
                 <TextInput
                     style={{flex:1,}}
                     keyboardType={'numeric'}
                     maxLength={4}
                     onChangeText={(result) =>{
                         this.setState({
                             ConfirmationCode:result,
                         })
                     }}

                     placeholder="请输入短信验证码">
                 </TextInput>

                 <View style={{width:1,height:25,backgroundColor:'#D9D9D9'}}></View>
                 <Text style={{fontSize:16,width:80,color:'gray',textAlign:'right'}}>58秒重发</Text>
             </View>



             <TouchableOpacity onPress={()=>this._next()}>
                 <View style={{width:w-30,height:45,backgroundColor:'#EC7E2D',justifyContent:'center',alignItems:'center',borderRadius:8,marginTop:20}}>
                     <Text style={{color:'#FFF'}}>下一步</Text>
                 </View>
             </TouchableOpacity>

             <Toast  //提示
                 ref="toast"
                 style={{backgroundColor:'gray'}}
                 position='bottom'
                 positionValue={200}
                 textStyle={{color:'white'}}
             />
         </View>
        )

    }


    _subStr(phNum){
        if(phNum.length==11)
       // let phNum='15989541735';
        return phNum.substr(0,3) + "****" + phNum.substr(7);
    }

    _next=()=>{
         if(this.state.ConfirmationCode==''||this.state.ConfirmationCode.length<4){
             this.refs.toast.show('请输入正确的验证码',1000);
             return;
         }

        this.refs.toast.show('下一步',1000);

    }
}

