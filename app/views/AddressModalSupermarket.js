import React,{Component} from 'react';
import {View, Text, Modal, TouchableOpacity, Image, FlatList,Dimensions,StyleSheet} from 'react-native';
import {HTTP_REQUEST,} from "../utils/config";
import asyncStorageUtil from "../utils/AsyncStorageUtil";

const h=Dimensions.get('window').height;

export  default class AddressModalSupermarket extends Component{

    constructor(props){
        super(props);
        this.itemlayout=this.itemlayout.bind(this);
        this.state={
            modalVisibleAddress:false,
            province:'',
            city:'',
            area:'',
            street:'',
            areaList:[],
            areaCode:'',
            accessToken:'',
            parent:'1000',

            cityParent:'',
            areaParent:'',
        }
    }

    componentDidMount(): void {
        asyncStorageUtil.getLocalData("accessToken").then(data=>{
            this.setState({
                accessToken: data,
            },()=>{
                this._getAreaData(this.props.parent)
            });
        });

    }


    render(): React.ReactNode {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.modalVisibleAddress}
                onRequestClose={() => { this.setModalVisibleAddress(false)}}
            >
                <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.6)',justifyContent: 'flex-end'}}>
                    <View style={{backgroundColor:'#FFF',height:h-100}}>
                        <View style={{height:36,borderBottomWidth: 1,borderBottomColor:'#D9D9D9',alignItems:'center', flexDirection:'row',}}>
                         {/*   <Text style={[addressModalStyle.tv_name,{width:this.state.province!==''?65:0}]}>{this.state.province}</Text>
                            <Text style={[addressModalStyle.tv_name,{width:this.state.city!==''?65:0}]}>{this.state.city}</Text>
                            <Text style={[addressModalStyle.tv_name,{width:this.state.area!==''?65:0}]}>{this.state.area}</Text>
                            <Text style={[addressModalStyle.tv_name,{width:this.state.street!==''?65:0}]}>{this.state.street}</Text>*/}

                            <TouchableOpacity style={{width:this.state.province!==''?65:0}} onPress={()=>this._clickProvince('1000')}>
                                <Text style={addressModalStyle.tv_name}>{this.state.province}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{width:this.state.city!==''?65:0}} onPress={()=>this._clickCity()}>
                                <Text style={addressModalStyle.tv_name}>{this.state.city}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{width:this.state.area!==''?65:0}} onPress={()=>this._clickArea()}>
                                <Text style={addressModalStyle.tv_name}>{this.state.area}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{width:this.state.street!==''?65:0}} onPress={()=>this._clickStreet()}>
                                <Text style={addressModalStyle.tv_name}>{this.state.street}</Text>
                            </TouchableOpacity>

                            <Text style={addressModalStyle.tv_choose}>请选择</Text>
                            <TouchableOpacity
                                onPress={()=>this.setModalVisibleAddress(false)}
                                style={{flex:1,alignItems:'flex-end',paddingRight:10}}>
                                <Image style={{width:16,height:16}} source={{uri:'http://qnm.laykj.cn/image/fork.png'}}/>
                            </TouchableOpacity>
                        </View>

                        <FlatList renderItem={this.itemlayout} data={this.state.areaList} keyExtractor={(item, index) =>index.toString()} />
                    </View>
                </View>

            </Modal>
        )
    }


    //显示与隐藏
    setModalVisibleAddress(b){
        this.setState({
            modalVisibleAddress:b,  //如果为true如果是弹出就刷新数据
            province:'',
            city:'',
            area:'',
            street:'',
            parent:'1000'
        },()=>{
            if(b===true){
                this._getAreaData()
            }
        })

    }

    //列表item
    itemlayout({item}){
        return (
            <TouchableOpacity onPress={()=>{
                if(item.level=='1'){
                    this.setState({
                        province:item.name,
                        parent:item.code,
                        cityParent:item.code,
                    },()=>this._getAreaData())
                }else if(item.level=='2'){
                    this.setState({
                        city:item.name,
                        parent:item.code,
                        areaParent:item.code,
                    },()=>this._getAreaData())
                }else if(item.level=='3'){
                    this.setState({
                        area:item.name,
                        parent:item.code,

                    },()=>this._getAreaData())
                }else if(item.level=='4'){
                    // this.setState({
                    //     street:item.name,
                    //     areaCode:item.code,
                    // },()=>this._getStreetData())

                    this.setModalVisibleAddress(false);
                    //let communityName=item.name; //最后社区超市名字
                    //let allAddress=this.state.province+this.state.city+this.state.area+this.state.street+communityName;

                    this.clickListener(item.code)
                }
                // else {
                //     this.setModalVisibleAddress(false);
                //     let communityName=item.name; //最后社区超市名字
                //     let allAddress=this.state.province+this.state.city+this.state.area+this.state.street+communityName;
                //
                //     this.clickListener(allAddress,item.smallCommunityId,item.areaCode)
                // }
            }}>
                <Text style={{fontSize:15,color:'#303030',lineHeight:30,paddingLeft:10}}>{item.name}</Text>
            </TouchableOpacity>
        )
    }

    //在子组件通过父组件的props调用父组件的方法
    clickListener=(address,smallCommunityId,areaCode)=>this.props.callback(address,smallCommunityId,areaCode);

    //获取省市区的数据
    _getAreaData(){
        fetch( HTTP_REQUEST.Host+'/area/area/getArea.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                parent:this.state.parent
            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    this.setState({
                        areaList:responseJson.data,
                    })
                }

            }).catch((error)=>{
        });
    }

    //获取具体街道位置
    _getStreetData(){
        fetch( HTTP_REQUEST.Host+'/area/SmallCommunity/getSmallCommunity.do', {
            method: 'POST',
            headers: {
                accessToken:this.state.accessToken,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                areaCode:this.state.areaCode
            }),
        })
            .then((response) => response.json())
            .then((responseJson)=>{
                if('S'==responseJson.respCode){
                    this.setState({
                        areaList:responseJson.data,
                    })
                }

            }).catch((error)=>{
        });
    }

    //点击省
    _clickProvince(parent){
       this.setState({
           parent:parent,
           province:'',
           city:'',
           area:'',
           street:'',
       },()=>this._getAreaData())
    }

    //点击市
    _clickCity(){
        this.setState({
            city:'',
            area:'',
            street:'',
            parent:this.state.cityParent
        },()=>this._getAreaData())
    }

    //点击区
    _clickArea(){
        this.setState({
            area:'',
            street:'',
            parent:this.state.areaParent,
        },()=>this._getAreaData())
    }

    //点击街道
   _clickStreet(){
       this.setState({
          // area:'',
           street:'',
       },()=>this._getAreaData())
   }

}

const addressModalStyle=StyleSheet.create({
    tv_name:{
        color:'#303030',
        textAlign:'center',
       // width:65,
    },

    tv_choose:{
        color:'#FF6600',
        lineHeight: 34,
        paddingLeft:6,
        paddingRight:6,
        borderBottomWidth:1,
        borderBottomColor:'#FF6600'
    }
})

