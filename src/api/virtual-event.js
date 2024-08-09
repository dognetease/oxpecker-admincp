import request, { handleResponse, handleHttpResponse } from "@/utils/request";

export const virtualEventApi = {
    getTable(data) {
        return request({
            url: "/api/admin/event",
            method: "GET",
            params: data,
        }).then(handleHttpResponse);
    },
    create(data) {
        return request({
            url: "/api/admin/virtual-event ",
            method: "POST",
            data: data,
            headType: "JSON",
        }).then(handleResponse);
    },
    update(data) {
        return request({
            url: "/api/admin/virtual-event ",
            method: "PUT",
            data: data,
            headType: "JSON",
        }).then(handleResponse);
    },
    delete(data) {
        return request({
            url: "/api/admin/virtual-event",
            method: "DELETE",
            params: data,
        }).then(handleResponse);
    },
    getEventList(query) {
        return request({
            url: "/api/admin/virtual-event/condition",
            method: "GET",
            params: query,
        }).then(handleResponse);
    },
    getCNameById(data) {
        return request({
            url: "/api/admin/event/exact",
            method: "GET",
            params: data,
        }).then(handleResponse);
    },
};
