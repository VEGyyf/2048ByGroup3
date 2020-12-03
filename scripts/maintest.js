var board = [];
var score = 0;
var hasCollide = []; // 检测当前格是否已发生碰撞生成新的数
var uid=Math.round(Math.random()*10000);
var startx = 0;
var starty = 0;
var endx = 0;
var endy = 0;
var myid,myidinroom,myroomid;
var canstart=0;//房间人齐了，可以开始游戏了，0就是不能开始
var testtemmp;
var isConnected = false; // websocket
var ws;
var flag1 = true;
var flag2 = true;
var userCnt;
var strtemp;
var formed_data={
    "type":"client_to_server",
    "userid":"null",//用户的id
    "roomid":"null",//用户所在的房间号
    "idinroom":"null",//用户在指定房间中的编号
    "operation":"null",//发送board数组，申请开始游戏时发送null
    "score":0//用户分数

}
var data_to_send=formed_data;
data_to_send["userid"]=uid;
ws = new WebSocket('ws://127.0.0.1:8001');
ws.onopen = function(e){
    let _str=JSON.stringify(data_to_send);
    ws.send(_str);
    isConnected = true;

}
ws.onclose = function(e){
    alert("连接断开");
}
ws.onerror = function(){
    alert("连接出错");
}
ws.onmessage = function(e){    //接收的消息,应该是同一房间内其他三个用户的board棋盘布局
   if(JSON.parse(e.data)["roomid"]=="denied")
   {
    alert("目前不可进行游戏，请稍后再试！");
    ws.close();
   }
   else if(JSON.parse(e.data)["type"]=="client_to_server")
   {
     data_to_send["roomid"]=JSON.parse(e.data)["roomid"];
     data_to_send["idinroom"]=JSON.parse(e.data)["idinroom"];
     myroomid=JSON.parse(e.data)["roomid"];
     myidinroom=JSON.parse(e.data)["idinroom"];
     //能不能让客户端先不能操作，然后等待可以操作的指令
    //alert(JSON.stringify(formed_data));//test
   } 
   else if(JSON.parse(e.data)["type"]=="server_to_client")//收到更新消息
   {
    //根据接收到的json，把房间内四个玩家的棋盘都获取
    testtemp=e.data;
    if(myroomid ==JSON.parse(e.data)["roomid"] ){//针对本房间的情报
        //TODO:轮询三个窗口，若userid对应，则渲染对应窗口，若都无，则选择一个空闲的窗口渲染
        mini=JSON.parse(e.data)["operation"];
        updateMiniBoardView(mini,k);//
    }

   }  
}
setInterval(function(){
    data_to_send["operation"]=board;
 ws.send(JSON.stringify(data_to_send));
 console.log("success"); 
}, 100);


$(document).ready(function(){
    prepareForMobile();
    newGame();
});

function prepareForMobile(){
    if(documentWidth<768){
        $("#grid-container").css({
            'width': gridContainerWidth-2*cellSpace,
            'height': gridContainerWidth-2*cellSpace,
            'padding': cellSpace,
            'border-radius': 0.02*gridContainerWidth
        });
        $(".grid-cell").css({
            'width': cellSideLength,
            'height': cellSideLength,
            'border-radius': 0.02*cellSideLength
        });

    }
}

function newGame(){
    //   初始化棋盘
        init();
    //    随机生成数字
        var randx; 
        var randy; 
        for(var i=0;i<2;i++){
            randx= parseInt(Math.floor(Math.random() * 4));
            randy= parseInt(Math.floor(Math.random() * 4));
            while(true){
                if(board[randx][randy] == 0)
                    break;
                randx = parseInt(Math.floor(Math.random() * 4));
                randy = parseInt(Math.floor(Math.random() * 4));
            }
    
            //随机一个数字
            var randNumber = Math.random() < 0.5?2:4;
    
            //在随机的位置显示随机数字
            board[randx][randy]=randNumber;
            showNumberWithAnimation(randx,randy,randNumber);
        }
    }

function init(){
    for(var i=0;i<4;i++){
        for(var j=0;j<4;j++){
            var cell = $('#grid-cell-'+i+'-'+j);
            cell.css('top',getTop(i,j));
            cell.css('left',getLeft(i,j));
        }
    }
    for(var k=1;k<4;k++){
        for(var i=0;i<4;i++){
            for(var j=0;j<4;j++){
                var minicell = $('#mini-grid-cell-'+k+'-'+i+'-'+j);
                minicell.css('top',getMiniTop(i,j));
                minicell.css('left',getMiniLeft(i,j));
            }
        }
    }
    for(var i=0;i<4;i++){
        board[i]=new Array();
        hasCollide[i] = new Array();
        for(var j=0;j<4;j++){
            board[i][j]=0;
            hasCollide[i][j] = false;
        }
    }
    updateBoardView();
    score = 0;
    updateScore(score);
    //缩略图
    var initmini=[];
    for(var i=0;i<4;i++){
        initmini[i]=new Array();
        //hasCollide[i] = new Array();
        for(var j=0;j<4;j++){
            initmini[i][j]=0;
            //hasCollide[i][j] = false;
        }
    }
    for(var i=1;i<4;i++){
        updateMiniBoardView(initmini,i);
    }
}

