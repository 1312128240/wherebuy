import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Text,
  ScrollView
} from 'react-native';
import asyncStorageUtil from '../../utils/AsyncStorageUtil'
import {HTTP_REQUEST,USER_INFO} from '../../utils/config'

//屏幕的宽高
const {width,height} = Dimensions.get('window');

/**
 * 个人信息页
 */
export default class My extends Component{

  constructor(props) {
    super(props);
    this.state = {
      name:'',
      headImg:'http://qnm.laykj.cn/image/woyaozai.jpg',
      userInfo:null,
      isOrderMan:'FALSE',
      accessToken:''
    };
  }

   componentWillMount(): void {
     this._navListener = this.props.navigation.addListener('didFocus', () => {
       asyncStorageUtil.getLocalData("accessToken").then(data => {
           if (data === '') {
            this.props.navigation.navigate('AppAuthNavigator')
          } else {
            this.setState({
              accessToken: data,
            }, () => {
              this.getUserInfo();
            });
       }});
     });
  }

   componentWillUnmount(): void {
     this._navListener.remove();
   }

   render() {
    return (
      <View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {this._header()}
          {this._footerView()}
          <View style={{height:20}}/>
        </ScrollView>
      </View>
    );
  }

   //头部
   _header(){
     return (
         <View style={{height:315,backgroundColor:'#F5F5F5'}}>
           <Image style={styles.head_bg_img} source={{uri:'http://qnm.laykj.cn/image/member_head_bg.png'}}/>
           <TouchableOpacity
               activeOpacity={0.7}
               style={styles.head_img_touch}
               onPress={() => this.toProfilePage()}>
             <Image style={styles.head_img} source={{uri:this.state.headImg}}/>
           </TouchableOpacity>
           <Text style={styles.user_name} selectable={true}>{this.state.name}</Text>
           <TouchableOpacity
               activeOpacity={0.7}
               style={styles.setting_img_touch}
               onPress={() => this.toSettingPage()}>
             <Image style={styles.setting_img} source={{uri:'http://qnm.laykj.cn/image/set.png'}}/>
           </TouchableOpacity>
           <View style={styles.order_area}>
             <Image style={styles.my_order_img} source={{uri:'http://qnm.laykj.cn/image/order_my.png'}}/>
             <Text style={styles.my_order_text}>我的订单</Text>
             <Image style={styles.all_order_img} source={{uri:'http://qnm.laykj.cn/image/order_more.png'}}/>
             <TouchableOpacity
                 activeOpacity={0.7}
                 style={styles.all_order_text_touch}
                 onPress={() => this.props.navigation.navigate('OrderListPage1')}>
               <Text style={styles.all_order_text}>查看全部订单</Text>
             </TouchableOpacity>
             <View style={styles.order_line}/>
             <View style={styles.order_status_body}>
               {this.renderOrderStatusView("3","http://qnm.laykj.cn/image/order_conduct.png","进行中")}
               {this.renderOrderStatusView("2","http://qnm.laykj.cn/image/order_examine.png","待查询")}
               {this.renderOrderStatusView("4","http://qnm.laykj.cn/image/order_complete.png","已完成")}
               {this.renderOrderStatusView("5","http://qnm.laykj.cn/image/order_cancel.png","已取消")}
               {this.renderOrderStatusView("1","http://qnm.laykj.cn/image/order_refund.png","退款/售后")}
             </View>
           </View>
       </View>
     )
  }

  //根据是否是推广商，生成数据
  _footerView(){
    let dataList=[
      {key:"1",value: 'MyAddressPage',imgUrl:'http://qnm.laykj.cn/image/member_add.png',tip:'收货地址'},
      {key:"2",value: 'MyTaskPage',imgUrl:'http://qnm.laykj.cn/image/member_task.png',tip:'我的任务'},
      {key:"3",value: 'ApplyingForCertificatePage',imgUrl:'http://qnm.laykj.cn/image/member_authentication.png',tip:'申请认证'},
      {key:"4",value: 'AccountSecurityPage',imgUrl:'http://qnm.laykj.cn/image/member_safe.png',tip:'账户安全'},
    ];
    if(this.state.isOrderMan === 'TRUE'){
      dataList.push(
          {key:"5",value: 'MyWhereBuyMainPage',imgUrl:'http://qnm.laykj.cn/image/icon-buy.png',tip:'我的去哪买'}
      )
    }

     let viewList=[];
     dataList.map((item,index)=>{
        viewList.push(
            <TouchableOpacity key={index} style={styles.other_area_item} onPress={() =>this.props.navigation.navigate(item.value)}>
              <Image style={{position:'absolute',width: 35,height:35,resizeMode:'contain',left:10}}
                     source={{uri:item.imgUrl}}/>
              <Text style={{position:'absolute',fontSize:16,left:55}}>{item.tip}</Text>
              <Image style={{position:'absolute',width:15,height:15,resizeMode:'contain',left:width-25}}
                     source={{uri:"http://qnm.laykj.cn/image/member_more.png"}}/>
            </TouchableOpacity>
        )
    });
    return viewList;
  }

