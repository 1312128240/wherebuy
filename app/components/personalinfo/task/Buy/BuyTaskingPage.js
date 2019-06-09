import React ,{Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Modal,TextInput} from 'react-native';
import RefreshListView,{RefreshState} from 'react-native-refresh-list-view'
import {HTTP_REQUEST,} from "../../../../utils/config";
import Toast from "react-native-easy-toast";
import asyncStorageUtil from "../../../../utils/AsyncStorageUtil";
import BaseComponent from "../../../../views/BaseComponent";
import ListEmptyView from "../../../../views/ListEmptyView";


/**
 * 进行中的采买
 */
export  default  class BuyTaskingPage extends BaseComponent{

    constructor(props){
        super(props);
        this.itemlayout=this.itemlayout.bind(this);
        this.state={
            taskingPage:1,
            taskingList:[],
            totalPage:0,
            modalVisible:false,
            clickItem:'',
            flag:'',
            count:'',
            refreshState: RefreshState.Idle,
            accessToken:'',
        }
    }


    componentDidMount(): void {
        super.componentDidMount();
        this._navListener = this.props.navigation.addListener('didFocus', () => {
            asyncStorageUtil.getLocalData("accessToken").then(data=>{
                this.setState({
                    accessToken: data,
                },()=>{
                    this._Refresh();
                });
            });
        })

    }

    render(): React.ReactNode {
        return (
            <View style={{flex:1}}>
                {this._modalView()}
                {this._listView()}

                <Toast
                    ref="toast"
                    style={{backgroundColor:'gray'}}
                    position='bottom'
                    positionValue={200}
                    textStyle={{color:'white'}}
                />
          </View>
        );
    }

    _listView(){
          if(this.state.taskingList.length===0){
              return <ListEmptyView hint={"暂无任务"} />
          }else {
              return (
                  <RefreshListView
                      data={this.state.taskingList}
                      keyExtractor={(item, index) =>index.toString()}
                      renderItem={this.itemlayout}
                      refreshState={this.state.refreshState}
                      showsVerticalScrollIndicator = {false}
                      onHeaderRefresh={()=>{
                          this.setState({
                              refreshState: RefreshState.HeaderRefreshing,
                          },()=>this._Refresh());
                      }}
                      onFooterRefresh={()=>{
                          this.setState({
                              refreshState: RefreshState.FooterRefreshing
                          },()=>this.getData());
                      }}
                  />
              )
          }

    }

