var userCnt=0;
var Person = [];
var Room = [];
var RoomCnt= [];

var ws = require("nodejs-websocket");
console.log("开始建立连接...")

var server = ws.createServer(function(conn){
    conn.on("text", function (str) {
        console.log("收到的信息为: "+str)
        if(str[0]=='L'){
            login(str,conn);
        }
        if(str[0]=="J"){
            joinroom(str,conn);
        }
    })
    conn.on("close", function (code, reason) {
        console.log("关闭连接")
    });
    conn.on("error", function (code, reason) {
        console.log("异常关闭")
    });
}).listen(8001)
console.log("WebSocket建立完毕")

function login(str,conn)
{
    conn.sendText("R"+userCnt.toString());
    userCnt=userCnt+1;
}

function joinroom(str,conn)
{
    var tmp1=str.substring(1,2);
    var roomId=Number(tmp1);
    var tmp2 = str.substring(2);
    var userId = Number(tmp2);

    person = new Object();
    person.id=userId;
    person.room=roomId;
    person.state="join";

    Person[person.id]=person;

    Room[roomId]
}