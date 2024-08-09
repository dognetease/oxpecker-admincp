import request from "@/utils/request";
import { handleResponse } from "@/utils/request";

function getEventRemark(data) {
    return request({
        url: "/api/admin/event-remark/getEventRemark",
        method: "GET",
        params: data,
    }).then(handleResponse);
}

function create(data) {
    return request({
        url: "/api/admin/event-remark",
        method: "POST",
        headType: "JSON",
        data,
    }).then(handleResponse);
}

export default { getEventRemark, create };
