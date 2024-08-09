import request from "@/utils/request";

async function query(data) {
    let options = (
        await request({
            url: "/api/admin/analysis/custom",
            method: "POST",
            headType: "JSON",
            data
        }).catch(() => {
            return {
                data: {
                    data: {
                        title: "",
                        data: {}
                    }
                }
            };
        })
    ).data.data;
    return options;
}

async function funnelQuery(data) {
    let options = (
        await request({
            url: "/api/admin/analysis/funnel",
            method: "POST",
            headType: "JSON",
            data
        }).catch(() => {
            return {
                data: {
                    data: {
                        title: "",
                        data: {}
                    }
                }
            };
        })
    ).data.data;
    return options;
}

async function download(data) {
    return new Promise((resolve, reject) => {
        request({
            url: "/api/admin/analysis/custom/download",
            method: "POST",
            headType: "JSON",
            data,
            responseType: "blob"
        }).then(
            (response) => {
                resolve(response.data);
                let blob = new Blob([response.data], {
                    type: "application/vnd.ms-excel"
                });
                let fileName = data.eventId + ".csv";
                if (window.navigator.msSaveOrOpenBlob) {
                    navigator.msSaveBlob(blob, fileName);
                } else {
                    var link = document.createElement("a");
                    link.href = window.URL.createObjectURL(blob);
                    link.download = fileName;
                    link.click();
                    //释放内存
                    window.URL.revokeObjectURL(link.href);
                }
            },
            (err) => {
                reject(err);
            }
        );
    });
}

async function getProductCodeOptions() {
    let productCodeOptions = (
        await request({
            url: "/api/admin/analysis/products",
            method: "GET"
        }).catch(() => {
            return {
                data: {
                    data: { itemList: [] }
                }
            };
        })
    ).data.data;

    return productCodeOptions.map(({ productCode, productName }) => {
        return {
            label: productName,
            value: productCode
        };
    });
}

async function getAppKeyOptions(data) {
    let appKeyOptions = (
        await request({
            url: "/api/admin/analysis/apps",
            method: "GET",
            params: data
        }).catch(() => {
            return {
                data: {
                    data: { itemList: [] }
                }
            };
        })
    ).data.data;

    return appKeyOptions.map(({ appKey, name }) => {
        return {
            label: name,
            value: appKey
        };
    });
}

async function getEventIdOptions(data) {
    let eventIdOptions = (
        await request({
            url: "/api/admin/analysis/eventIds",
            method: "GET",
            params: data
        }).catch(() => {
            return {
                data: {
                    data: {}
                }
            };
        })
    ).data.data;

    return eventIdOptions.map(({ label, value }) => {
        return {
            label: label,
            value: value
        };
    });
}

async function getEventAttributes(data) {
    let eventIdOptions = (
        await request({
            url: "/api/admin/analysis/event/attributes",
            method: "GET",
            params: data
        }).catch(() => {
            return {
                data: {
                    data: {}
                }
            };
        })
    ).data.data;

    return eventIdOptions.map(({ attributeName, attributeChineseName, description, type, isCustom }) => {
        return {
            label: attributeChineseName,
            value: attributeName,
            description: description,
            type: type,
            isCustom: isCustom
        };
    });
}

async function getEventAttributeValues(data) {
    let eventIdOptions = (
        await request({
            url: "/api/admin/analysis/event/attribute/values",
            method: "GET",
            params: data
        }).catch(() => {
            return {
                data: {
                    data: {}
                }
            };
        })
    ).data.data;

    return eventIdOptions.map((value) => {
        return {
            label: value,
            value: value
        };
    });
}

export default {
    query,
    funnelQuery,
    download,
    getProductCodeOptions,
    getAppKeyOptions,
    getEventIdOptions,
    getEventAttributes,
    getEventAttributeValues
};
