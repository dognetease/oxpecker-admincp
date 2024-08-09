import request from "@/utils/request";

function create(data) {
    return request({
        url: "/api/xx",
        method: "POST",
        data
    });
}

function update(data) {
    return request({
        url: "/api/xx",
        method: "PUT",
        data
    });
}

function list(data) {
    return request({
        url: "/api/xx",
        method: "GET",
        params: data
    });
}

function deleteById(id) {
    return request({
        url: "/api/xx/" + id,
        method: "DELETE"
    })
}

export default { list, create, update, deleteById }