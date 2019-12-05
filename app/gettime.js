module.exports = ()=>{ 
        //创建对象  
        var date = new Date();  
        //获取年份  
        var y = date.getFullYear(); 
        //获取月份  返回0-11     
        var m =date.getMonth()+1; 
        // 获取日   
        var d = date.getDate();
        //获取星期几  返回0-6   (0=星期天)   
        var w = date.getDay();    
        //星期几
        var ww = ' 星期'+'日一二三四五六'.charAt(date.getDay()) ;
        //时
        var h = date.getHours();
        //分  
        var minute = date.getMinutes() 
        //秒 
        var s = date.getSeconds(); 
        //毫秒
        var sss = date.getMilliseconds() ;
         
        if(m<10){
        m = "0"+m;
        }
        if(d<10){
        d = "0"+d;
        }
        if(h<10){
        h = "0"+h;
        }
        if(minute<10){
        minute = "0"+minute;
        } 
        if(s<10){
        s = "0"+s;
        }
        
        if(sss<10){
        sss = "00"+sss;
        }else if(sss<100){
        sss = "0"+sss;
        }
        return y+"-"+m+"-"+d+" "+h+":"+minute+":"+s;  
}