import request from "@/utils/request";

export function login(data) {
    return request({
        url: "/login",
        method: "post",
        data
    });
}

export function getInfo(token) {
    return request({
        url: "/info",
        method: "get",
        params: { token }
    });
}

export function logout() {
    return request({
        url: "/logout",
        method: "post"
    });
}

export const getUserId = () => {
    return request({
        url: "/api/admin/user/",
        method: "get"
    }).then(({ data = {} }) => {
        if (data.code === 0) {
            return data.data;
        } else {
            throw new Error(data.message);
        }
    });
};
