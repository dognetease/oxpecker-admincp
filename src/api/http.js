import _ from "lodash";
class HttpRequest {
    constructor(option = {}) {
        const defaultOption = {
            mode: "cors",
            cache: "no-cache",
            credentials: "include",
            redirect: "follow",
            referrerPolicy: "origin",
        };

        this._baseUrl = option.baseUrl ?? "";
        Reflect.deleteProperty(option, "baseUrl");
        this._option = {
            ...defaultOption,
            ...option,
        };
    }

    get(config = {}) {
        let { url = "", query = {} } = config;
        url = this._getQuery(url, query);
        return this._request(url);
    }

    _getQuery(path, query = {}) {
        const keys = _.keys(query);
        if (keys.length === 0) {
            return path;
        }
        const queryString = _.chain(keys)
            .map(key => {
                return `${key}=${query[key]}`;
            })
            .join("&")
            .value();

        return path + "?" + queryString;
    }

    post(config = {}, type = "json") {
        let { url, query = {}, body = {} } = config;
        url = this._getQuery(url, query);
        const headers = this._getHeaders(type);
        if (type === "json") {
            body = JSON.stringify(body);
        }
        const option = {
            headers,
            body,
            method: "POST",
        };
        return this._request(url, option);
    }

    _getHeaders(type = "json") {
        const headers = new Headers();
        switch (type) {
            case "json":
                headers.append("Content-Type", "application/json;charset=utf-8");
                break;
            case "file":
                headers.append("Content-Type", "multipart/form-data");
                break;
            case "form":
                break;
            default:
                break;
        }
        return headers;
    }

    put(config = {}, type = "json") {
        let { url, query = {}, body = {} } = config;
        url = this._getQuery(url, query);
        const headers = this._getHeaders(type);
        if (type === "json") {
            body = JSON.stringify(body);
        }
        const option = {
            headers,
            body,
            method: "PUT",
        };
        return this._request(url, option);
    }

    delete(config = {}, type = "json") {
        let { url, query = {}, body = {} } = config;
        url = this._getQuery(url, query);
        const headers = this._getHeaders(type);
        if (type === "json") {
            body = JSON.stringify(body);
        }
        const option = {
            headers,
            body,
            method: "DELETE",
        };
        return this._request(url, option);
    }

    _request(url, option = {}) {
        url = url.trim();
        const fullUrl = encodeURI(this._baseUrl.length > 0 ? this._baseUrl + url : url);
        const request = new Request(fullUrl, {
            ...this._option,
            ...option,
        });
        return fetch(request)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`gateway error, status: ${response.status}`);
                }
                return response.json();
            })
            .then(jsonData => {
                // 这里判断是不是业务code
                if (jsonData.code !== 0) {
                    throw new Error(jsonData.message || "业务侧请求失败，code不为0");
                }
                return jsonData.data;
            });
    }

    abort(controller) {
        if (controller && controller instanceof AbortController) {
            controller.abort();
            return;
        }
        throw new Error("not a valid instance of AbortController");
    }

    getAbortController() {
        return new AbortController();
    }
}

const fetchRequest = new HttpRequest({ baseUrl: process.env.VUE_APP_HOST });

const mockData = (data, delay = 500) => {
    return new Promise(r => {
        setTimeout(() => {
            r(data);
        }, delay);
    });
};

export { fetchRequest, mockData };