    //刷新
    _Refresh(){
        fetch( HTTP_REQUEST.Host+'/procurement/procurement/getCommunityPros.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                currentPage:1,
                pageSize: 5,
                procureStatus: "PROCURING"
            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    this.setState({
                        taskingList:responseJson.data.data,
                        taskingPage:2,
                        totalPage:responseJson.data.totalPage,
                        refreshState: RefreshState.Idle,
                    })
                }

            }).catch((error)=>{
        });
    }

    //加载更多和下拉刷新
    getData(){
        fetch( HTTP_REQUEST.Host+'/procurement/procurement/getCommunityPros.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                currentPage: this.state.taskingPage,
                pageSize: 5,
                procureStatus: "PROCURING"
            }),
        }).then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    this.setState({
                        taskingList: [...this.state. taskingList, ...responseJson.data.data],
                        refreshState: RefreshState.Idle,
                        taskingPage: this.state.taskingPage+1,
                        totalPage:responseJson.data.totalPage,
                    })
                }

            }).catch((error)=>{
        });
    }

    itemlayout({item}){
        return(
            <View>

                <View style={taskStyle.itemLayout}>

                    <Image style={{width:110,height:110,marginRight:8}} source={{uri:item.goodsImage}}/>

                    <View style={{justifyContent:'space-between',width:w-138,}}>
                        <Text style={{fontSize:18,color:'#303030'}} numberOfLines={2}>{item.goodsSkuName}</Text>
                        <Text style={taskStyle.tv}>单价: {(item.price)/100}元</Text>
                        <Text style={taskStyle.tv}>数量: x{item.totalQuantity}</Text>
                        <Text style={taskStyle.tv}>合计: {(item.totalPrice)/100}元</Text>
                    </View>
                </View>

              <View style={taskStyle.itemfooter}>
                    <TouchableOpacity style={this.state.flag=='3'&&this.state.clickItem==item?taskStyle.isCheckTv:taskStyle.footerTv}
                                      onPress={()=>this._click(item,'3')}>
                        <Text style={{color:this.state.flag=='3'&&this.state.clickItem==item?'#FFF':'#9A9A9A', fontSize:16,}}>缺货</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={this.state.flag=='1'&&this.state.clickItem==item?taskStyle.isCheckTv:taskStyle.footerTv}
                                      onPress={()=>this._click(item,'1')}>
                        <Text style={{color:this.state.flag=='1'&&this.state.clickItem==item?'#FFF':'#9A9A9A', fontSize:16,}}>价高未买</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={this.state.flag=='2'&&this.state.clickItem==item?taskStyle.isCheckTv:taskStyle.footerTv}
                                      onPress={()=>this._click(item,'2')}>
                        <Text style={{color:this.state.flag=='2'&&this.state.clickItem==item?'#FFF':'#9A9A9A', fontSize:16,}}>已买</Text>
                    </TouchableOpacity>
                </View>

            </View>
        )
    }

    setModalVisible(visible) {
        this.setState({
            modalVisible: visible,
        });

        if(visible==false){
            this.setState({
                flag:''
            })
        }
    }

    //确认已买和缺货弹窗
    _modalView(){
        return(
            <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => { this.setModalVisible(false)}}
            >
                <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)',padding:40,alignItems:'center',justifyContent:'center',}}>
                    <View style={taskStyle.modal}>

                        <TouchableOpacity style={{alignSelf:'flex-end',margin:2}} onPress={()=>this.setModalVisible(false)}>
                            <Image style={{width:36,height:36,}} source={{uri:'http://192.168.0.6/image/jiucuo.png'}}/>
                        </TouchableOpacity>

                        {this._modalChildView()}

                        <TouchableOpacity onPress={()=>this._sureAleryBuy()}>
                            <Text style={{color:'#EC7E2D',fontSize:17,fontWeight: '700',}}>确定</Text>
                        </TouchableOpacity>

                    </View>
                </View>

            </Modal>
        )
    }

    //是否显示输入框
    _modalChildView(){
        if(this.state.flag=='3'){
            return (
                <TextInput style={{width:220,height:40,marginBottom:10,borderRadius:8,borderColor:"#D9D9D9",borderWidth: 0.5}}
                    keyboardType="numeric"
                    onChangeText={(number) => this.setState({count:number})}
                    placeholder="请输入采买数量">
                </TextInput>
            )
        }else {
            return (
                <Text style={{color:'#303030',fontSize:19,height:40,marginBottom:10}}>请确认</Text>
            )
        }
    }


    /**
     * flag:1为价高未买，flag:2,确认已买，flag:3缺货
     * @param item
     * @param flag
     * @private
     */
    _click(item,flag){
        this.setState({
            clickItem:item,
            flag:flag,
            count:0,
        },()=> this.setModalVisible(true))
    }

    //确定已买或价高未买
    _sureAleryBuy(){
        let status = '';
        let quantity=null;
        if(this.state.flag=='1'){
            quantity=null;
            status = 'PRICE_HIGH';
        }else if(this.state.flag=='2'){
            quantity=this.state.clickItem.totalQuantity;
            status = 'BOUGHT';
        }else if(this.state.flag=='3'){
            if(this.state.count<this.state.clickItem.totalQuantity){
                if(this.state.count<0||this.state.count==''){
                    this.refs.toast.show('采买数量不能小于0',1000)
                    return;
                }else {
                    quantity=this.state.count;
                }
            }else if(this.state.clickItem.totalQuantity==this.state.count){
                quantity=this.state.clickItem.totalQuantity;
            }else if(this.state.count>this.state.clickItem.totalQuantity){
                quantity=this.state.clickItem.totalQuantity;
            }
            status = 'LACK';
        }
        //提交数据
        fetch( HTTP_REQUEST.Host+'/procurement/procurement/updateProcurStatus.do', {
            method: 'POST',
            headers: {
                accessToken: this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                goodsSkuId: this.state.clickItem.goodsSkuId,
                procurementTaskIdList: this.state.clickItem.procurementTaskIdList,
                quantity: quantity,
                status:status,
            }),
        })
        .then((response) => response.json())
        .then((responseJson)=>{
            if('S'===responseJson.respCode){
                this._Refresh();
                this.setModalVisible(false)
              /*  if(this.state.flag!='1'){
                    //刷新页面
                    this._Refresh();
                    this.setModalVisible(false)
                   // this.props.navigation.navigate('taskpage2',)
                }*/
            }

        }).catch((error)=>{});
    }
}

const  w=Dimensions.get('window').width;
const h=Dimensions.get('window').height;

const taskStyle=StyleSheet.create({

    titleLayout:{
        flexDirection:'row',
        paddingLeft:50,
        paddingRight:50,
        paddingTop:10,
        paddingBottom:10,
        justifyContent:'space-between',
        borderBottomWidth:0.5,
        borderBottomColor:'#D9D9D9'
    },

    tv_title:{
        color:'#999999',
        fontSize:18,
    },
    itemLayout:{
        flexDirection:'row',
        paddingLeft:10,
        paddingRight:10,
        paddingTop:6,
        paddingBottom:6,
    },

    itemfooter:{
        flexDirection: 'row',
        justifyContent:'space-between',
        paddingLeft:15,paddingRight:15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#D9D9D9',
        paddingBottom:10,
        paddingTop:6,
    },

    footerTv:{
        width:100,
        height:33,
        justifyContent:'center',
        alignItems:'center',
        borderRadius:30,
        borderWidth:1,
        borderColor:'#9A9A9A',
    },

    isCheckTv:{
        width:100,
        height:33,
        justifyContent:'center',
        alignItems:'center',
        borderRadius:30,
        backgroundColor:'#EC7E2D',
    },

    tv:{
        fontSize:15,
        color:'#303030',
    },

    modal:{
       // justifyContent:'space-between',
        alignItems:'center',
        backgroundColor:'#FFF',
        width:280,
        height:120,
        borderRadius:8,
       // padding: 120,
    }
})