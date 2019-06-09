import React, {Component} from 'react';
import {
    FlatList,
    SectionList,
    StyleSheet,
    View,
    Dimensions,
    Text, Image, TouchableOpacity,
} from 'react-native';
import asyncStorageUtil from "../../utils/AsyncStorageUtil";
import {HTTP_REQUEST, GET_CATEGORY} from "../../utils/config";
import BaseComponent from "../../views/BaseComponent";

const {width,height} = Dimensions.get('window');

/**
 * 商品分类页，分组展示商品类别等。
*/
export default class ClassificationOfGoods extends BaseComponent {

  constructor(props) {
    super(props);
    this.state = {
      accessToken:"",
      data_left:[],
      data_right:[],
      data_right_whit_child:[],
    };
  }

  componentDidMount(){
      super.componentDidMount();
      asyncStorageUtil.getLocalData("accessToken").then(data=>{
      this.setState({
        accessToken: data,
      },()=>{
          this.getCategoryInfo();
          this.getCategoryInfo2(1);
      });

    });
  }

  //获取左边的主列表
  getCategoryInfo(){
    fetch(HTTP_REQUEST.Host + GET_CATEGORY,{
      method: 'POST',
      headers: {
        'Content-Type': HTTP_REQUEST.contentType,
        'accessToken':this.state.accessToken
      },
      body: JSON.stringify({"parentId":893}),
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if(responseJson.data == null && responseJson.respCode != 'S'){
        return;
      }
      let left_data = responseJson.data;
      for(let i = 0;i < left_data.length;i++){
          left_data[i].show = i === 0;
      }
      this.setState({
        data_left:left_data
      });
    })
    .catch((error) =>{
      console.error(error);
    })
  }

  //获取右边的列表
  getCategoryInfo2(parentId){
    fetch(HTTP_REQUEST.Host + GET_CATEGORY,{
      method: 'POST',
      headers: {
        'Content-Type': HTTP_REQUEST.contentType,
        'accessToken':this.state.accessToken
      },
      body: JSON.stringify({"parentId":parentId}),
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if(responseJson.data == null && responseJson.respCode != 'S'){
        return;
      }
      let right_data = responseJson.data;
      for(let i = 0;i < right_data.length;i++){
          right_data[i].show = i === 0;
          right_data[i].key = i;
      }
      this.setState({
        data_right:right_data
      });
      this.getCategoryInfo3(responseJson.data[0].categoryId,0);
    })
    .catch((error) =>{
      console.error(error);
    })
  }

  //获取右边的列表展开内容,pos位置变更
  getCategoryInfo3(parentId,pos){
    fetch(HTTP_REQUEST.Host + GET_CATEGORY,{
      method: 'POST',
      headers: {
        'Content-Type': HTTP_REQUEST.contentType,
        'accessToken':this.state.accessToken
      },
      body: JSON.stringify({"parentId":parentId}),
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if(responseJson.data == null && responseJson.respCode != 'S'){
        return;
      }
      let right_data = this.state.data_right;
      if(right_data == null || right_data.length === 0){
        return;
      }
      let right_data_child = [{}];
      right_data_child[0].row = responseJson.data;
      //将child数据添加到右边列表中,默认只推荐第一个分类的数据。
      for(let i = 0;i < right_data.length;i++){
          if(i === pos){
              right_data[i].data = right_data_child;
          }else {
              right_data[i].data = [];
          }
      }
      this.setState({
         data_right_whit_child:right_data
      });
    })
    .catch((error) =>{
      console.error(error);
    })
  }

  render() {
    return (
      <View>
        <FlatList
            style={styles.list_left}
            data={this.state.data_left}
            renderItem={this.renderLeftListView.bind(this)}
            extraData={this.state}
            keyExtractor={(item,index) => index.toString()}/>
        <SectionList
            ref={ref => this.sectionList = ref}
            style={styles.list_right}
            renderSectionHeader={this.renderSectionListHeader.bind(this)}
            renderItem={this.renderSectionListItem.bind(this)}
            sections={this.state.data_right_whit_child}
            extraData={this.state}
            keyExtractor={(item,index) => index.toString()}/>
      </View>
    );
  }

  //左边List
  renderLeftListView({item,index}) {
      if(item.show){
          return (
              <TouchableOpacity
                  activeOpacity={0.7}
                  style={{height:40,alignItems:'center',justifyContent:'center'}}>
                  <Text style={{fontSize:18,color:'#FF8247'}}>{item.name}</Text>
              </TouchableOpacity>
          );
      }else {
          return (
              <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => this.leftListClick(index,item.categoryId)}
                  style={{height:40,alignItems:'center',justifyContent:'center'}}>
                  <Text style={{fontSize:18}}>{item.name}</Text>
              </TouchableOpacity>
          );
      }
  }

  //右边SectionList的Header
  renderSectionListHeader = (info) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => this.rightHeaderClick(info.section.categoryId,info.section.key)}
            style={{height:40,alignItems:'center',justifyContent:'center'}}>
            <Text style={{fontSize:16}}>{info.section.name}</Text>
        </TouchableOpacity>
    );
  };

  //右边SectionList子View
  renderSectionListItem = ({item}) => {
    return(
        <View>
          <FlatList
              style={{width:width*0.7}}
              data={item.row}
              numColumns={3}
              renderItem={this.renderView.bind(this)}
              keyExtractor={(item,index) => index.toString()}/>
        </View>
    );
  };

  //render三列网格List
  renderView({item}) {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => this.props.navigation.navigate('SearchGoodsPage',{name:item.name,type:3,categoryId:item.categoryId})}
            style={{width:(width*0.8)*(1/3),height:100,alignItems:'center',justifyContent:'center'}}>
            <Image style={{height:70,width:50}} source={{uri:item.logo}}/>
            <Text style={{marginTop:5}} ellipsizeMode='tail' numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
    );
  }

  //左边List点击处理
  leftListClick(index,categoryId){
      let left_data = this.state.data_left;
      for(let i = 0;i < left_data.length;i++){
          left_data[i].show = false;
      }
      left_data[index].show = true;
      this.setState({
          data_left:left_data
      });
      this.getCategoryInfo2(categoryId);
  }

  //右边Header点击处理
  rightHeaderClick(categoryId,index){
      this.getCategoryInfo3(categoryId,index);
      this.sectionList.scrollToLocation({
          sectionIndex: 0,
          itemIndex: 0,
          viewOffset:40
      });
  }
}
const styles = StyleSheet.create({
  list_left:{
    position:'absolute',
    width: width*0.2,
    height:height-100
  },
  list_right:{
    position:'absolute',
    width: width*0.8,
    left:width*0.2,
    height:height-100
  },
});