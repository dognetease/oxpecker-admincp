import request from "@/utils/request";
import { handleResponse } from "@/utils/request";

function create(data) {
    return request({
        url: "/api/admin/app-config",
        method: "POST",
        data,
    });
}

function list(data) {
    return request({
        url: "/api/admin/app-config",
        method: "GET",
        params: data,
    });
}
async function getAppTypes() {
    let appTypes = (
        await request({
            url: "/api/admin/app-config/getAppTypes",
            method: "GET",
        }).catch(() => {
            return {
                data: {
                    data: { itemList: [] },
                },
            };
        })
    ).data.data.itemList;

    return appTypes.map(({ code, name }) => {
        return {
            label: name,
            value: code,
        };
    });
}

function getProductAndAppKeys() {
    return request({
        url: "/api/admin/app-config/product-apps",
        method: "GET",
    }).then(handleResponse);
}

export default { list, create, getAppTypes, getProductAndAppKeys };
