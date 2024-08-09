export function Login(response, callback) {
    var divDom = document.createElement("div");
    divDom.setAttribute("id", "iframeParent");
    divDom.setAttribute(
        "style",
        "width:500px;height:500px;position:absolute;left:50%;top:10%;transform:translateX(-50%);z-index:9999;background:#fff"
    );
    var iframe = document.createElement("iframe");
    iframe.setAttribute("style", "display:block;width:400px;height:400px;margin:0 auto");
    iframe.src = response.config.baseURL + "/login";
    divDom.appendChild(iframe);
    document.body.appendChild(divDom);
    window.addEventListener("message", function(e) {
        if (e.data.type == "passDataBack" && e.data.data.success) {
            callback && callback();
        }
    });
}
