import request from "@/utils/request";
import { handleResponse } from "@/utils/request";

// const handleResponse = (resp) => {
//     if (resp && resp.code === 0) {
//         return resp;
//     }
//     const { data = {} } = resp;
//     if (data.code === 0) {
//         return data.data;
//     } else {
//         Message.error({
//             type: "error",
//             message: data.message
//         });
//         return Promise.reject(data);
//     }
// };

export const getFolderOrFiles = (projectId, type = "all", needDashboard = true) => {
    return request({
        url: "/api/admin/folder-dashboard",
        method: "GET",
        params: {
            productCode: projectId,
            type,
            needDashboard,
        },
    }).then(handleResponse);
};

export const createFolder = (parentId, name, projectCode) => {
    return request({
        url: "/api/admin/folder",
        method: "POST",
        data: {
            name,
            productCode: projectCode,
            parentFolderId: parentId,
        },
        headType: "JSON",
    }).then(handleResponse);
};

export const updateFolderName = (id, name) => {
    return request({
        url: "/api/admin/folder",
        method: "PUT",
        params: {
            id,
            name,
        },
    }).then(handleResponse);
};

export const shareFolder = id => {
    return request({
        url: "/api/admin/folder/share",
        method: "POST",
        params: {
            id,
        },
    }).then(handleResponse);
};

export const deleteFolder = id => {
    return request({
        url: "/api/admin/folder/" + id,
        method: "DELETE",
    }).then(handleResponse);
};

export const createDashboard = (parentId, projectCode, name) => {
    return request({
        url: "/api/admin/dashboard",
        method: "POST",
        data: {
            folderId: parentId,
            productCode: projectCode,
            name,
        },
        headType: "JSON",
    }).then(handleResponse);
};

export const shareDashboard = (parentId, id) => {
    return request({
        url: "/api/admin/dashboard/share",
        method: "POST",
        params: {
            folderId: parentId,
            id,
        },
    }).then(handleResponse);
};

export const updateDashboard = params => {
    return request({
        url: "/api/admin/dashboard",
        method: "PUT",
        data: params,
        headType: "JSON",
    }).then(handleResponse);
};

export const deleteDashboard = id => {
    return request({
        url: "/api/admin/dashboard/" + id,
        method: "DELETE",
    }).then(handleResponse);
};

export const getPanels = dashboardId => {
    return request({
        url: "/api/admin/dashboard/panel",
        method: "GET",
        params: {
            dashboardId,
        },
    }).then(handleResponse);
};

export const createPanels = params => {
    return request({
        url: "/api/admin/panel",
        method: "POST",
        data: params,
        headType: "JSON",
    }).then(handleResponse);
};

export const updatePanel = data => {
    return request({
        url: "/api/admin/panel",
        method: "PUT",
        data,
        headType: "JSON",
    }).then(handleResponse);
};

export const deletePanel = id => {
    return request({
        url: "/api/admin/panel/" + id,
        method: "DELETE",
    }).then(handleResponse);
};

export const sharePanel = (id, target) => {
    return request({
        url: "/api/admin/panel/share",
        method: "POST",
        data: {
            id,
            dashboardId: target,
        },
    }).then(handleResponse);
};

export const getPanelsByType = (type, productCode) => {
    return request({
        url: "/api/admin/panel-total",
        method: "GET",
        params: {
            type,
            productCode,
        },
    }).then(handleResponse);
};

export const getPanelQueryById = id => {
    return request({
        url: "/api/admin/panel",
        method: "GET",
        params: {
            id,
        },
    }).then(handleResponse);
};
