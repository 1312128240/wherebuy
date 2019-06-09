import React, {Component} from 'react';
import {
    Image,
    StyleSheet,
    View,
    Dimensions,
    TouchableOpacity,
    Text,
    FlatList
} from 'react-native';
import {HTTP_REQUEST} from "../../utils/config";
import asyncStorageUtil from "../../utils/AsyncStorageUtil";
import Toast from "react-native-easy-toast";

const {width,height} = Dimensions.get('window');

/**
 * 我的任务页面
 */
export default class MyTaskPage extends Component{
  
  constructor(props) {
    super(props);
    this.state = {
        isDeliverer: 'false',
        isProcurer: "false",
        isSharer: "false",
        isFlow:"false",
        accessToken:'',
        itemlists:[],
    };

  }

    componentDidMount(): void {
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            },()=>{
                this.getData();
            });
        });
    }


    getData(){
        fetch( HTTP_REQUEST.Host+'/user/user/userInfo.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body:'{}'
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    this.setState({
                        isDeliverer: responseJson.data.isDeliverer,
                        isProcurer: responseJson.data.isProcurer,
                        isSharer:  responseJson.data.isSharer,
                        isFlow:responseJson.data.isFlow,
                    },()=>this.createData())
                }

            }).catch((error)=>{

        });
    }

    render() {
        return (
            <View>
                <FlatList
                    style={styles.other_area}
                    data={this.state.itemlists}
                    renderItem={this.renderTaskView.bind(this)}
                />

                <Toast
                    ref="toast"
                    style={{backgroundColor:'gray'}}
                    position='bottom'
                    positionValue={200}
                    textStyle={{color:'white'}}
                />
            </View>
        );
  }

    //根据权限生成数据
    createData(){
      let lists= [
          {key:"1",value: 'PriceCorrectionPage',imgUrl:'http://qnm.laykj.cn/image/jiucuo.png',tip:'价格纠错'},
          {key:"2",value: 'InformationShare',imgUrl:'http://qnm.laykj.cn/image/fenxiang.png',tip:'信息分享'},
          {key:"3",value: 'BuyTaskPage',imgUrl:'http://qnm.laykj.cn/image/caimai.png',tip:'采买任务'},
          {key:"4",value: 'DeliveryPage',imgUrl:'http://qnm.laykj.cn/image/peisong.png',tip:'配送任务'},
          //{key:"5",value: '',imgUrl:'http://qnm.laykj.cn/image/peisong.png',tip:'流转中心'},
      ];
        if(this.state.isFlow=='TRUE'){
            lists.push( {key:"5",value: 'Flow',imgUrl:'http://qnm.laykj.cn/image/peisong.png',tip:'流转中心'})
        }

       // return lists;
        this.setState({
            itemlists:lists,
        })
    }


   //列表item
    renderTaskView({item,index}) {
    return (
      <TouchableOpacity style={styles.task_item} onPress={() =>this.jump(index) }>
          <Image style={styles.task_img} source={{uri:item.imgUrl}}/>
          <Text style={styles.task_text}>{item.tip}</Text>
          <Image style={styles.task_icon} source={{uri:"http://qnm.laykj.cn/image/member_more.png"}}/>
      </TouchableOpacity>
    );
  }


  //点击跳转
   jump=(i)=>{
        if(i==0){
            if(this.state.isSharer==='TRUE'){
                this.props.navigation.navigate('PriceCorrectionPage')
            }else {
               // alert('您还不是价格分享员,请先去申请成为价格分享员!')
                this.refs.toast.show('您还不是价格分享员,请先去申请成为价格分享员!',1000)
            }

        }else if(i==1){
            if(this.state.isSharer==='TRUE'){
                this.props.navigation.navigate('InformationShare')
            }else {3
              //  alert('您还不是价格分享员,请先去申请成为价格分享员!')
                this.refs.toast.show('您还不是价格分享员,请先去申请成为价格分享员!',1000)
            }

        }else if(i==2){

            if(this.state.isProcurer==='TRUE'){
                this.props.navigation.navigate('BuyTaskPage')
            }else {
               // alert('您还不是采买员,请先去申请成为采买员!')
                this.refs.toast.show('您还不是采买员,请先去申请成为采买员!',1000)
            }

        }else if(i==3){
            if(this.state.isDeliverer==='TRUE'){
                this.props.navigation.navigate('DeliveryPage')
            }else {
               // alert('您还不是配送员,请先去申请成为配送员')
                this.refs.toast.show('您还不是配送员,请先去申请成为配送员!',1000)
            }
        }else if(i==4){
            if(this.state.isFlow==='TRUE'){
                this.props.navigation.navigate('Flow')
            }
        }

    }
}

const styles = StyleSheet.create({
    task_item: {
     // borderTopWidth: 0,
      borderBottomWidth: 0.5, 
      borderBottomColor: '#D9D9D9',
      flexDirection:'row',
      alignItems:'center',
      width: width,
      height:60,
    },
    task_img: {
      position:'absolute',
      width: 35,
      height:35,
      resizeMode:'contain',
      left:10,
    },
    task_text: {
      position:'absolute',
      fontSize:16,
      left:55
    },
    task_icon: {
      position:'absolute',
      width: 15,
      height:15,
      resizeMode:'contain',
      left:width-30
    },
});
