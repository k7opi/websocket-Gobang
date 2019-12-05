/*状态事件*/

function status1(){
    document.getElementById('qizi').src="black.png";
 }
function status2(){
    document.getElementById('qizi').src="white.png";
 }

/* 控件事件 */
function closeFunction() {
 if (confirm("是否退出游戏？")) {
    window.close();
 } else {
    history.back();
 }
}

/* 判断输赢 */

//棋子颜色函数
var cnt = (function() {
 var curr ='black';
 return function() {
    var tmp = curr;
    if (curr == 'black') {
       curr = 'white';
    } else {
       curr = 'black';
    }
    return tmp;
 }
})();

var tds = document.getElementsByTagName('td');
var iswin = false; // 有没有分出胜负

// 负责下棋，即改变单元格的背景
var xia = function() {
 // 判断是否已分出胜负
 var color = cnt();
 if (iswin) {
    alert('游戏结束!');
    return;
 }
 if (this.style.background.indexOf('.png') >= 0) {
    alert('不能重复放置棋子！');
    return;
 }
 this.style.background = 'url(' + color + '.png)';
 judge.call(this, color); // 下完棋后判断胜负
}

// 判断胜负的函数
var judge = function(color) {
 // 找当前这颗棋的坐标
 // td在tr中索引，即是横坐标
 // tr是table的索引，即是纵坐标
 var curr = {
    x: this.cellIndex,y: this.parentElement.rowIndex,color: color};
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
       alert(color + '胜了！(b表示黑方胜，w表示白方胜)');
       iswin = true; // 标志已经分出胜负
       break;
    }
 }
}
window.onload = function() {
 document.getElementsByTagName('table')[0].onclick = function(ev) {
    // 1. 下棋
    // 2. 判断胜负
    xia.call(ev.srcElement);
 };
}