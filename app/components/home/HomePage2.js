import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Image,
    Dimensions,
    TouchableOpacity,
    Text,
    ScrollView,
    NativeModules,
    Alert,
    Linking,
    Platform
} from 'react-native';
import {
    isFirstTime,
    isRolledBack,
    checkUpdate,
    downloadUpdate,
    switchVersion,
    switchVersionLater,
    markSuccess,
} from 'react-native-update';
import _updateConfig from '../../../update.json';
import Swiper from 'react-native-swiper';
import asyncStorageUtil from "../../utils/AsyncStorageUtil";
import {HTTP_REQUEST} from "../../utils/config";
import EmptyAddressModal from '../../views/EmptyAddressModal'

const {width} = Dimensions.get('window');
const {appKey} = _updateConfig[Platform.OS];

/**
 * 首页2 add 2019年5月14日
 */
export default class HomePage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            accessToken: ""
        };
    }

    /**
     * 热更新重启的确认操作。
     * isFirstTime表示当前版本第一次启动。
     * isRolledBack表示已经回滚到之前版本。
     * markSuccess()必须调用，否则本次更新会被回滚。
     */
    componentWillMount(){
        if (isFirstTime) {
            markSuccess();
        } else if (isRolledBack) {
            Alert.alert('提示', '更新失败，已经回到之前版本。');
        }
    }

    componentDidMount() {
        asyncStorageUtil.getLocalData("accessToken").then(data => {
            if (data === '') {
                this.props.navigation.navigate('AppAuthNavigator')
            }else {
                this.setState({
                    accessToken: data,
                }, () => {
                    //安装包更新检查
                    this.checkAPPUpdate();
                    //通过热更新服务检查更新
                    this.checkRNUpdate()
                });
            }
        });
        this._navListener = this.props.navigation.addListener('didFocus', () => {
            asyncStorageUtil.getLocalData("accessToken").then(data => {
                this.setState({
                    accessToken: data,
                }, () => {
                    this.getReceiveAddress();
                });
            })
        });
    }

    /**
     * 通过热更新服务检查更新。
     * 安装包更新提示，否则进行静默更新
     */
    checkRNUpdate = () => {
        checkUpdate(appKey).then(info => {
            if (info.expired) {
                //安装包更新由后台接口提示
            } else if (info.upToDate) {
                //已经是最新版本
            } else if (info.update){
                //执行静默更新
                this.doUpdate(info)
            }
        }).catch(err => {
            //检查更新失败
        });
    };

    /**
     * 下载热更新bundleJS
     */
    doUpdate = info => {
        downloadUpdate(info).then(hash => {
            Alert.alert('提示', '应用有更新，是否重启？', [
                {text: '是', onPress: ()=>{switchVersion(hash);}},
                {text: '稍后', onPress: ()=>{switchVersionLater(hash);}},
            ]);
        }).catch(err => {
            //更新失败
        });
    };

    render() {
        return (
            <View>
                <ScrollView>
                    {this.renderBanner()}
                    <View style={styles.menu_row}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.menu_row_element}
                            onPress={() => this.props.navigation.navigate('ClassificationOfGoods')}>
                            <Image style={styles.menu_row_element_img} source={{uri:'http://qnm.laykj.cn/image/woyaozai.jpg'}}/>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.menu_row_element}
                            onPress={() => this.props.navigation.navigate('NewsPage',{id:'4'})}>
                            <Image style={styles.menu_row_element_img} source={{uri:'http://qnm.laykj.cn/image/chufangzhigong.jpg'}}/>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.menu_row_element}
                            onPress={() => this.props.navigation.navigate('NewsPage',{id:'5'})}>
                            <Image style={styles.menu_row_element_img} source={{uri:'http://qnm.laykj.cn/image/linjvhuzhu.jpg'}}/>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.menu_row_element}
                            onPress={() => this.props.navigation.navigate('NewsPage',{id:'6'})}>
                            <Image style={styles.menu_row_element_img} source={{uri:'http://qnm.laykj.cn/image/zhinengzhijia.jpg'}}/>
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={{width:width * 0.4, height: 210,marginTop:10,marginLeft:6}}
                            onPress={() => this.props.navigation.navigate('PriceRankingPage')}>
                            <Image style={{width:width * 0.4, height: 210, resizeMode:'stretch'}} source={{uri:'http://qnm.laykj.cn/image/jiachapaihang.png'}}/>
                        </TouchableOpacity>
                        <View style={{flexDirection: 'column',width:width * 0.4}}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={{width:width * 0.55,marginTop:10,marginLeft:6,marginRight:6}}
                                onPress={() => this.props.navigation.navigate('NewsPage',{id:'7'})}>
                                <Image style={{width:width * 0.55, height: 100, resizeMode:'stretch'}} source={{uri:'http://qnm.laykj.cn/image/liaojiequnamai.jpg'}}/>
                            </TouchableOpacity>
                            <View style={{width:width * 0.55,marginTop:5,marginLeft:6,marginRight:6,flexDirection: 'row'}}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={{flex: 1,height: 105}}
                                    onPress={() => this.props.navigation.navigate('AroundSupermarket')}>
                                    <Image style={{width: width * 0.265,height: 105,resizeMode:'stretch'}} source={{uri:'http://qnm.laykj.cn/image/zhoubianchaoshi.jpg'}}/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={{flex: 1,height: 105}}
                                    onPress={() => this.props.navigation.navigate('RecommendPage')}>
                                    <Image style={{width: width * 0.265, height: 105,resizeMode:'stretch',marginLeft:width * 0.01}} source={{uri:'http://qnm.laykj.cn/image/tuijianshangpin.jpg'}}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.qnm_news}>去哪买资讯</Text>
                    <View style={styles.qnm_news_row}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={{width:width * 0.47,height:80,backgroundColor:"#FFC57F"}}
                            onPress={() => this.props.navigation.navigate('NewsPage',{id:'2'})}>
                            <Image style={{width: 60, height: 60,resizeMode:'stretch', marginTop:10,marginLeft:10}} source={{uri:'http://qnm.laykj.cn/image/newsImage1.png'}}/>
                            <Text numberOfLines={1} style={{position:'absolute',left:75,right: 5,top:10,color:"white"}}>去哪买|时代的...</Text>
                            <Text numberOfLines={2} style={{position:'absolute',left:75,right: 5,top:30,color:"white"}}>当今，随着移动互联网的快速发展...</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={{width:width * 0.47,height:80,backgroundColor:"#FFC57F"}}
                            onPress={() => this.props.navigation.navigate('NewsPage',{id:'3'})}>
                            <Image style={{width: 60, height: 60,resizeMode:'stretch', marginTop:10,marginLeft:10}} source={{uri:'http://qnm.laykj.cn/image/newsImage2.png'}}/>
                            <Text numberOfLines={1} style={{position:'absolute',left:75,right: 5,top:10,color:"white"}}>去哪买|愿做您...</Text>
                            <Text numberOfLines={2} style={{position:'absolute',left:75,right: 5,top:30,color:"white"}}>可以想象，如果在大海中没有罗盘...</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.qnm_news_row}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={{width:width * 0.47,height:80,backgroundColor:"#FFC57F"}}
                            onPress={() => this.props.navigation.navigate('NewsPage',{id:'0'})}>
                            <Image style={{width: 60, height: 60,resizeMode:'stretch', marginTop:10,marginLeft:10}} source={{uri:'http://qnm.laykj.cn/image/newsImage3.png'}}/>
                            <Text numberOfLines={1} style={{position:'absolute',left:75,right: 5,top:10,color:"white"}}>这个年代，服务...</Text>
                            <Text numberOfLines={2} style={{position:'absolute',left:75,right: 5,top:30,color:"white"}}>社会在发展，消费者对于服务...</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={{width:width * 0.47,height:80,backgroundColor:"#FFC57F"}}
                            onPress={() => this.props.navigation.navigate('NewsPage',{id:'1'})}>
                            <Image style={{width: 60, height: 60,resizeMode:'stretch', marginTop:10,marginLeft:10}} source={{uri:'http://qnm.laykj.cn/image/newsImage4.png'}}/>
                            <Text numberOfLines={1} style={{position:'absolute',left:75,right: 5,top:10,color:"white"}}>去哪买人都是...</Text>
                            <Text numberOfLines={2} style={{position:'absolute',left:75,right: 5,top:30,color:"white"}}>16年之时，马云讲过：“纯电商时代</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <View style={styles.top_bar}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => this.props.navigation.navigate('MyAddressPage')}
                        style={styles.top_bar_location}>
                        <Image style={styles.top_bar_location_img} source={require('../../img/location.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.top_bar_search}
                        onPress={() => this.props.navigation.navigate('SearchGoodsPage', {name: null, type: 1})}>
                        <Image style={{width: 30, height: 30}} source={require('../../img/search_icon.png')}/>
                        <Text>搜索商品</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.top_bar_scan}
                        onPress={() => this.props.navigation.navigate('ScanPage')}>
                        <Image style={styles.top_bar_scan_img} source={require('../../img/scan_qrcode.png')}/>
                    </TouchableOpacity>
                </View>
                <EmptyAddressModal ref={'EmptyAddressModal'} params={this.props.navigation}/>
            </View>
        );
    }

    //轮播图
    renderBanner(){
        return (
            <Swiper
                style={styles.banner}
                showsButtons={false}
                removeClippedSubviews={false}
                autoplay={true}
                horizontal ={true}
                paginationStyle={styles.banner_pagination}
                dotStyle={styles.banner_dot}
                activeDotStyle={styles.banner_active_dot}>
                <Image source={{uri:'http://qnm.laykj.cn/image/banner1.jpg'}} style={styles.banner_img}/>
                <Image source={{uri:'http://qnm.laykj.cn/image/banner2.jpg'}} style={styles.banner_img}/>
                <Image source={{uri:'http://qnm.laykj.cn/image/spokesman.jpg'}} style={styles.banner_img}/>
            </Swiper>
        );
    }

    //检查更新
    checkAPPUpdate() {
        fetch(HTTP_REQUEST.Host + '/getAPPUpdateInfomation', {
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken': this.state.accessToken
            },
            body: JSON.stringify({}),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if (responseJson.respCode === 'S') {
                //获取版本号 ToDo
                NativeModules.DeviceHelperModule.getAppVersion((version) =>
                    this.updateTip(version, responseJson.data)
                )
            }
        })
        .catch((error) => {})
    }

    //弹出更新提示
    updateTip(localVersion, data) {
        //需要更新（非强制）
        if ((parseFloat(localVersion) < parseFloat(data.version)) && data.force === 'false') {
            Alert.alert(
                '发现新版本',
                data.description + '',
                [{text: '去更新', onPress: () => this.openURL(data.androidDownloadLink)}],
                {cancelable: true}
            )
        }
        //需要更新（强制）
        if ((parseFloat(localVersion) < parseFloat(data.version)) && data.force === 'true') {
            Alert.alert(
                '发现新版本',
                data.description + '',
                [{text: '去更新', onPress: () => this.openURL(data.androidDownloadLink)}],
                {cancelable: false}
            )
        }
    }

    //跳转更新下载地址
    openURL(url) {
        Linking.canOpenURL(url).then(supported => {
            if (!supported) {
                this.refs.toast.show('请先安装浏览器', 1000);
            } else {
                return Linking.openURL(url);
            }
        }).catch(err => this.refs.toast.show('出现错误 ' + err, 1000))
    }

    getReceiveAddress() {
        fetch(HTTP_REQUEST.Host + '/user/address/getDefaultReceiveAddress.do', {
            method: 'POST',
            headers: {
                'Content-Type': HTTP_REQUEST.contentType,
                'accessToken': this.state.accessToken
            },
            body: JSON.stringify({}),
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.respCode !== 'S'){
                if(responseJson.errorCode === '1915'){
                    this.refs.EmptyAddressModal.setAddressModal(true);
                }else if(responseJson.errorCode === '1906'){
                    asyncStorageUtil.putLocalData("accessToken","");
                    this.props.navigation.navigate('AppAuthNavigator')
                }
            }
        })
        .catch((error) => {})
    }
}

