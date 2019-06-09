import React,{Component} from 'react';
import {View,Text} from 'react-native';

/**
 * ListView空白提示
 */
export default class ListEmptyView extends Component{

    render(): React.ReactNode {
        return (
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <Text>{this.props.hint}</Text>
            </View>
        );
    }

}