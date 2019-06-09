import { AsyncStorage } from "react-native"

/**
 * 数据存储工具
*/
export default class AsyncStorageUtil{

  //用法示例    
  //import asyncStorageUtil from '../utils/AsyncStorageUtil'
  //asyncStorageUtil.putLocalData("name","miao");
  //asyncStorageUtil.getLocalData("name","not found").then(data=>{alert(data)});

  /**
   * 存储数据
   * @param key 
   * @param value
   */
  static async putLocalData(key,value) {
    if (key != null && value != null) {
        try {
            await AsyncStorage.setItem(key, value)
        } catch (err) {
            return "put failed = "+err;
        }
    } else {
        return "Key and value can not be null";
    }
  }

  /**
   * 获取数据
   * @param key 
   * @return value
   */
  static async getLocalData(key) {
    let result = null;
    if (key != null) {
        result = await AsyncStorage.getItem(key);
        return result!=null ? result : "";
    } else {
        return "";
    }
  }
}
