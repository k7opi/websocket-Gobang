
var usernamebtn = document.getElementById("usernamesubmit");
var msgbtn = document.getElementById("msgsubmit");
var logoutbtn = document.getElementById("logoutsubmit");
var newuserlist = document.getElementById("newuserlist");
var tds = document.getElementById('container').getElementsByTagName('td');

var userObj = {
    userid:null,
    username:null
}

var time={
    hour:null,
    min:null
}

var playUser = {
    inviteid:null,
    invitename:null,
    invitedid:null,
    invitedname:null
}

//存储游戏状态是否结束
var iswin = false;

//存储是否为自己的回合
var isme = false;

//存储棋子颜色
var color = {
    white: null,
    black: null
}

//存储我的颜色
var mycolor = '';
var oppcolor = '';

//对手id
var oppid = '';

usernamebtn.onclick = function(){
    usernameSubmit();
}

newuserlist.onclick = function(){
    socket.emit('updateuser');
}

//连接websocket后端服务器
var socket = io.connect('http://192.168.1.108:8000/');

//监听大厅用户变化
socket.on('updateuser', function(o){
    //清空原始数据
    $('#usernum').html('');
    $('#list').html('');

    var div = '<div>当前在线用户数：'+o.onlineCount+'</div>';
    $('#usernum').html(div);
    $('#list').append('<table></table>');
    var listhead = '<tr>'+
                    '<th>昵称</th>'+
                    '<th>id</th>'+
                    '<th>发起邀请</th>'+
                    '</tr>';
    $('#list table').append(listhead);
    for(var i in o.onlineUsers){
        $('#list table').append('<tr>'+
            '<td>'+o.onlineUsers[i]+'</td>'+
            '<td>'+i+'</td>'+
            '<td><a href="javascript:;" onclick="invite('+i+')">发起邀请</a></td>'+
        '</tr>');
    }
});

//监听错误
socket.on('Error',function(o){
    alert(o.msg)
});

//监听被邀请
socket.on('invited',function(o){
    var is=confirm('用户'+o.inviteusername+'(id:'+o.inviteuserid+')向你发出邀请，是否接受？');
    if(is){
        iswin = false;
        //接受
        var data={
            iscon: 1,
            inviteid: o.inviteuserid,
            invitename: o.inviteusername,
            invitedid: userObj.userid,
            invitedname: userObj.username
        }
        //存储邀请者（对方）
        playUser.inviteid =  o.inviteuserid;
        playUser.invitename =  o.inviteusername;
        //对手id
        oppid = o.inviteuserid;
        //存储被邀请方（自己）
        playUser.invitedid =  userObj.userid;
        playUser.invitedname =  userObj.username;
        document.getElementById("loginbox").style.display = 'none';
        document.getElementById("userbox").style.display = 'none';
        document.getElementById("playbox").style.display = 'block';
        
        //被邀请方先手(黑色棋子先手)
        isme = true;
        color.white = o.inviteuserid;
        color.black = userObj.userid;
        
        status1()
        //初始化棋盘
        newqipan();
    }else{
        //拒绝
        var data={
            iscon: 0,
            inviteid: o.inviteuserid,
            invitename: o.inviteusername,
            invitedid: userObj.userid,
            invitedname: userObj.username
        }
    }
        //向服务器发送是否接受的信息
        socket.emit('isaccept',data);
});

//监听邀请之后判断结果并准备游戏
socket.on('inviteresult',function(o){
    if(o.code==1){
        iswin = false;
        document.getElementById("loginbox").style.display = 'none';
        document.getElementById("userbox").style.display = 'none';
        document.getElementById("playbox").style.display = 'block';
        //存储邀请者（自己）
        playUser.inviteid =  userObj.userid;
        playUser.invitename =  userObj.username;
        //存储被邀请方（对方）
        playUser.invitedid =  o.data.invitedid;
        playUser.invitedname =  o.data.invitedname;
        oppid = o.data.invitedid;

        //邀请方后手(黑色棋子先手)
        isme = false;
        color.white = userObj.userid;
        color.black = o.data.invitedid;
        
        status2()
        //初始化棋盘
        newqipan();
    }else if(o.code == 0){
        alert('对方拒绝了你的邀请！');
    }
});

//监听对手下棋位置
socket.on('xiaqi',function(o){
    if(color.white == userObj.userid){
        oppcolor = 'black';
    }else oppcolor = 'white';
    var opptd = document.getElementById(o.tdid);
    opptd.style.background = 'url(' + oppcolor + '.png)';
    isme = true;
});

