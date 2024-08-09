import request from "@/utils/request";

function create(data) {
    return request({
        url: "/api/admin/event",
        method: "POST",
        headType: "JSON",
        data
    });
}

export const getCommonAttributes = (code = "") => {
    return request({
        url: "/api/admin/product-mapping",
        params: {
            productCode: code
        }
    })
        .then((res) => {
            const {
                data = {}
            } = res;
            if (data.code === 0) {
                return data.data;
            } else {
                throw new Error('backend error, please contact admin')
            }
        })
        .catch((err) => {
            console.error(err);
        });
};

export default { create };
