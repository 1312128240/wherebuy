
/**
 * 将时间戳转 年月日，时分秒
 */
 export function dateToString(time,format){
     let date = new Date(time);
     let Y = date.getFullYear() + '-';
     let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    // let D=date.getDate()+" ";
     let D=(date.getDate()< 10 ? '0'+(date.getDate()) : date.getDate())+ ' '
    // let h = date.getHours() + ':';
     let h=(date.getHours()< 10 ? '0'+(date.getHours()) : date.getHours())+':';
    // let m = date.getMinutes() + ':';
    let m=(date.getMinutes()< 10 ? '0'+(date.getMinutes()) : date.getMinutes());
    // let s = date.getSeconds();
    let s=(date.getSeconds()< 10 ? '0'+(date.getSeconds()) : date.getSeconds());

     if(format==='yyyy-MM-dd hh:mm:ss'){
         return Y+M+D+" "+h + m+":"+s;
     }else if(format==='yyyy-MM-dd'){
         return Y+M+D;
     }else if(format==="yyyy-MM-dd hh:mm"){
         return Y+M+D+""+h + m;
     }else if(format==="MM-dd hh:mm"){
         return M+D+""+ h + m;
     }else if(format==="yyyy/MM/dd"){
         return Y+M+D;
     }
 }


 /**
 * 在当前时间加上 num 年
 */
export function getNextYear(num){
      let now = new Date();
      now.setFullYear(now.getFullYear()+num);
      return dateToString(now,'yyyy-MM-dd');
}




  /**
   * 获取下一个月
   *
   * @date 格式为yyyy-mm-dd的日期，如：2019-04-25
   */
  export function getNextMonth(date){
      let arr = date.split('-');
      let year = arr[0]; //获取当前日期的年份  
      let month = arr[1]; //获取当前日期的月份  
      let day = arr[2]; //获取当前日期的日  
      let days = new Date(year, month, 0);
      days = days.getDate(); //获取当前日期中的月的天数  
      let year2 = year;
      let month2 = parseInt(month) + 1;
      if (month2 == 13) {
          year2 = parseInt(year2) + 1;
          month2 = 1;
      }
      let day2 = day;
      let days2 = new Date(year2, month2, 0);
      days2 = days2.getDate();
      if (day2 > days2) {
          day2 = days2;
      }
      if (month2 < 10) {
          month2 = '0' + month2;
      }

      let t2 = year2 + '-' + month2 + '-' + day2;
      return t2;
  }

 /**
 * 获取当前年月日字符串
 * @date 格式为yyyy-mm-dd的日期，如：2019-04-25 04:10
 */
export function getCurrentDate() {

    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let strDate = date.getDate();
    let strHours =date.getHours();
    let strMinutes=date.getMinutes();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }

    if(strHours>=0&&strHours<=9){
        strHours='0'+strHours;
    }

    if(strMinutes>=0&&strMinutes<=9){
        strMinutes='0'+strMinutes;
    }

    let currentdate = year + '-' + month + '-' + strDate+" "+strHours+':'+strMinutes;
    return currentdate;
}