//监听游戏结束并判断输赢
socket.on('gameend',function(o){
    iswin = true;
    var wincolor = '';
    if(o.wincolor=='bbbbb'){
        wincolor = 'black';
        if(wincolor == mycolor) alert('你赢了！');else alert('你输了！');
        return;
    }else{
        wincolor = 'white';
        if(wincolor == mycolor) alert('你赢了！');else alert('你输了！');
        return;
    }
});

//第一个界面用户提交用户名
function usernameSubmit(){
    var u = document.getElementById("username").value;
    if(u!= ""){
        document.getElementById("username").value = '';
        document.getElementById("loginbox").style.display = 'none';
        document.getElementById("userbox").style.display = 'block';
        loginsuccess(u);
    }
    return true;
}

function loginsuccess(username){
    /*
    客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
    实际项目中，如果是需要用户登录，那么直接采用用户的uid来做标识就可以
    */
    userObj.userid = genUid();
    userObj.username = username;

    document.getElementById("showusername").innerHTML = userObj.username;
    //告诉服务器端有用户登录
    socket.emit('login', {userid:userObj.userid, username:userObj.username});
}

//生成随机id
function genUid(){
    return new Date().getTime()+""+Math.floor(Math.random()*899+100);
}

//发起邀请函数
function invite(id){
    socket.emit('invite',{userid:id});
    alert('已发送，请等待对方接受。');
}

// 负责下棋，即改变单元格的背景
var xia = function() {
    if (iswin) {
        alert('游戏结束!');
        return;
     }
    if(!isme){
        alert('不是你的回合!');
       return;
    }
    var thisid = this.id;
    var oppid = '';
    if(color.white == userObj.userid){
        mycolor = 'white';
        oppid = color.black;//获取对手id
    }else {mycolor = 'black';oppid = color.white;}

    if (this.style.background.indexOf('.png') >= 0) {
       alert('不能重复放置棋子！');
       return;
    }
    this.style.background = 'url(' + mycolor + '.png)';

    //发送下棋的位置给服务器，附带对手的id
    socket.emit('xiaqi',{fromid:userObj.userid,toid:oppid,tdid:thisid});
    isme = false;
    judge(this, mycolor); // 下完棋后判断胜负
   }

   // 判断胜负的函数
var judge = function(td,color) {
    // 找当前这颗棋的坐标
    // td在tr中索引，即是横坐标
    // tr是table的索引，即是纵坐标

    var curr = {
       x: td.cellIndex,y: td.parentElement.rowIndex,color: color};
    var line = ['', '', '', '']; //分别放置横，竖，左右下斜上棋
    // 循环225单元格
    for (var i = 0, tmp = {}; i < 225; i++) {
       // 取当前循环到的这颗棋的坐标
       tmp = {
          x: tds[i].cellIndex,
          y: tds[i].parentElement.rowIndex,
          color: '0'
       };
   
       // 取当前循环到的这颗棋的颜色，分别b,w 0（空）来表示
       if (tds[i].style.background.indexOf('black') >= 0) {
          tmp.color = 'b';
       } else if (tds[i].style.background.indexOf('white') >= 0) {
          tmp.color = 'w';
       }
   
       if (curr.y == tmp.y) {
          // 在一个横线上
          line[0] += tmp.color;
       }
       if (curr.x == tmp.x) {
          // 在一个竖线上
          line[1] += tmp.color;
       }
       if ((curr.x + curr.y) == (tmp.x + tmp.y)) {
          //在左斜线上
          line[2] += tmp.color;
       }
       if ((curr.x - tmp.x) == (curr.y - tmp.y)) {
          //在右斜线上
          line[3] += tmp.color;
       }
    }
    // 判断4条线上，有没有连续的4个w,或4个b
    color = color == 'black' ? 'bbbbb' : 'wwwww'; //赢家的颜色
   
    for (var i = 0; i < 4; i++) {
       if (line[i].indexOf(color) >= 0) {
           socket.emit('gameend',{wincolor:color,user:playUser});
          //alert(color + '胜了！(b表示黑方胜，w表示白方胜)');
          iswin = true; // 标志已经分出胜负
          break;
       }
    }
   }

   //再来一局按钮点击
   function onemoregame(){
       if(iswin){
        invite(oppid);
       }else{
           alert('当前对局未结束！');
       }
   }

   //初始化棋盘
   function newqipan(){
    for(var i = 0;i<tds.length;i++){
        tds[i].style.background = '';
    }
   }

   function status1(){
    document.getElementById('qizi').src="black.png";
 }
    function status2(){
    document.getElementById('qizi').src="white.png";
 }
   window.onload = function() {
       for(var i = 0;i<tds.length;i++){
           tds[i].setAttribute('id',i);
           tds[i].onclick = xia;
       }
   }