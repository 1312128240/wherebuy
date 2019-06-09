import React from 'react';
import {
    Image,
    View
} from "react-native"
import {
    createMaterialTopTabNavigator,
    createBottomTabNavigator,
    createStackNavigator,
    createSwitchNavigator,
    createAppContainer
} from 'react-navigation';

/**
 * APP主屏页面导航
 */
//import HomePage from './components/home/HomePage';
import HomePage2 from './components/home/HomePage2';
import MessagePage from './components/message/Message';
import ShoppingCarPage from './components/shoppingcar/ShoppingCar';
import MyPage from './components/personalinfo/My';

//订单模块
import OrderListPage1 from './components/personalinfo/order/OrderListPage1';
import OrderListPage2 from './components/personalinfo/order/OrderListPage2';
import OrderListPage3 from './components/personalinfo/order/OrderListPage3';
import OrderListPage4 from './components/personalinfo/order/OrderListPage4';
import OrderListPage5 from './components/personalinfo/order/OrderListPage5';

//内部跳转页面
import DIYOrderPage from './components/home/DIYOrderPage';//自定义下单页
import AroundSupermarket from './components/home/AroundSupermarket';//周边超市页
import NewsPage from './components/home/NewsPage';//新闻页
import RecommendPage from './components/home/RecommendPage';//推荐商品页
import ScanPage from './components/home/ScanPage';//条码扫描界面
import ConfirmOrder from './components/shoppingcar/ConfirmOrder';//订单确认
import SearchGoodsPage from './components/buy/SearchGoodsPage';//商品搜索
import SettingPage from './components/personalinfo/SettingPage';//系统设置
import ProfilePage from './components/personalinfo/ProfilePage';//个人信息
import SetProfilePage from './components/personalinfo/SetProfilePage';//修改个人信息
import MyTaskPage from './components/personalinfo/MyTaskPage';//我的任务
import ApplyingForCertificatePage from './components/personalinfo/ApplyingForCertificatePage';//申请认证
import AddressPage from "./components/personalinfo/address/MyAddressPage";//我的地址
import CreateAddressPage from './components/personalinfo/address/CreateAddressPage'//新增地址
import OrderDetails from './components/personalinfo/order/OrderDetails';//订单详情
import ApplyingForBuyerPage from './components/personalinfo/apply/ApplyingForBuyerPage';//申请成为采买员
import ApplyingForDeliverymanPage from './components/personalinfo/apply/ApplyingForDeliverymanPage';//申请成为配送员
import ApplyingForShareManPage from './components/personalinfo/apply/ApplyingForShareManPage';//申请成为分享员
import ApplyingForFamilyPage from './components/personalinfo/apply/ApplyingForFamilyPage';//申请成为家庭服务师
import AccountSecurityPage from './components/personalinfo/AccountSecurityPage';//账户安全
import ChangePhoneNumPage from './components/personalinfo/security/ChangePhoneNumPage';//修改手机号码1
import ChangePhoneNumPage2 from './components/personalinfo/security/ChangePhoneNumPage2'; //修改手机号2
import ChangePWDPage from './components/personalinfo/security/ChangePWDPage';//修改账户密码
import UnsubscribePage from './components/personalinfo/security/UnsubscribePage';//注销账户
import PriceCorrectionPage from './components/personalinfo/task/PriceCorrection/PriceCorrectionPage' //价格纠错首页
import PriceCorrectionHistoryPage from './components/personalinfo/task/PriceCorrection/PriceCorrectionHistoryPage' //价格纠错分享历史
import CorrectionAndSharePage from './components/personalinfo/task/PriceCorrection/CorrectionAndSharePage'//价格纠错分享
import ClassificationOfGoods from './components/home/ClassificationOfGoods'//商品分类
import PriceRankingPage from './components/home/PriceRankingPage';//价差排行
import {TaskTopBarNavigator} from './components/personalinfo/task/Buy/BuyTaskPage' //采买任务路由
import {DeliveryTopBarNavigator} from './components/personalinfo/task/Delivery/DeliveryPage' //配送任务路由
import {FlowTopBarNavigator} from './components/personalinfo/task/Flow/FlowPage'   //流转中心路由
import InformationSharePage from './components/personalinfo/task/InformationShare/InformationSharePage'//信息分享
import DeliveryDetails from './components/personalinfo/task/Delivery/DeliveryDetailsPage'//配送详情
import MyWhereBuyMainPage from './components/personalinfo/my/MyWhereBuyMainPage'//我的去哪买首页
//import InviteVIP from './components/personalinfo/my/InviteVIP'//邀请成为会员
import VIPIntroduce from './components/personalinfo/my/VIPIntroduce'//会员规则介绍页
import InviteVIPPhone from './components/personalinfo/my/InviteVIPPhone'//邀请会员，输入会员手机号码进行验证
import WriteInformationPage from './components/personalinfo/my/WriteInformationPage' //申请会员填写资料
import AddCustomerAddrPage from './components/personalinfo/my/HelpOrder/AddCustomerAddrPage' //代顾客下单填写顾客资料
import OpenVipPage from './components/personalinfo/my/OpenVipPage'//开通会员
import HelpOrderPage from './components/personalinfo/my/HelpOrder/HelpOrderPage' //代顾客下单
import MyTeamPartOrderPage from './components/personalinfo/my/MyTeam/MyTeamPartOrderPage' //我的团队下单员
import MyTeamMemberPage from './components/personalinfo/my/MyTeam/MyTeamMemberPage'//我的团队会员列表
import MyTeamOrderListPage from './components/personalinfo/my/MyTeam/MyTeamOrderListPage' //我的团队订单列表

