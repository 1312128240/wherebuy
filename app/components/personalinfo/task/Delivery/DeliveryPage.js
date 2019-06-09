import React,{Component} from 'react';
import {createMaterialTopTabNavigator} from 'react-navigation'
import DeliveryingPage from './DeliveryingPage';
import DeliveryFinshPage from './DeliveryFinshPage'


/**
 * 配送任务
 */
export  default class DeliveryPage  extends Component{

     render(): React.ReactNode {
         return (
             <DeliveryTopBarNavigator/>
         );
     }
}


//配送模块导航
export const DeliveryTopBarNavigator = createMaterialTopTabNavigator({
    page1:{
        screen:DeliveryingPage,
        navigationOptions: {
            tabBarLabel: '进行中',
        }
    },
    page2:{
        screen:DeliveryFinshPage,
        navigationOptions: {
            tabBarLabel: '已完成',
        }

    },

}, {
    lazy:true,
    swipeEnabled:false,
    animationEnabled:false,
    backBehavior:"none",//不设置会导致每次按下Back键，默认回到初始页面。

    tabBarOptions: {
        activeTintColor:"#EC7E2D",
        inactiveTintColor:"#000",
        upperCaseLabel: false,
        scrollEnabled: false,
        allowFontScaling:true,
        style: {
            backgroundColor: 'white',
        },

        indicatorStyle: {
            height:2,
            backgroundColor: '#FF8247',
        },
        labelStyle: {
            fontSize: 18,
            marginTop: 10,
            marginBottom: 10,
        },

    }


});