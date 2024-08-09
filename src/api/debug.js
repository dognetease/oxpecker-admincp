import request from "@/utils/request";
import { sign } from "@/utils";

function getToken(appKey) {
    return request({
        url: `${process.env.VUE_APP_DEBUG_HOST}/api/web/debug/getToken`,
        method: "get",
        params: { appKey, _r: sign() }
    });
}

function checkToken(token) {
    return request({
        url: `${process.env.VUE_APP_DEBUG_HOST}/api/web/debug/cte`,
        method: "post",
        data: { token, _r: sign() }
    });
}

function swapDebug(type, token) {
    return request({
        url: `${process.env.VUE_APP_DEBUG_HOST}/api/web/debug/swapDebug`,
        method: "post",
        data: { type, token, _r: sign() }
    });
}

function startDebugTrackEvent(token, eventId, version, tag, developer, operator) {
    return request({
        url: `${process.env.VUE_APP_DEBUG_HOST}/api/web/debug/startDebugTrackEvent`,
        method: "post",
        data: { token, eventId, version, tag, developer, operator, _r: sign() }
    });
}

function startDebugValidate(token) {
    return request({
        url: `${process.env.VUE_APP_DEBUG_HOST}/api/web/debug/debugValidate`,
        method: "post",
        data: { token, _r: sign() }
    });
}

export default {
    getToken,
    checkToken,
    swapDebug,
    startDebugTrackEvent,
    startDebugValidate
};