//身份验证集合
import LoginPage from './components/auth/LoginPage';//登录
import ForgetPasswordPage from './components/auth/ForgetPasswordPage';//忘记密码
import RegistrationPage from './components/auth/RegistrationPage';//用户注册

//APP主屏底部导航
const AppBottomNavigator = createBottomTabNavigator({
    // HomePage:{
    //     screen:HomePage,
    //     navigationOptions: {
    //         tabBarLabel: '首页',
    //         tabBarIcon:({focused}) => (
    //             focused ?
    //              <Image style={{width:25,height:25}} source={require('./img/home_page_s.png')}/>
    //              :
    //              <Image style={{width:25,height:25}} source={require('./img/home_page_n.png')}/>
    //          )
    //     }
    // },
    HomePage2:{
        screen:HomePage2,
        navigationOptions: {
            tabBarLabel: '首页',
            tabBarIcon:({focused}) => (
                focused ?
                    <Image style={{width:25,height:25}} source={require('./img/home_page_s.png')}/>
                    :
                    <Image style={{width:25,height:25}} source={require('./img/home_page_n.png')}/>
            )
        }
    },
    MessagePage:{
        screen:MessagePage,
        navigationOptions: {
            tabBarLabel: '消息',
            tabBarIcon:({focused}) => (
                focused ? 
                 <Image style={{width:25,height:25}} source={require('./img/message_s.png')}/>
                 :
                 <Image style={{width:25,height:25}} source={require('./img/message_n.png')}/>
             )
        }
    },
    ShoppingCarPage:{
        screen:ShoppingCarPage,
        navigationOptions: {
            tabBarLabel: '购物车',
            tabBarIcon:({focused}) => (
                focused ? 
                 <Image style={{width:25,height:25}} source={require('./img/shopping_car_s.png')}/>
                 :
                 <Image style={{width:25,height:25}} source={require('./img/shopping_car_n.png')}/>
             )
        }
    },
    MyPage:{
        screen:MyPage,
        navigationOptions: {
            tabBarLabel: '我的',
            tabBarIcon:({focused}) => (
                focused ? 
                 <Image style={{width:25,height:25}} source={require('./img/my_s.png')}/>
                 :
                 <Image style={{width:25,height:25}} source={require('./img/my_n.png')}/>
             )
        }
    }
}, {
    //backBehavior:"none",
    tabBarOptions: {
        showIcon: true,//是否显示图标，默认关闭
        activeTintColor: "#FF8247",
    }
});

