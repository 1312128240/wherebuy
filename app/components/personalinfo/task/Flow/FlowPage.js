import React,{Component} from 'react';
import {createMaterialTopTabNavigator} from 'react-navigation';
import FlowingPage from './FlowingPage';
import FlowAwaitSendGoods from './FlowAwaitSendGoodsPage';
import FlowFinshPage from './FlowFinshPage';

/**
 * 流转中心路由
 */
export  default class FlowPage extends Component{

    render(): React.ReactNode {
        return (
            <FlowTopBarNavigator/>
        );
    }
}


export const FlowTopBarNavigator = createMaterialTopTabNavigator({
    flowpage1:{
        screen:FlowingPage,
        navigationOptions: {
            tabBarLabel: '进行中',
        }
    },
    flowpage2:{
        screen:FlowAwaitSendGoods,
        navigationOptions: {
            tabBarLabel: '待发货',
        }
    },

    flowpage3:{
        screen:FlowFinshPage,
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
            height: 2,
            backgroundColor: '#FF8247',
        },
        labelStyle: {
            fontSize: 19,
            marginTop: 6,
            marginBottom: 6,
        },
    }
});