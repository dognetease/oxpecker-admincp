import SockJS from "sockjs-client";
import Stomp from "stompjs";

// 连接函数
let number = 1;
let stompClient = null;
let timeId = null;
export function reconnect(url, messageCallback) {
    // 建立连接对象（还未发起连接）
    let socket = new SockJS(url);
    // 获取 STOMP 子协议的客户端对象
    stompClient = Stomp.over(socket);
    // 设置客户端心跳三秒
    // stompClient.heartbeat.outgoing = 10000; // 100s
    // stompClient.heartbeat.incoming = 10000;
    // 向服务器发起websocket连接并发送CONNECT帧
    stompClient.connect(
        {}, //可添加客户端的认证信息
        function connectCallback() {
            clearInterval(timeId);
            // 心跳检测
            timeId = this.timeoutObj = setInterval(function () {
                stompClient.send("ping");
            }, 10000);
            //订阅频道
            stompClient.subscribe("/user/queue/sendUser", function (data) {
                if (data) {
                    messageCallback(data);
                }
            });
        },
        function errorCallBack() {
            //连接失败时再次调用函数
            number += 1;
            if (number <= 10) {
                reconnect(url);
                return;
            }
            number = 1;
            // 断开链接
            disconnect();
        }
    );
}

export function disconnect() {
    stompClient.disconnect(function () {
        clearInterval(timeId);
    });
}
