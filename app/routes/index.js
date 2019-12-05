var express = require('express');
var router = express.Router();

//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;
//存储用户socket
var usersocket = {};
//存储忙碌用户
var busy = {};

//获取时间模块
var getcurrenttime = require('../gettime');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*socket内容*/
router.io = function(io){
  io.on('connection', function(socket){
    console.log('a user connected');
    //监听新用户加入
    socket.on('login', function(obj){
    //将userid记录，后面退出会用到
    socket.name = obj.userid;
    
    //检查socket列表，如果没有当前用户socket，则存储用户唯一标识socket
    if(!usersocket.hasOwnProperty(obj.userid)) {
      usersocket[socket.name] = socket;
    }
    
    //检查在线列表，如果不在里面就加入
    if(!onlineUsers.hasOwnProperty(obj.userid)) {
        onlineUsers[socket.name] = obj.username;
    //在线人数+1
        onlineCount++;
    }
    //向所有客户端更新(增加)在线用户列表
    io.emit('updateuser', {onlineUsers:onlineUsers, onlineCount:onlineCount});
    //console.log(usersocket);
    //console.log(obj.username+'加入了游戏大厅');
    });
     
    //监听用户退出
    socket.on('disconnect', function(){
        if(usersocket.hasOwnProperty(socket.name)) {
            delete usersocket[socket.name];
        }
        //将退出的用户从在线列表中删除
        if(onlineUsers.hasOwnProperty(socket.name)) {
            //退出用户的信息
            var obj = {userid:socket.name, username:onlineUsers[socket.name]};           
            //删除
            delete onlineUsers[socket.name];
            //在线人数-1
            onlineCount--;            
            //向所有客户端更新（删除）在线用户列表
            io.emit('updateuser', {onlineUsers:onlineUsers, onlineCount:onlineCount});
            //console.log(usersocket);
            //console.log(obj.username+'退出了聊天室');
        }
    });
    //监听用户查看在线列表
    socket.on('updateuser',function(){
        socket.emit('updateuser',{onlineUsers:onlineUsers, onlineCount:onlineCount});
    })
    //监听用户发起邀请
    socket.on('invite',function(obj){
      if(onlineUsers.hasOwnProperty(obj.userid)) {
          if(obj.userid == socket.name){
            socket.emit('Error',{msg:'不能邀请自己！'});
            return;
          }else if(busy.hasOwnProperty(obj.userid)){
            socket.emit('Error',{msg:'该用户忙碌！'});
            return;
          }else{
            var data = {
              //邀请者id
              inviteuserid:socket.name,
              //邀请者昵称
              inviteusername:onlineUsers[socket.name]
            }
            //向被邀请用户发送信息
            usersocket[obj.userid].emit('invited',data);
            //console.log(obj.userid);
        }
      }else{
        socket.emit('Error',{msg:'该用户下线或不存在！'});
      }
    });
    //监听被邀请用户是否接受邀请
    socket.on('isaccept',function(obj){
      if(obj.iscon == 1){
        //加入忙碌用户
        busy[obj.inviteid] = obj.invitename;
        busy[obj.invitedid] = obj.invitedname;
        //给邀请者发送邀请结果
        usersocket[obj.inviteid].emit('inviteresult',{code:1,data:obj});
      }else{
        //给邀请者发送邀请结果
        usersocket[obj.inviteid].emit('inviteresult',{code:0,data:obj});
      }
    });
    //监听用户发送下棋信息
    socket.on('xiaqi',function(obj){
      if(onlineUsers.hasOwnProperty(obj.toid)){
        usersocket[obj.toid].emit('xiaqi',{tdid:obj.tdid});
      }else{
        usersocket[obj.fromid].emit('Error',{msg:'该用户已下线或不存在！'});
      }
    });
    //监听用户发送游戏结束信息
    socket.on('gameend',function(obj){
      if(usersocket[obj.user.inviteid]&&usersocket[obj.user.inviteid]){
      usersocket[obj.user.invitedid].emit('gameend',obj);
      usersocket[obj.user.inviteid].emit('gameend',obj);
      delete busy[obj.user.invitedid];
      delete busy[obj.user.inviteid];
      }
    });
});
    return io;
}

module.exports = router;