import request from "@/utils/request";

async function getTypeOptions() {
    let productCodeOptions = (
        await request({
            url: "/api/admin/app-config/getApplications",
            method: "GET"
        }).catch(() => {
            return {
                data: {
                    data: { itemList: [] }
                }
            };
        })
    ).data.data.itemList;

    return productCodeOptions.map(({ type }) => {
        return {
            label: type,
            value: type
        };
    });
}

async function getProductCodeOptions() {
    let productCodeOptions = (
        await request({
            url: "/api/admin/product/getProduct",
            method: "GET"
        }).catch(() => {
            return {
                data: {
                    data: { itemList: [] }
                }
            };
        })
    ).data.data.itemList;

    return productCodeOptions.map(({ productCode, productName }) => {
        return {
            label: productName,
            value: productCode
        };
    });
}
async function getAllProductCodeOptions() {
    let productCodeOptions = (
        await request({
            url: "/api/admin/product/getAllProduct",
            method: "GET"
        }).catch(() => {
            return {
                data: {
                    data: { itemList: [] }
                }
            };
        })
    ).data.data.itemList;

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
            url: "/api/admin/app-config/getApplications",
            method: "GET",
            params: data
        }).catch(() => {
            return {
                data: {
                    data: { itemList: [] }
                }
            };
        })
    ).data.data.itemList;

    return appKeyOptions.map(({ appKey, name, type }) => {
        return {
            label: name,
            value: appKey,
            type
        };
    });
}

async function getAppKeyOptions4EditGroup(data) {
    let appKeyOptions = (
        await request({
            url: "/api/admin/app-config/getAppByProAndEventId",
            method: "GET",
            params: data
        }).catch(() => {
            return {
                data: {
                    data: { itemList: [] }
                }
            };
        })
    ).data.data.itemList;

    return appKeyOptions.map(({ appKey, name, status, type, eventVersion }) => {
        return {
            label: name,
            value: appKey,
            status,
            type,
            version: eventVersion
        };
    });
}

async function getFilterOptions(data) {
    let options = (
        await request({
            url: "/api/admin/metric/attributes",
            method: "GET",
            params: data
        }).catch(() => {
            return {
                data: {
                    data: []
                }
            };
        })
    ).data.data;

    return options
        .filter((item) => !item.isFixedAttributes)
        .map(({ attributesName, attributesChineseName, type }) => {
            return {
                label: attributesChineseName,
                value: attributesName,
                type
            };
        });
}

async function getTermsOptions(data) {
    let options = (
        await request({
            url: "/api/admin/metric/terms",
            method: "GET",
            params: data
        }).catch(() => {
            return {
                data: {
                    data: []
                }
            };
        })
    ).data.data;

    return options;
}

// 获取属性单位
async function getAttrUnit() {
    let attrUnit = (
        await request({
            url: "/api/admin/event/getAttrUnit",
            method: "GET"
        }).catch(() => {
            return {
                data: {
                    data: { itemList: [] }
                }
            };
        })
    ).data.data.itemList;

    return attrUnit.map(({ code, desc }) => {
        return {
            label: desc,
            value: code
        };
    });
}

//搜索事件下拉框
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

export default {
    getTypeOptions,
    getProductCodeOptions,
    getAppKeyOptions,
    getAppKeyOptions4EditGroup,
    getFilterOptions,
    getTermsOptions,
    getAllProductCodeOptions,
    getAttrUnit,
    getEventIdOptions
};
