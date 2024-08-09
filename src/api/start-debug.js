import request from "@/utils/request";

function informScanQrCode(data) {
    return request({
        url: `${process.env.VUE_APP_DEBUG_HOST}/api/web/debug/scanQrCode`,
        method: "GET",
        params: data
    });
}

export default {
    informScanQrCode
};
