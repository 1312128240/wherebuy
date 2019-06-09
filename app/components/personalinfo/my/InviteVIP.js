// import React, {Component} from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   Dimensions,
//   Image
// } from 'react-native';
// import AsyncStorageUtil from "../../../utils/AsyncStorageUtil";
// import BaseComponent from "../../../views/BaseComponent";
// const {width} = Dimensions.get('window');
//
// /**
//  * 邀请成为会员，选择会员类型。
//  */
// export default class InviteVIP extends BaseComponent {
//
//   constructor(props) {
//     super(props);
//     this.state = {};
//   }
//
//   /**
//    * 将question方法添加到props.navigation中
//    */
//   componentWillMount() {
//     this.props.navigation.setParams({question: this.question});
//   }
//
//
//   /**
//    * 设置导航栏
//    */
//   static navigationOptions = ({ navigation }) => {
//     const {params} = navigation.state;
//     return {
//         headerTitle:"邀请成为会员",
//         headerTitleStyle: {
//             flex:1,
//             textAlign:'center',
//         },
//         headerRight: (
//             <TouchableOpacity onPress={() => params.question()}>
//                 <Image
//                   style={{width:30,height:30,right:10}}
//                   source={require('../../../img/question.png')}/>
//             </TouchableOpacity>
//         ),
//     }
//   };
//
//   question = () =>this.props.navigation.navigate('VIPIntroduce')
//
//   render() {
//     return (
//         <View style={{backgroundColor:'#F5F5F5'}}>
//             <TouchableOpacity
//                 style={styles.bottom_info_item}
//                 onPress={()=>this._jump('NORMAL')}
//                 activeOpacity={0.7}>
//                 <Text style={styles.bottom_info_name}>普通会员</Text>
//                 <Image style={styles.bottom_info_icon} source={{uri: "http://qnm.laykj.cn/image/member_more.png"}}/>
//             </TouchableOpacity>
//             <TouchableOpacity
//                 style={styles.bottom_info_item}
//                 onPress={()=>this._jump('SENIOR')}
//                 activeOpacity={0.7}>
//                 <Text style={styles.bottom_info_name}>高级会员</Text>
//                 <Image style={styles.bottom_info_icon} source={{uri: "http://qnm.laykj.cn/image/member_more.png"}}/>
//             </TouchableOpacity>
//             <TouchableOpacity
//                 style={styles.bottom_info_item}
//                 onPress={()=>this._jump('SUPER')}
//                 activeOpacity={0.7}>
//                 <Text style={styles.bottom_info_name}>超级VIP</Text>
//                 <Image style={styles.bottom_info_icon} source={{uri: "http://qnm.laykj.cn/image/member_more.png"}}/>
//             </TouchableOpacity>
//         </View>
//     );
//   }
//
//   //填写会员信息页面
//   _jump(type){
//      AsyncStorageUtil.putLocalData('InviteVIP_Key',this.props.navigation.state.key+'');
//      this.props.navigation.navigate('InviteVIPPhone', {type: type})
//   }
// }
//
// const styles = StyleSheet.create({
//   bottom_info_item: {
//       width:width,
//       height:50,
//       marginBottom:2,
//       alignItems:'center',
//       flexDirection:'row',
//       backgroundColor:'white',
//   },
//   bottom_info_name: {
//       position:'absolute',
//       fontSize:18,
//       left:15
//   },
//   bottom_info_icon: {
//       position:'absolute',
//       width: 15,
//       height:15,
//       resizeMode:'contain',
//       right:10
//   },
// });
