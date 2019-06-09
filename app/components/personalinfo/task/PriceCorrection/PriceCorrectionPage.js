import React,{Component} from 'react'

import {
    View,
    Text,
    TextInput,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    FlatList,
    Modal,
    TouchableWithoutFeedback,
    Alert,
    ScrollView
} from "react-native";
import {HTTP_REQUEST} from '../../../../utils/config';

import Toast from 'react-native-easy-toast';
import RefreshListView, {RefreshState} from "react-native-refresh-list-view";
import asyncStorageUtil from "../../../../utils/AsyncStorageUtil";
import BaseComponent from "../../../../views/BaseComponent";
import Loading from '../../../../views/LoadingModal';


const w = Dimensions.get('window').width;
const h = Dimensions.get('window').height;

/**
 * 价格纠错1
 */
export  default class  PriceCorrectionPage extends BaseComponent{


    static navigationOptions = ({navigation, screenProps}) => ({
        headerTitle: '价格纠错/分享',
        headerTitleStyle: {
             flex:1,
             textAlign:'center',
        },
        headerRight:(
            <TouchableOpacity onPress={()=>{navigation.navigate("PriceCorrectionHistoryPage")}}>
                <Text style={{paddingRight:10,color:'#000000',fontSize:15}}>历史</Text>
            </TouchableOpacity>
        )
    });


    constructor(){
        super();
        this._renderItem=this._renderItem.bind(this);
        this.state={
            brandList:[],
            dataList:[],
            popWindowList:[],
            content:'',
            barcode: "",    //条形码
            brandId: "",    //品牌Id
            fullName: "",   //商品名
            valueName: "",  //规格参数
            refreshState: RefreshState.Idle,
            currentPage:1,
            totalPage:0,
            modalVisible:false,
            modalVisible2:false,
            modalDataBean2:'',
            goodsSkuId:'',
            accessToken:'',
            lookName:'',//正在查看超市价格的商品名称
        }
    }

    render(): React.ReactNode {
        return (
            <View style={{flex:1,backgroundColor:'#F3F3F3',alignItems:'center',}}>
                {this.listView()}
                {this.popWindow1()}
                {this.popWindow2()}

                <Toast
                    ref="toast"
                    style={{backgroundColor:'gray'}}
                    position='center'
                    positionValue={200}
                    textStyle={{color:'white'}}
                />
                <Loading ref={'Loading'} hide = {true} />

                {this._hintView()}


            </View>
        )

    }