// 根据数组渲染棋盘
function updateBoardView(){

    $(".number-cell").remove();
    for(var i=0;i<4;i++)
    {
        for(var j=0;j<4;j++){
            $("#grid-container").append('<div class="number-cell" id="number-cell-'+i+'-'+j+'"></div>');
            var numberCell = $('#number-cell-'+i+'-'+j);

            if(board[i][j] == 0){
                numberCell.css({
                    'width':'0px',
                    'height':'0px',
                    'left': getLeft(i,j)+0.5*cellSideLength,
                    'top': getTop(i,j)+0.5*cellSideLength
                })
            }
            else{
                numberCell.css({
                    'width': cellSideLength,
                    'height': cellSideLength,
                    'left': getLeft(i,j),
                    'top': getTop(i,j),
                    'background-color': getNumberBackgroundColor(board[i][j]),
                    'color': getNumberColor(board[i][j])
                }).text(board[i][j]);
            }

            hasCollide[i][j] = false;
        }
    }

    if(documentWidth<768){
        $(".number-cell").css({

            'font-size': 0.6*cellSideLength+'px',
            'line-height': cellSideLength+'px',
            'border-radius': 0.02*cellSideLength
        })
    }
       


}
// 渲染缩略图
function updateMiniBoardView(mini,k){

    $(".mini-number-cell").remove();
    for(var i=0;i<4;i++)
    {
        for(var j=0;j<4;j++){
            $("#images"+'k').append('<div class="mini-number-cell" id="mini-number-cell-'+k+'-'+i+'-'+j+'"></div>');
            var mininumberCell = $('#mini-number-cell-'+k+'-'+i+'-'+j);

            if(mini[i][j] == 0){
                mininumberCell.css({
                    'width':'0px',
                    'height':'0px',
                    'left': getLeft(i,j)+0.5*cellSideLength,
                    'top': getTop(i,j)+0.5*cellSideLength
                })
            }
            else{
                mininumberCell.css({
                    'width': cellSideLength,
                    'height': cellSideLength,
                    'left': getLeft(i,j),
                    'top': getTop(i,j),
                    'background-color': getNumberBackgroundColor(mini[i][j]),
                    'color': getNumberColor(mini[i][j])
                }).text(mini[i][j]);
            }

            //hasCollide[i][j] = false;
        }
    }

    if(documentWidth<768){
        $(".mini-number-cell").css({

            'font-size': 0.6*cellSideLength+'px',
            'line-height': cellSideLength+'px',
            'border-radius': 0.02*cellSideLength
        })
    }
}


function generateOneNumber(){//根据难度选择分别生成1，2，3个
    //if(nospace(board))
    //   return false;
    var flag=true;
    var rank=$('#rank option:selected').val();
    //随机一个位置
    var randx; 
    var randy; 
    for(var i=0;i<rank;i++){
        randx= parseInt(Math.floor(Math.random() * 4));
        randy= parseInt(Math.floor(Math.random() * 4));
        while(true){//死循环
            if(board[randx][randy] == 0)
                break;
            if(nospace(board))
            {
                flag=false;
                break;
            }
            randx = parseInt(Math.floor(Math.random() * 4));
            randy = parseInt(Math.floor(Math.random() * 4));
        }
        if(flag){
            //随机一个数字
            var randNumber = Math.random() < 0.5?2:4;

            //在随机的位置显示随机数字
            board[randx][randy]=randNumber;
            showNumberWithAnimation(randx,randy,randNumber);
        }
        else{
            break;
        }
    }
    return flag;
}

