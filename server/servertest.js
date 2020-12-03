var userCnt=0;//方操写的没敢动
var usercount=0;//用户在房间内的编号，如果大于4则回到0，不是为了记录用户数量的
var Person = [];//没敢动
var Room = [];//二维数组，每一行代表一个房间，每行的四个元素分别代表四个用户的棋盘信息
var ROOMCNT=6;//总房间数量
var roomcount=1;//现在没有满的最小房间编号，5是全满
var canroomplay=new Array(ROOMCNT+1);//从一开始

for(let i=0;i<=6;i++)
canroomplay[i]=0;
var box=new Array();
for(let i=0;i<4;i++){//box和board格式完全一样，主要是为了后续一次性传四个二维数组更加方便
        box[i]=new Array();
        for(let j=0;j<4;j++){
            box[i][j]=0;
        }
}
var everybox=new Array(ROOMCNT+1);
for(let  i=0;i<=6;i++)
   {
    everybox[i]=new Array();
    for(let j=0;j<=4;j++)
    {
    everybox[i][j]=box;
    }
}
var all_data={
    "type":"server_to_client",
    "isprepared":canroomplay,
    "roominformation":everybox
}
var ws = require("nodejs-websocket");
console.log("开始建立连接...")

var server = ws.createServer(function(conn){
    conn.on("text", function (str) {

        let received_message=JSON.parse(str);
        console.log(received_message);
        if(received_message["operation"]=="null")//接收到的是客户端的‘申请’操作
        {
            usercount=(usercount+1)%5;
            if(usercount==0)//当前房间已满
            {
                roomcount++;usercount++;
                if(roomcount<=ROOMCNT)//还有房间可用
                {
                let message_to_return=received_message;
                message_to_return["roomid"]=roomcount;
                message_to_return["idinroom"]=usercount;
                conn.sendText(JSON.stringify(message_to_return));
                }
                else//所有房间都满了
                {
                let message_to_return=received_message;
                message_to_return["roomid"]="denied";
                conn.sendText(JSON.stringify(message_to_return));    
                }
            }
            else//当前房间未满，把该用户分配到房间号roomcount，在房间里面的编号是usercount
            {
                let message_to_return=received_message;
                message_to_return["roomid"]=roomcount;
                message_to_return["idinroom"]=usercount;
                
                if(usercount==4)
                {
                    canroomplay[roomcount]=1;
                    all_data["isprepared"][roomcount]=1;

                }
                conn.sendText(JSON.stringify(message_to_return));
            }

        }
        else   //接收到的不是申请操作，返回房间内其他用户状态给客户端
        {
             var condition=received_message;
             var received_room=condition["roomid"];
             var received_idinroom=condition["idinroom"];

             all_data["roominformation"][received_room][received_idinroom]=condition["operation"];
          
             // for(let st=1;st<=4;st++)
             // {
             //    console.log("idinroom="+st);
             //    console.log(all_data["roominformation"][1][st]);
             //    console.log("********");
             // }
             let message_to_return=JSON.stringify(all_data);
             conn.sendText(message_to_return);
        }
        //conn.sendText(JSON.stringify(received_message));

    }
    );
    conn.on("close", function (code, reason) {
        console.log("关闭连接")
    });
    conn.on("error", function (code, reason) {
        console.log("异常关闭")
    });
}).listen(8001)
console.log("WebSocket建立完毕")






//下面开始都是方操原来写的，一点都没动
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