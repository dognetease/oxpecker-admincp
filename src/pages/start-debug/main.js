import Vue from "vue";
import "normalize.css/normalize.css";
import "@/styles/index.scss";

import App from "./App";
import "@/icons";

Vue.config.productionTip = false;

new Vue({
    el: "#app",
    render: (h) => h(App)
});