$(document).keydown(function(event){

    switch(event.keyCode) {
        case 37: // left
            event.preventDefault();
            if(moveLeft()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
            break;
        case 38: //up
            event.preventDefault();
            if(moveUp()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
            break;
        case 39: //right
            event.preventDefault();
            if(moveRight()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
            break;
        case 40: // down
            event.preventDefault();
            if(moveDown()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
            break;
        default:
            break;
    }
    //每次按下按键都发送状态给服务器
    data_to_send["operation"]=board;

});

var gridobj = document.getElementById('grid-container');

gridobj.addEventListener('touchstart',function(event){
    startx = event.touches[0].pageX;
    starty = event.touches[0].pageY;
});

gridobj.addEventListener('touchmove',function(event){
    event.preventDefault();
});

gridobj.addEventListener('touchend',function(event){
    endx = event.changedTouches[0].pageX;
    endy = event.changedTouches[0].pageY;

    var deltax = endx-startx;
    var deltay = endy-starty;

    if(Math.abs(deltax)<0.03*documentWidth && Math.abs(deltay)<0.03*documentWidth){
        return;
    }
    if(Math.abs(deltax)>=Math.abs(deltay)){
    //    x
        if(deltax>0){
        //    move right
            if(moveRight()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
        }
        else{
        //    move left
            if(moveLeft()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
        }
    }
    else{
    //    y
        if(deltay>0){
        //    move down
            if(moveDown()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
        }
        else{
        //    move up
            if(moveUp()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
        }
    }
});

function isgameover(){
    if(nospace(board) && nomove(board))
        gameover();
}

function gameover(){
    alert('Game over!');
}

function moveLeft(){

    if(!canMoveLeft(board))
        return false;

//    move left operate
    for(var i=0;i<4;i++){
        for(var j=1;j<4;j++){
            if(board[i][j]!=0){

               for(var k=0;k<j;k++){
                   if(board[i][k] == 0 && noBlockHorizontal(i,k,j,board)){
                   //    move
                       showMoveAnimation(i,j,i,k);
                       board[i][k]=board[i][j];
                       board[i][j]=0;

                       continue;
                   }
                   else if(board[i][k] == board[i][j] && noBlockHorizontal(i,k,j,board) && !hasCollide[i][k]){
                   //    move
                       showMoveAnimation(i,j,i,k);
                   //    add
                       board[i][k]=board[i][j]*2;
                       board[i][j]=0;
                       // update score
                       score += board[i][k];
                       updateScore(score);
                       hasCollide[i][k] = true;
                       continue;
                   }
               }
            }
        }
    }

    setTimeout("updateBoardView()",200);

    return true;
}

function moveRight(){

    if(!canMoveRight(board))
        return false;

//    move right
    for(var i=0;i<4;i++){
        for(var j=2;j>=0;j--){
            if(board[i][j]!=0){

                for(var k=3;k>j;k--){
                    if(board[i][k]==0 && noBlockHorizontal(i,j,k,board)){
                        showMoveAnimation(i,j,i,k);
                        board[i][k]=board[i][j];
                        board[i][j]=0;

                        continue;
                    }
                    else if(board[i][k]==board[i][j] && noBlockHorizontal(i,j,k,board) && !hasCollide[i][k]){
                        //    move
                        showMoveAnimation(i,j,i,k);
                        //    add
                        board[i][k]=board[i][j]*2;
                        board[i][j]=0;
                        score += board[i][k];
                        updateScore(score);
                        hasCollide[i][k] = true;
                        continue;
                    }
                }
            }
        }
    }

    setTimeout("updateBoardView()",200);
    return true;
}

function moveUp(){

    if(!canMoveUp(board))
        return false;

//    move up operate
    for(var i=1;i<4;i++){
        for(var j=0;j<4;j++){
            if(board[i][j]!=0){

                for(var k=0;k<i;k++){
                    if(board[k][j]==0 && noBlockVertical(j,k,i,board)){
                    //    move
                        showMoveAnimation(i,j,k,j);
                        board[k][j]=board[i][j];
                        board[i][j]=0;
                        continue;
                    }
                    else if(board[k][j]==board[i][j] && noBlockVertical(j,k,i,board) && !hasCollide[k][j]){
                    //    move
                        showMoveAnimation(i,j,k,j);
                    //    add
                        board[k][j]=board[i][j]*2;
                        board[i][j]=0;
                        score += board[k][j];
                        updateScore(score);
                        hasCollide[k][j] = true;
                        continue;
                    }
                }
            }
        }
    }

    setTimeout("updateBoardView()",200);
    return true;
}

function moveDown() {
    if (!canMoveDown(board))
        return false;

//    move down
    for(var i=2;i>=0;i--){
        for(var j=0;j<4;j++){
            if(board[i][j]!=0){

                for(var k=3;k>i;k--){
                    if(board[k][j]==0 && noBlockVertical(j,i,k,board)){
                        showMoveAnimation(i,j,k,j);
                        board[k][j]=board[i][j];
                        board[i][j]=0;
                        continue;
                    }
                    else if(board[i][j]==board[k][j] && noBlockVertical(j,i,k,board) && !hasCollide[k][j]){
                        //    move
                        showMoveAnimation(i,j,k,j);
                        //    add
                        board[k][j]=board[i][j]*2;
                        board[i][j]=0;
                        score += board[k][j];
                        updateScore(score);
                        hasCollide[k][j] = true;
                        continue;
                    }
                }
            }
        }
    }

    setTimeout("updateBoardView()",200);
    return true;
}

function login(){

    var usernamestr = $("#userid").val();
    var passwordstr = $("#passid").val();

    var reg1 = /^[A-Za-z0-9]{6,10}$/;    
    var reg2 = /^[A-Za-z0-9]{6,12}$/;

    var flag1=reg1.test(usernamestr);
    var flag2=reg2.test(passwordstr);

    if(flag1==false||flag2==false){
        alert("Wrong password or id!");
    }

    ws.send("L"+usernamestr);
}

function setCount(str)
{
    var tmp=str.substring(1);
    userCnt=Number(tmp);
    alert(userCnt);
}

function joinRoom(x)
{
    //var tmp=1;
    ws.send("J"+x.toString()+userCnt);
}