const styles = StyleSheet.create({
    //顶部搜索栏
    top_bar: {
        width: width,
        height: 50,
        top: 0,
        position: 'absolute'
    },
    top_bar_location: {
        position: 'absolute',
        height: 30,
        width: 30,
        left: 10,
        top: 10
    },
    top_bar_location_img: {
        height: 30,
        width: 25,
    },
    top_bar_search: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        top: 5,
        height: 40,
        width: width * 0.7,
        left: width * 0.15,
        borderRadius: 45,
        backgroundColor: 'white'
    },
    top_bar_scan: {
        position: 'absolute',
        height: 30,
        width: 30,
        right: 10,
        top: 10
    },
    top_bar_scan_img: {
        height: 30,
        width: 30
    },
    //轮播图
    banner: {
        width: width,
        height:width * 40 / 75,
    },
    banner_img:{
        width: width,
        height:width * 40 / 75
    },
    banner_pagination: {
        bottom: 6,
    },
    banner_dot: {
        width: 22,
        height: 3,
        backgroundColor: '#fff',
        opacity: 0.4,
        borderRadius: 0,
    },
    banner_active_dot: {
        width: 22,
        height: 3,
        backgroundColor: '#fff',
        borderRadius: 0,
    },
    //菜单栏
    menu_row: {
        flexDirection: 'row',
        justifyContent:'space-around',
        top:5
    },
    menu_row_element:{
        width:width * 0.22,
        height: 100,
    },
    menu_row_element_img:{
        width:width * 0.22,
        height: 95,
        resizeMode: 'stretch'
    },
    //去哪买咨询
    qnm_news: {
        fontSize:16,
        marginLeft:10,
        marginTop:5,
    },
    qnm_news_row:{
        width:width,
        flexDirection: 'row',
        justifyContent:'space-around',
        marginTop:5
    },
});