  //个人信息
  toProfilePage(){
    if(this.state.accessToken === ""){
      this.props.navigation.navigate('AppAuthNavigator')
    }else{
      this.props.navigation.navigate('ProfilePage', {userInfo:this.state.userInfo,
        update: () => {
          this.getUserInfo();
        },
      })
    }
  }

  //设置
  toSettingPage(){
    this.props.navigation.navigate('SettingPage', {userInfo:this.state.userInfo,
       update: () => {
         this.getUserInfo();
       },
    })
  }


  //获取个人信息数据
  getUserInfo(){
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
        if(responseJson.respCode === 'S'){
          this.setState({
            userInfo:JSON.stringify(responseJson.data),
            name: responseJson.data.nickname,
            headImg: responseJson.data.headImage,
            isOrderMan:responseJson.data.isOrderMan,
          })
        }else{
          if(responseJson.errorCode+'' === '1906'){
            asyncStorageUtil.putLocalData("accessToken","");
            this.props.navigation.navigate('AppAuthNavigator')
          }
        }
    })
    .catch((error) =>{})
  }

  /**
   * 返回订单状态分类布局
   */
  renderOrderStatusView(PageId,imgUrl,tip) {
    return (
      <TouchableOpacity activeOpacity={0.7} style={styles.order_status_touch}
          onPress={() =>this.props.navigation.navigate('OrderListPage'+PageId)}>
          <Image style={styles.order_status_img} source={{uri:imgUrl}}/>
          <Text style={styles.order_status_text}>{tip}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  //头部背景
  head_bg_img: {
    width: width,
    height:215,
  },
  //头像点击
  head_img_touch: {
    position: 'absolute',
    top:30,
    left:(width/2)-45,
  },
  //头像
  head_img: {
    width: 90,
    height:90,
    borderRadius:90
  },
  //用户名
  user_name: {
    position: 'absolute',
    top:130,
    width:width,
    textAlign:'center',
    fontSize:18,
    color:"white"
  },
  //设置点击
  setting_img_touch: {
    position: 'absolute',
    top:10,
    left:width-40,
  },
  //设置
  setting_img: {
    width: 28,
    height:28,
  },
  //订单模块整体
  order_area: {
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: '#EC7E2D',
    top:170,
    width: width-30,
    height:130,
    left:15,
    borderRadius:5,
    elevation:1
  },
  //我的订单 标题、图标
  my_order_img: {
    position: 'absolute',
    width: 25,
    height:30,
    top:10,
    left:15,
    resizeMode:'stretch'
  },
  my_order_text: {
    position: 'absolute',
    top:10,
    left:50,
    fontSize:18,
    color:"white"
  },
  //查看全部订单 标题、图标
  all_order_img: {
    position: 'absolute',
    width: 10,
    height:15,
    top:15,
    left:(width-30)-30,
    resizeMode:'stretch'
  },

  all_order_text_touch: {
    position: 'absolute',
    top:11,
    right:30,
  },
  all_order_text: {
    fontSize:16,
    color:"white",
    paddingRight:5
  },
  //分割线
  order_line: {
    position: 'absolute',
    top:45,
    height:1,
    width:width-30,
    backgroundColor:"white"
  },
  //订单状态整体
  order_status_body: { 
    flexDirection: 'row',
    justifyContent:'space-around',
    alignItems:"center",
    position: 'absolute',
    top:46,
    height:90,
    width:width-30,
  },
  //订单状态 图标 order_status_touch justifyContent平分
  order_status_touch: {
    height:55,
    alignItems:"center",
  },
  order_status_img: {
    width: 35,
    height:35,
    resizeMode:'contain'
  },
  order_status_text: {
    fontSize:16,
    color:"white"
  },
  //收货地址、我的任务等整体
  other_area: {
    position: 'absolute',
    top:320,
    width: width,
    height:height-400
  },
  other_area_item: {
    borderTopWidth: 0, 
    borderBottomWidth: 0.5,
    backgroundColor:'#FFF',
    borderBottomColor: '#D9D9D9',
    flexDirection:'row',
    alignItems:'center',
    width: width,
    height:60,
  },

});