//订单模块导航
const AppOrderNavigator = createMaterialTopTabNavigator({
    OrderListPage1:{
        screen:OrderListPage1,
        navigationOptions: {
            tabBarLabel: '全部',
        }
    },
    OrderListPage2:{
        screen:OrderListPage2,
        navigationOptions: {
            tabBarLabel: '待查询',
        }
    },
    OrderListPage3:{
        screen:OrderListPage3,
        navigationOptions: {
            tabBarLabel: '进行中',
        }
    },
    OrderListPage4:{
        screen:OrderListPage4,
        navigationOptions: {
            tabBarLabel: '已完成',
        }
    },
    OrderListPage5:{
        screen:OrderListPage5,
        navigationOptions: {
            tabBarLabel: '已取消',
        }
    }
}, {
    lazy:true,
    swipeEnabled:false,
    animationEnabled:false,
    backBehavior:"none",//不设置会导致每次按下Back键，默认回到初始页面。
    tabBarOptions: {
        tabStyle: {
            //要想tab平分宽度，还要设置“选项卡滚动属性” scrollEnabled: false
        },
        activeTintColor:"#EC7E2D",
        inactiveTintColor:"#303030",
        upperCaseLabel: false,
        scrollEnabled: false,
        allowFontScaling:true,
        style: {
            backgroundColor: 'white',
        },
        indicatorStyle: {
            height: 2,
            backgroundColor: '#FF8247',
        },
        labelStyle: {
            color:"black",
            fontSize: 13,
            marginTop: 6,
            marginBottom: 6,
        },
    }
});