    componentDidMount(): void {
        super.componentDidMount();
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            },()=>{
                this.Refresh();
            });
        });
    }

    //加载更多
    getData() {
        fetch( HTTP_REQUEST.Host+'/goods/goods/vagueGoodsSku.do', {
            method: 'POST',
            headers: {
                accessToken: this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                barcode: this.state.barcode,
                brandId: this.state.brandId,
                fullName: this.state.fullName,
                valueName: this.state.valueName,
                currentPage: this.state.currentPage,

            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                this.setState({
                    dataList: [...this.state.dataList, ...responseJson.data.data],
                    refreshState: RefreshState.Idle,
                    currentPage: this.state.currentPage+1,
                    totalPage:responseJson.data.totalPage,
                })

            }).catch((error)=>{

        });
    }

    //刷新
    Refresh(){
        fetch( HTTP_REQUEST.Host+'/goods/goods/vagueGoodsSku.do', {
            method: 'POST',
            headers: {
                accessToken: this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                barcode: this.state.barcode,
                brandId: this.state.brandId,
                fullName: this.state.fullName,
                valueName: this.state.valueName,
                currentPage: 1,
            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{

                this.setState({
                    dataList:responseJson.data.data,
                    currentPage:2,
                    totalPage:responseJson.data.totalPage,
                    refreshState: RefreshState.Idle,
                })

            }).catch((error)=>{
            // alert("价格纠错错误"+error)
        });
    }

    //头部搜索
     heaerView=()=>{
         return(
             <View style={{backgroundColor:'#FFF',alignItems:'center',justifyContent:'center',width:w,paddingTop:20,paddingBottom:20,}}>
                 <View>
                     <View style={{flexDirection:'row',width:w-80,marginTop:45,}}>
                         <TextInput
                             maxLength={11}
                             placeholder="请输入商品名"
                             style={[styles.et,{flex: 1,marginRight:10}]}
                             onChangeText={(name)=>{this.setState({fullName:name,})}}>
                         </TextInput>

                         <TextInput
                             maxLength={11}
                             placeholder="请输入规格参数"
                             style={[styles.et,{flex: 1,marginLeft:10}]}
                             onChangeText={(result)=>{this.setState({valueName:result,})}}>
                         </TextInput>

                     </View>

                     <TextInput
                         maxLength={11}
                         keyboardType="numeric"
                         placeholder="请输入条形码"
                         style={[styles.et,{width:w-80}]}
                         onChangeText={(result)=>{this.setState({barcode:result,})}}>
                     </TextInput>

                     <TouchableOpacity style={styles.btn_seach} onPress={()=>this._search()} >
                         <Text style={{color:'#FFF',fontSize:17}}>搜索</Text>
                     </TouchableOpacity>
                 </View>

                 <View style={{width:w-78,position:'absolute',top:5,}}>
                     <TextInput
                         maxLength={11}
                         placeholder="请输入品牌名"
                         value={this.state.content}
                         style={[styles.et] }
                         onChangeText={(result)=>{
                                    result==''? this.setState({brandList:[],brandId:''}):this._seachBrand(result);
                                    this.setState({content:result,})
                                }}
                     >
                     </TextInput>

                 </View>

             </View>
         )
     }

     //输入框提示面板
    _hintView(){
        if(this.state.brandList.length!=0){
            return (
                <View style={{backgroundColor:'#FFF',padding:10,borderRadius:8,width:w-80,position: 'absolute',top:65}}>
                    <FlatList
                        keyboardShouldPersistTaps={'always'}
                        renderItem={this._renderSeachItem}
                        data={this.state.brandList}
                        keyExtractor={(item, index) =>index.toString()}
                    />
                </View>
            )
        }
    }

    //商品列表
    listView=()=>{
        return (
            <RefreshListView
                keyboardShouldPersistTaps={'always'}
                renderItem={this._renderItem}
                data={this.state.dataList}
                keyExtractor={(item,index) =>index.toString()}
                ListHeaderComponent={this.heaerView()}
                refreshState={this.state.refreshState}
                showsVerticalScrollIndicator ={false}
                ListEmptyComponent={
                    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                        <Text>暂无记录!</Text>
                    </View>}
                onHeaderRefresh={()=>{
                    this.setState({
                        refreshState: RefreshState.HeaderRefreshing,
                    },()=>this.Refresh());
                }}
                onFooterRefresh={()=>{
                    this.setState({
                        refreshState: RefreshState.FooterRefreshing
                    },()=>this.getData());
                }}
            />
        )
    }


     //商品列表item
    _renderItem = ({item}) => (
       <View style={styles.itemContainer}>
           <Image source={{uri:item.image}} style={{width:95,height:100,marginRight:10,}}/>

            <View style={{justifyContent:'space-between',width:w-130,}}>
                <Text style={{fontSize: 19,color:'#303030'}} numberOfLines={2} ellipsizeMode={'tail'}>{item.fullName}</Text>

                <View style={{alignItems:'flex-end',width:w-130,paddingBottom:5}}>
                    <TouchableOpacity onPress={()=>this.clickBtn(item)}>
                        <View style={styles.btn_look}>
                            <Text style={{color: "#FFF",fontSize:16}}>查看超市价格分享</Text>
                        </View>
                    </TouchableOpacity>
                </View>

            </View>

       </View>
    );

    //点击查看价格分享button
    clickBtn(item){
        this.refs.Loading.show();
        this.setState({
            goodsSkuId:item.goodsSkuId,
            lookName:item.fullName
        },()=>this._PopWindowData(item.goodsSkuId))
    }

    //popwindow1显示与隐藏
    _setModalVisible =(visible)=>{
        this.setState({
            modalVisible: visible,
        });
    }

    //popwindow2显示与隐藏
    _setModalVisible2 =(visible)=>{
        this.setState({
            modalVisible2: visible,
        });
    }

    //搜索内容item
    _renderSeachItem=({item}) => (
        <TouchableOpacity onPress={()=>{
            this.setState({
                brandId:item.brandId,
                brandList:[],
                content:item.name,
            })
        }}>
            <Text style={{color:'#000',fontSize:16,paddingTop:6,paddingBottom:6}}>{item.name}</Text>
        </TouchableOpacity>
    )


    //开始搜索
    _search(){
        if(this.state.content==""&&this.state.brandId==''){ //输入框无内容且没有id
           // this.refs.toast.show('无输入 无id!',1000);
            this.Refresh();
        }else if(this.state.content!='') {

            if(this.state.brandId==''){
                //用户自己输入的内容不支持搜索，必须要点击提示框的内容获取id
                this.refs.toast.show('请输入正确的品牌名!',1000);
            }else {
               // this.refs.toast.show('有id,可以搜索!',1000);
                this.Refresh();
            }
        }
    }

    //输入框提示
    _seachBrand(content){
         fetch( HTTP_REQUEST.Host+'/brand/brand/searchBrand.do',{
             method: 'POST',
             headers: {
                 accessToken: this.state.accessToken,
                 'Content-Type': 'application/json;charset=UTF-8',
             },
             body: JSON.stringify({
                 brandName:content,
             }),
         }).then((response) => response.json())
             .then((responseJson)=>{
                 let tempList=responseJson.data;
                 if(tempList.length>10){
                     tempList.length=10;
                 }

                this.setState({
                    brandList:tempList,
                })
             }).catch((error)=>{
                return false;
         });
     }

   //弹窗1数据
   _PopWindowData(goodsId){
       fetch( HTTP_REQUEST.Host+'/goods/goods/priceSupermarket.do', {
           method: 'POST',
           headers: {
               accessToken:this.state.accessToken,
               'Content-Type': 'application/json;charset=UTF-8',
           },
           body: JSON.stringify({
               goodsSkuId:goodsId
           }),
       })
           .then((response) => response.json())
           .then((responseJson)=>{
               this.refs.Loading.close();
               if("S"===responseJson.respCode){
                   this.setState({
                       popWindowList:responseJson.data,
                   },()=>this._setModalVisible(true))
               }
           }).catch((error)=>{
           // alert("错误"+error)
       });
   }

    //弹窗2数据
   _PopWindowData2(correctId){
       fetch( HTTP_REQUEST.Host+'/correct/correct/view.do', {
           method: 'POST',
           headers: {
               accessToken: this.state.accessToken,
               'Content-Type': 'application/json;charset=UTF-8',
           },
           body: JSON.stringify({
               correctId:correctId
           }),
       })
           .then((response) => response.json())
           .then((responseJson)=>{
               if("S"===responseJson.respCode){
                   this.setState({
                       modalDataBean2:responseJson.data,
                   },()=>this._setModalVisible2(true))
               }else {
                   Alert.alert('温馨提示:', responseJson.errorMsg,
                       ['', '', '确定'].map((dot, index) => ({text: dot,}))
                   )
               }


           }).catch((error)=>{
           // alert("价格纠错错误"+error)
       });
   }

   //弹窗1布局
    popWindow1(){
        let viewList=[];
        this.state.popWindowList.map((bean,i)=>{
            viewList.push(
                <View style={styles.popWindowItem} key={i}>
                    <Text style={{color:'#303030',fontSize:16,flex:1.3}} numberOfLines={2} ellipsizeMode={'tail'}>{bean.name}:</Text>
                    <Text style={{color:'#303030',fontSize:16,flex:1,paddingLeft:10,}}>{this._price(bean)}</Text>
                    <TouchableOpacity style={styles.popWindow1Btn} onPress={()=>this._next(bean)}>
                        <Text style={{color:'#FFF',fontSize:16,}}>{this._status(bean.correctType)}</Text>
                    </TouchableOpacity>
                </View>
            )
        });
        return (
           <Modal
               animationType="slide"
               transparent={true}
               visible={this.state.modalVisible}
               onRequestClose={() => { this._setModalVisible(false)}}>
               <View style={{flex:1,backgroundColor:'rgba(0, 0, 0, 0.5)'}}>
                   <View style={{height:h * 0.7,width:w,marginTop:h*0.3-15}}>
                       <View style={{height:30,backgroundColor:'#FFFFFF',alignItems:'center'}}>
                           <Text style={{height:30,color:'#303030',textAlignVertical:'center',fontSize:18}}>{this.state.lookName}</Text>
                           <TouchableOpacity
                               style={{position:'absolute',right:10,top:2.5}}
                               onPress={() => this._setModalVisible(false)}>
                               <Image style={{width:25,height:25}} source={require('../../../../img/icon_close.png')}/>
                           </TouchableOpacity>
                       </View>
                       <ScrollView>
                           {viewList}
                       </ScrollView>
                   </View>
               </View>
           </Modal>
        )

    }

    //弹窗2布局
    popWindow2(){
       return (
           <Modal
               animationType="slide"
               transparent={true}
               visible={this.state.modalVisible2}
               onRequestClose={() => { this._setModalVisible2(false)}}
           >
               <TouchableWithoutFeedback onPress={()=>this._setModalVisible2(false)}>
                   <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.1)',justifyContent:'flex-end',}}>
                       <View style={{backgroundColor:'#FFF',width:w}}>
                           <View>
                               <Text style={{height:55,lineHeight: 55,textAlign: 'center',color:'#303030',fontSize:18}}>价格正在审核中</Text>
                           </View>

                           <Text style={styles.popWindowItemTv}>价格类型: {this.state.modalDataBean2.priceTypeForCha}</Text>
                           <Text style={styles.popWindowItemTv}>开始时间: {this.state.modalDataBean2.strStartTime}</Text>
                           <Text style={styles.popWindowItemTv}>结束时间: {this.state.modalDataBean2.strEndTime}</Text>
                           <Text style={styles.popWindowItemTv}>纠错人员: {this.state.modalDataBean2.nickName}</Text>
                           <Text style={[styles.popWindowItemTv,{borderBottomColor:'#DADADA',borderBottomWidth:0.5}]}>纠错价格: {(this.state.modalDataBean2.price)/100}元</Text>

                           <TouchableOpacity onPress={()=>this.recall(this.state.modalDataBean2.correctId)}>
                               <Text style={{backgroundColor:'#EC7E2D',width:85,height:32,alignSelf: 'center',
                                   color:'#FFF',textAlign:'center',marginTop:20,borderRadius:6,lineHeight:32}}>撤销</Text>
                           </TouchableOpacity>


                           <View style={{width:w,height:100}}></View>
                       </View>
                   </View>
               </TouchableWithoutFeedback>

           </Modal>
       )
   }

    //纠错，分享，查看判断
    _status(str){
        if(str=='CORRECT'){
            return '进行纠错'
        }else if(str=='VIEW'){
            return '立即查看'
        }else if(str=='SHARE'){
            return "立即分享"
        }
    }

    //价格判断
    _price(bean){
        if(bean.correctType=='SHARE'||bean.goodsPrice==null){
            return '暂无价格'
        }else{
            return (bean.goodsPrice/100)+'元'
        }
      
    }

    //点击纠错，分享，查看下一步
    _next(bean) {
        let navigate = this.props.navigation.navigate;
        if (bean.correctType ==='CORRECT') {
            this._setModalVisible(false);
            navigate('CorrectionAndSharePage', {title:'价格纠错',supermarketId:bean.supermarketId,parentId:bean.correctId,goodsSkuId:this.state.goodsSkuId})
        } else if (bean.correctType === 'VIEW') {
            this._PopWindowData2(bean.correctId)
        } else if (bean.correctType === 'SHARE') {
            this._setModalVisible(false);
            navigate('CorrectionAndSharePage', {title:'价格分享',supermarketId:bean.supermarketId,parentId:bean.correctId,goodsSkuId:this.state.goodsSkuId})
        }

    }

    //撤销价格
    recall(correctId){
        fetch( HTTP_REQUEST.Host+'/correct/correct/recall.do', {
            method: 'POST',
            headers: {
                accessToken: this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                correctId:correctId
            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{
               if("S"===responseJson.respCode){
                   this.refs.toast.show('撤回成功',1000);
                   this._setModalVisible2(false);
                   this._setModalVisible(false);
               }else {
                   Alert.alert('温馨提示:', responseJson.errorMsg,
                       ['', '', '确定'].map((dot, index) => ({text: dot,}))
                   )

               }

            }).catch((error)=>{
            // alert("价格纠错错误"+error)
        });
    }

}

const  styles=StyleSheet.create({

    et:{
        backgroundColor:'#EFEFEF',
        borderColor:'#EC7E2D',
        borderWidth:0.5,
        borderRadius:8,
        height:40,
        marginTop:20,
        paddingLeft:10,
        paddingRight:10,
    },

    itemContainer:{
        flexDirection:'row',
        backgroundColor:"#FFF",
        paddingLeft:15,
        paddingRight:15,
        paddingTop: 10,
        paddingBottom: 10,
        borderBottomWidth:0.5,
        borderBottomColor:'#D9D9D9',
    },
    popWindowItem:{
        borderTopWidth:0.5,
        borderTopColor:'#D9D9D9',
        backgroundColor:'#FFF',
        height:60,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingLeft:10,
        paddingRight:15
    },
    btn_seach:{
        alignSelf:'center',
        width:100,
        height:38,
        backgroundColor:'#EC7E2D',
        marginTop:15,
        borderRadius: 8,
        justifyContent:'center',
        alignItems:'center'
    },
    popWindowItemTv:{
        height:50,
        lineHeight:50,
       // textAlign: 'center',
        paddingLeft:15,
        paddingRight:15,
        color:'#303030',
        fontSize:16,
        borderTopWidth:0.5,
        borderTopColor:'#DADADA'
    },

    popWindow1Btn:{
        backgroundColor:'#EC7E2D',
        borderRadius:3,
        height:32,
        width:85,
        justifyContent:'center',
        alignItems:'center'
    },

    btn_look:{
        height:37,
        paddingLeft:15,
        paddingRight:15,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#EC7E2D',
        borderRadius:8
    }
})