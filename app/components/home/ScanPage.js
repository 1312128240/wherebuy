import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    InteractionManager,
    Animated,
    Easing,
    Dimensions,
    Platform
} from 'react-native';
import {RNCamera} from 'react-native-camera';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

/**
 * 商品条码扫描界面
 */
export default class ScanPage extends Component{

    constructor(props) {
        super(props);
        this.state = {
            show:false,
            animation: new Animated.Value(0),
        };
    }

    componentDidMount(){
        //延迟加载、否则会出现卡顿
        setTimeout(() => {
            this.setState({
                show:true
            },()=>{
                InteractionManager.runAfterInteractions(()=>{
                    this.startAnimation()
                });
            });
        }, 500)
    }

    startAnimation(){
        this.state.animation.setValue(0);
        Animated.timing(this.state.animation,{
            toValue:1,
            duration:1500,
            easing:Easing.linear,
        }).start(()=>this.startAnimation());
    }

    render() {
        let scanView = null;
        if (Platform.OS === 'ios') {
            scanView = (
                <RNCamera
                    style={styles.preview}
                    captureAudio={false}
                    type={RNCamera.Constants.Type.back}
                    barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
                    flashMode={RNCamera.Constants.FlashMode.auto}
                    onBarCodeRead={(e) => this.barcodeReceived(e)}>
                    <View style = {{height: (height-264)/3, width:width, backgroundColor:'rgba(0,0,0,0.5)',}}/>
                    <View style={{flexDirection:'row'}}>
                        <View style={styles.itemStyle}/>
                        <View style={styles.rectangle}>
                            <Animated.View style={[styles.animatedStyle, {
                                transform: [{
                                    translateY: this.state.animation.interpolate({
                                        inputRange: [0,1],
                                        outputRange: [0,200]
                                    })
                                }]
                            }]}/>
                        </View>
                        <View style={styles.itemStyle}/>
                    </View>
                    <View style={{flex:1,backgroundColor:'rgba(0, 0, 0, 0.5)',width:width,alignItems:'center'}}>
                        <Text style={styles.textStyle}>将二维码放入框内，即可自动扫描</Text>
                    </View>
                </RNCamera>
            )
        } else {
            scanView = (
                <RNCamera
                    style={styles.preview}
                    captureAudio={false}
                    type={RNCamera.Constants.Type.back}
                    googleVisionBarcodeType={RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.QR_CODE}
                    flashMode={RNCamera.Constants.FlashMode.auto}
                    onBarCodeRead={(e) => this.barcodeReceived(e)}>
                    <View style = {{height: (height-244)/3, width:width, backgroundColor:'rgba(0,0,0,0.5)',}}/>
                    <View style={{flexDirection:'row'}}>
                        <View style={styles.itemStyle}/>
                        <View style={styles.rectangle}>
                            <Animated.View style={[styles.animatedStyle, {
                                transform: [{
                                    translateY: this.state.animation.interpolate({
                                        inputRange: [0,1],
                                        outputRange: [0,200]
                                    })
                                }]
                            }]}/>
                        </View>
                        <View style={styles.itemStyle}/>
                    </View>
                    <View style={{flex:1,backgroundColor:'rgba(0, 0, 0, 0.5)',width:width,alignItems:'center'}}>
                        <Text style={styles.textStyle}>将二维码放入框内，即可自动扫描</Text>
                    </View>
                </RNCamera>
            )
        }
        if(this.state.show){
            return (
                <View style={styles.container}>
                    {scanView}
                </View>
            );
        }else {
            return (
                <View/>
            );
        }
    }

    //将数据传递给商品搜索页面
    barcodeReceived(e) {
        this.props.navigation.replace('SearchGoodsPage',{name:e.data,type:2})
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black'
    },
    preview: {
        flex: 1,
    },
    itemStyle:{
        backgroundColor:'rgba(0,0,0,0.5)',
        width:(width-200)/2,
        height:200
    },
    textStyle:{
        color:'#fff',
        marginTop:20,
        fontWeight:'bold',
        fontSize:18
    },
    animatedStyle:{
        height:2,
        backgroundColor:'#00c050'
    },
    rectangle: {
        height: 200,
        width: 200,
    }
});