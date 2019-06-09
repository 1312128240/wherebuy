/**
 * 一些常用的配置参数
 */
export const HTTP_REQUEST = {
    //Host: 'http://192.168.0.6:8080/wherebuyAPI',
    Host:'http://www.laykj.cn/wherebuyAPI',
    contentType: 'application/json;charset=utf-8',
};

export const LOGIN = "/account/account/login.do";//登录
export const USER_INFO = "/user/user/userInfo.do";//用户信息
export const SAVE_USER_INFO = "/user/user/saveUserInfo.do";//修改用户信息
export const GET_CATEGORY = "/goods/category/showCategory.do";//获取分类信息
export const GET_RANK = "/goods/goods/differenceRanking.do";//获取价差排行
export const GET_PRICE_LIST = "/goods/goods/supermarketPriceList.do";//获取商品的超市价格
export const GET_ALL_AREA = "/area/area/getAllArea.do";//获取所有地区
export const GET_COMMUNITY = "/area/SmallCommunity/getSmallCommunity.do";//获取街道所有小区
export const RECOMMEND = "/goods/goods/recommend.do";//获取首页推荐
export const SEARCH = "/goods/goods/searchByKey.do";//商品搜索
export const getValidCode = "/account/account/getValidCode.do";//获取验证码
export const addShopCar = "/goods/shopCar/addShopCar.do";//商品加入购物车
