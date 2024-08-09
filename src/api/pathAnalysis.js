import request from "@/utils/request";
import { handleResponse } from "@/utils/request";
export const getSankeyData = data => {
    return request({
        url: "/api/admin/analysis/sankey",
        data,
        method: "POST",
        headType: "JSON",
    })
        .then(handleResponse)
        .catch(err => {
            console.error(err);
        });
};

export const getPanelSankeyData = data => {
    return request({
        url: "/api/admin/analysis/dashboard/sankey",
        data,
        method: "POST",
        headType: "JSON",
    })
        .then(handleResponse)
        .catch(err => console.error(err));
};
