import Vue from "vue";
// 埋点track方法
import track from "./utils/dataTracker.js";
Vue.prototype.$track = track;

import "normalize.css/normalize.css";


import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import locale from "element-ui/lib/locale/lang/zh-CN";

import "@/styles/index.scss";

import App from "./App";
import store from "./store";
import router from "./router";
import "@/icons";
// import '@/permission'
import * as filters from "./filters";
import { Message } from "element-ui";

Vue.use(ElementUI, { locale, size: "medium" });

Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key]);
});

Vue.config.productionTip = false;

Vue.prototype.$message = function (config) {
    Message({
        duration: 3000,
        showClose: true,
        offset: 70,
        ...config,
    });
};

new Vue({
    el: "#app",
    router,
    store,
    render: h => h(App),
});
