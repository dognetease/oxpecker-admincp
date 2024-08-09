import axios from "axios";
import qs from "qs";
import { Message } from "element-ui";

// create an axios instance
const service = axios.create({
    baseURL: process.env.VUE_APP_HOST,
    withCredentials: true,
    // timeout: 5000
});

// request interceptor
service.interceptors.request.use(
    config => {
        // do something before request is sent
        if (config.headType === "JSON") {
            config.headers["Content-Type"] = "application/json;charset=utf-8";
        } else if (config.data instanceof FormData) {
            config.headers["Content-Type"] = "multipart/form-data";
        } else {
            config.headers["Content-Type"] = "application/x-www-form-urlencoded";
            if (config.method === "post" || config.method === "put") {
                config.data = qs.stringify(config.data);
            }
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// response interceptor
service.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        try {
            Message({
                message: error.response.data.message || error.message,
                type: "error",
                duration: 5 * 1000,
            });
            return Promise.reject(error);
        } catch (e) {
            window.location.href = process.env.VUE_APP_HOST + "/login";
        }
    }
);

export default service;

export function handleResponse(response) {
    if (response.status !== 200) {
        throw new Error("http error, status: " + response.status);
    }

    const { data = {} } = response;
    if (data.code !== 0) {
        throw new Error("service error, message: " + data.message);
    }

    const realData = data.data;
    return realData;
}

export function handleHttpResponse(response) {
    if (response.status !== 200) {
        throw new Error("http error, status: " + response.status);
    }

    const { data = {} } = response;
    return data;
}

export function mockData(data, delay = 300) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(data);
        }, delay);
    });
}