//app内页面路由
const AppStackNavigator = createStackNavigator({
    HomeTab: {
        screen: AppBottomNavigator,
        navigationOptions: {
            header: null,
        }
    },
    AppOrderNavigator: {
        screen: AppOrderNavigator,
        navigationOptions: {
            headerTitle:"订单查看",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    SearchGoodsPage:{
        screen:SearchGoodsPage,
        navigationOptions: {
            header: null,
        }
    },
    ClassificationOfGoods:{
        screen:ClassificationOfGoods,
        navigationOptions: {
            headerTitle:"商品分类",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    LoginPage:{
        screen:LoginPage,
        navigationOptions: {
            headerTitle:"登录",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    SettingPage:{
        screen:SettingPage,
        navigationOptions: {
            headerTitle:"设置",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    ProfilePage:{
        screen:ProfilePage,
        navigationOptions: {
            headerTitle:"个人信息",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    SetProfilePage:{
        screen:SetProfilePage,
        navigationOptions: null
    },
    MyTaskPage:{
        screen:MyTaskPage,
        navigationOptions: {
            headerTitle:"我的任务",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    ApplyingForCertificatePage:{
        screen:ApplyingForCertificatePage,
        navigationOptions: {
            headerTitle:"申请认证",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    MyAddressPage:{
        screen:AddressPage,
        navigationOptions: {
            headerTitle:"收货地址",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    CreateAddressPage:{
        screen:CreateAddressPage,
        navigationOptions: {
            headerTitle:"新增收货地址",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    OrderDetails:{
        screen:OrderDetails,
        navigationOptions: {
             headerTitle:"订单详情",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
         }
    },
    ApplyingForBuyerPage:{
        screen:ApplyingForBuyerPage,
        navigationOptions: {
            headerTitle:"成为采买员",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    ApplyingForDeliverymanPage:{
        screen:ApplyingForDeliverymanPage,
        navigationOptions: {
            headerTitle:"成为配送员",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    ApplyingForShareManPage:{
        screen:ApplyingForShareManPage,
        navigationOptions: {
            headerTitle:"成为价格分享员",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    ApplyingForFamilyPage:{
        screen:ApplyingForFamilyPage,
        navigationOptions: {
            headerTitle:"成为家庭服务师",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    AccountSecurityPage:{
        screen:AccountSecurityPage,
        navigationOptions: {
            headerTitle:"账户与安全",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    ChangePhoneNumPage:{
        screen:ChangePhoneNumPage,
        navigationOptions: {
            headerTitle:"修改手机号",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    ChangePhoneNumPage2:{
        screen:ChangePhoneNumPage2,
        navigationOptions: {
            headerTitle:"修改手机号",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    ChangePWDPage:{
        screen:ChangePWDPage,
        navigationOptions: {
            headerTitle:"修改密码",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    UnsubscribePage:{
        screen:UnsubscribePage,
        navigationOptions: {
            headerTitle:"注销账户",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    PriceCorrectionPage:{
        screen:PriceCorrectionPage,
    },
    PriceCorrectionHistoryPage:{
        screen:PriceCorrectionHistoryPage,
        navigationOptions: {
            headerTitle:"分享历史记录",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    PriceRankingPage:{
        screen:PriceRankingPage,
        navigationOptions: {
            headerTitle:"特价商品",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    CorrectionAndSharePage:{
        screen:CorrectionAndSharePage,
    },
    BuyTaskPage:{
        screen:TaskTopBarNavigator,
        navigationOptions: {
            headerTitle:"采买任务",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    DeliveryPage:{
        screen:DeliveryTopBarNavigator,
        navigationOptions: {
            headerTitle:"配送任务",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    ConfirmOrder:{
        screen:ConfirmOrder,
        navigationOptions: {
            headerTitle:"确认订单",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    Flow:{
        screen:FlowTopBarNavigator,
        navigationOptions: {
            headerTitle:"流转中心",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    InformationShare:{
        screen:InformationSharePage,
        navigationOptions: {
            headerTitle:"信息分享",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    DeliveryDetails:{
        screen:DeliveryDetails,
    },
    MyWhereBuyMainPage:{
        screen:MyWhereBuyMainPage,
        navigationOptions: {
            header: null,
        }
    },
    // InviteVIP:{
    //     screen:InviteVIP,
    //     navigationOptions: null
    // },
    VIPIntroduce:{
        screen:VIPIntroduce,
        navigationOptions: {
            headerTitle:"介绍",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    InviteVIPPhone:{
        screen:InviteVIPPhone,
        navigationOptions: null
    },
    WriteInformation:{
        screen:WriteInformationPage,
        navigationOptions: {
            headerTitle:"填写顾客信息",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    AddCustomerAddrPage:{
        screen:AddCustomerAddrPage,
        navigationOptions: {
            headerTitle:"填写顾客信息",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    OpenVip:{
        screen:OpenVipPage,
        navigationOptions:null
    },
    HelpOrderPage:{
        screen:HelpOrderPage,
        navigationOptions: null
    },
    MyTeamPartOrderPage:{
        screen:MyTeamPartOrderPage,
        navigationOptions: {
            headerTitle:"我的团队",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    MyTeamMemberPage:{
        screen:MyTeamMemberPage,
        navigationOptions: {
            headerTitle:"会员列表",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    MyTeamOrderListPage:{
        screen:MyTeamOrderListPage,
        navigationOptions: {
            headerTitle:"订单列表",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    ScanPage:{
        screen:ScanPage,
        navigationOptions: {
            headerTitle:"条码/二维码",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    RecommendPage:{
        screen:RecommendPage,
            navigationOptions: {
            headerTitle:"推荐商品",
                headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    NewsPage:{
        screen:NewsPage,
        navigationOptions: {
            headerTitle:"",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    AroundSupermarket:{
    screen:AroundSupermarket,
        navigationOptions: {
            headerTitle:"周边超市",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    DIYOrderPage:{
        screen:DIYOrderPage,
        navigationOptions: {
            headerTitle:"获取报价",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
},{
    initialRouteName: 'HomeTab'
});

//用户认证路由
const AppAuthNavigator = createStackNavigator({
    LoginPage: {
        screen: LoginPage,
        navigationOptions: {
            headerTitle:"登录",
            headerTitleStyle: {flex:1,textAlign:'center'}
        }
    },
    ForgetPasswordPage: {
        screen: ForgetPasswordPage,
        navigationOptions: {
            headerTitle:"忘记密码",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    },
    RegistrationPage: {
        screen: RegistrationPage,
        navigationOptions: {
            headerTitle:"创建账号",
            headerTitleStyle: {flex:1,textAlign:'center'},
            headerRight:(<View/>)
        }
    }
},{
    initialRouteName: 'LoginPage'
});

//主路由 管理用户认证路由、APP内页面路由
const AppSwitchNavigator = createSwitchNavigator({
    AppAuthNavigator: {
        screen: AppAuthNavigator,
    },
    AppStackNavigator: {
        screen: AppStackNavigator,
    },
},{
    initialRouteName: 'AppStackNavigator'
});

export default createAppContainer(AppSwitchNavigator);