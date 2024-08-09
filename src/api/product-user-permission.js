import request from "@/utils/request";

function create(data) {
    return request({
        url: "/api/admin/product-permission",
        method: "POST",
        data
    });
}

function update(data) {
    return request({
        url: "/api/admin/product-permission",
        method: "PUT",
        data
    });
}

function list(data) {
    return request({
        url: "/api/admin/product-permission",
        method: "GET",
        params: data
    });
}

function getEmailList(data) {
    return request({
        url: "/api/admin/product-permission/getEmailList",
        method: "GET",
        params: data
    });
}

export default { list, create, update, getEmailList };
