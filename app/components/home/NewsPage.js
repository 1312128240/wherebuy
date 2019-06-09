import React, {Component} from 'react';
import {
    WebView
} from 'react-native';

import {HTTP_REQUEST} from "../../utils/config";

/**
 * 新闻页面，通过URL加载新闻
 */
export default class NewsPage extends Component {
    render() {
        let id = this.props.navigation.state.params.id;
        return (
            <WebView
                source={{uri: 'http://qnm.laykj.cn/news/index.html?newsId='+id+'&isWebView=1'}}
            />
        );
    }
}