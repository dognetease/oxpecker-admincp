import request from "@/utils/request";

function list(data) {
    return request({
        url: "/api/admin/event",
        method: "GET",
        params: data
    });
}

function update(data) {
    return request({
        url: "/api/admin/event",
        method: "PUT",
        headType: "JSON",
        data
    });
}

async function getEventById(data) {
    const opntins = (
        await request({
            url: "/api/admin/event/getEventById",
            method: "GET",
            params: data
        }).catch(() => {
            return {
                data: {
                    data: { attrList: [], event: {} }
                }
            };
        })
    ).data.data;
    const attrList = opntins.attrList;
    const { productCode, developer, version, appKey, eventId, description, id, tag, status, eventType } = opntins.event;

    let eventAttributeDTOList = attrList.map((item) => {
        let { description, attributeName, attributeMappingName,type, unit, maxValue, minValue, attributeValue, status } = item;
        // 字符类型才需要输入属性值， 所以只有字符类型才进行默认值处理
        if (type === "string") {
            if (!attributeValue) {
                attributeValue = [{}];
            } else {
                attributeValue = JSON.parse(attributeValue);
                if (!attributeValue.length) {
                    attributeValue = [{}];
                }
            }
        } else {
            attributeValue = [];
        }

        attributeValue = attributeValue.map(({ value, desc }) => {
            return {
                value,
                desc
            };
        });
        return { description, attributeName, attributeMappingName,type, unit, minValue, maxValue, status, attributeValue };
    });

    // 回显没有属性时， 添加一个默认属性项
    if (!eventAttributeDTOList.length) {
        eventAttributeDTOList = [{}];
    }

    return {
        id,
        productCode,
        developer,
        version,
        appKey,
        eventId,
        description,
        tag,
        eventAttributeDTOList,
        status,
        eventType
    };
}

async function getEventInfo(data) {
    const opntins = (
        await request({
            url: "/api/admin/event/getEventInfo",
            method: "GET",
            params: data
        }).catch(() => {
            return {
                data: {
                    data: { attrList: [], event: {} }
                }
            };
        })
    ).data.data;
    const attrList = opntins.attrList;
    const { productCode, developer, version, appKey, eventId, description, id, tag, status } = opntins.event;

    let eventAttributeDTOList = attrList.map((item) => {
        let { description, attributeName, type, unit, maxValue, minValue, attributeValue, status } = item;
        // 字符类型才需要输入属性值， 所以只有字符类型才进行默认值处理
        if (type === "string") {
            if (!attributeValue) {
                attributeValue = [{}];
            } else {
                attributeValue = JSON.parse(attributeValue);
                if (!attributeValue.length) {
                    attributeValue = [{}];
                }
            }
        } else {
            attributeValue = [];
        }

        attributeValue = attributeValue.map(({ value, desc }) => {
            return {
                value,
                desc
            };
        });
        return { description, attributeName, type, unit, minValue, maxValue, status, attributeValue };
    });

    // 回显没有属性时， 添加一个默认属性项
    if (!eventAttributeDTOList.length) {
        eventAttributeDTOList = [{}];
    }

    return {
        id,
        productCode,
        developer,
        version,
        appKey,
        eventId,
        description,
        tag,
        eventAttributeDTOList,
        status
    };
}

function updateDisabledAttr(data) {
    return request({
        url: "/api/admin/event/disableAttr",
        method: "POST",
        data
    });
}

function publishEventId(data) {
    return request({
        url: "/api/admin/event/publish",
        method: "POST",
        data
    });
}

function developCompletedEventId(data) {
    return request({
        url: "/api/admin/event/develop-completed",
        method: "POST",
        data
    });
}

function deleteRow(data) {
    return request({
        url: "/api/admin/event/deleteEvent",
        method: "POST",
        data
    });
}

function deleteEventById(data) {
    return request({
        url: "/api/admin/event/deleteEventById",
        method: "POST",
        data
    });
}

async function getDisabledAttr(data) {
    const attrList = (
        await request({
            url: "/api/admin/event/getPublishAttrs",
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

    return attrList.map(({ attributeName }) => {
        return { name: attributeName };
    });
}

async function getTagsOptions(data) {
    const tagList = (
        await request({
            url: "/api/admin/event/getTags",
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

    return tagList.map((tag) => {
        return { value: tag, label: tag };
    });
}

export default {
    list,
    update,
    getEventById,
    getEventInfo,
    updateDisabledAttr,
    getDisabledAttr,
    developCompletedEventId,
    publishEventId,
    deleteRow,
    deleteEventById,
    getTagsOptions
};
