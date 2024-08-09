import request from "@/utils/request";

function create(data) {
    return request({
        url: "/api/admin/product",
        method: "POST",
        data
    });
}

function update(data) {
    return request({
        url: "/api/admin/product",
        method: "PUT",
        data
    });
}

function list(data) {
    return request({
        url: "/api/admin/product",
        method: "GET",
        params: data
    });
}

export default { list, create, update };
