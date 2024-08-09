import request, { handleResponse } from "@/utils/request";
import { isArray, forEach } from "lodash";
import { fetchRequest } from "./http";
import _ from "lodash";

export const uploadFile = files => {
    files = isArray(files) ? files : [files];
    const formData = new FormData();
    forEach(files, file => {
        formData.append("files", file, file.name);
    });
    return request({
        url: "/api/pub/upload/get_download_url",
        method: "POST",
        data: formData,
    }).then(handleResponse);
};

export const fetchEventOptionByMatch = query => {
    return fetchRequest.get({ url: "/api/admin/analysis/eventIds", query });
};

export const fetchAttrByQuery = query => {
    return fetchRequest.get({
        url: "/api/admin/analysis/event/attributes",
        query,
    });
};

export const fetchPanelOption = (productCode, type) => {
    return fetchRequest.get({
        url: "/api/admin/panel-total",
        query: {
            productCode,
            type,
        },
    });
};

export const fetchStateByPanel = id => {
    return fetchRequest.get({
        url: "/api/admin/panel",
        query: {
            id,
        },
    });
};
