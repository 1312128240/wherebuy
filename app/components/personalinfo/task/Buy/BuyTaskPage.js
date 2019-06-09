
import React,{Component} from 'react';
import {createMaterialTopTabNavigator} from "react-navigation";
import BuyTaskingPage from './BuyTaskingPage';
import BuyTaskFinshPage from './BuyTaskFinshPage';
import AwaitSendGoodsPage from './AwaitSendGoodsPage'


/**
 * 采买任务
 */
export  default  class  BuyTaskPage extends Component{

      render(): React.ReactNode {
          return (
             <TaskTopBarNavigator/>
          );
      }
}

//采买模块
export const TaskTopBarNavigator = createMaterialTopTabNavigator({
     taskpage1:{
        screen:BuyTaskingPage,
        navigationOptions: {
            tabBarLabel: '进行中',
        }
    },
    taskpage2:{
        screen:AwaitSendGoodsPage,
        navigationOptions: {
            tabBarLabel: '待发货',
        }
    },

    taskpage3:{
        screen:BuyTaskFinshPage,
        navigationOptions: {
            tabBarLabel: '已完成',
        }
    },

}, {
    lazy:true,
    swipeEnabled:false,
    animationEnabled:false,
    pressColor:"#EC7E6A",
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
            height: 2,
            backgroundColor: '#FF8247',
        },
        labelStyle: {
            fontSize: 18,
            marginTop: 6,
            marginBottom: 6,
        },
    }
});