const state = {
    productId: "",
    productOptions: [],
    appKey: [],
    appKeyOptions: []
};

const mutations = {
    updateProductId(state, { id }) {
        state.productId = id;
        // Cookies.set("global_productCode", id);
    },
    updateProductOptions(state, { options }) {
        state.productOptions = options;
    },
    updateAppKey(state, { appKeys }) {
        state.appKey = appKeys;
        // Cookies.set("global_appKey_" + state.productId, appKeys.join(","));
    },
    updateAppKeyOptions(state, { options }) {
        state.appKeyOptions = options;
    }
};

const actions = {
    // async getProductOptions({ state, commit }) {
    //     await optionsApi.getProductCodeOptions().then((resp) => {
    //         const options = resp;
    //         commit("updateProductOptions", {
    //             options
    //         });
    //         if (Cookies.get("global_productCode")) {
    //             commit("updateProductId", {
    //                 id: Cookies.get("global_productCode")
    //             });
    //         } else if (options.length > 0) {
    //             commit("updateProductId", {
    //                 id: options[0]?.value
    //             });
    //         }
    //     });
    // },
    // async getAppKeyOptions({ state, commit }) {
    //     let productCode = state.productId;
    //     await optionsApi.getAppKeyOptions({ productCode }).then((resp) => {
    //         const options = resp;
    //         commit("updateAppKeyOptions", {
    //             options
    //         });
    //         if (Cookies.get("global_appKey_" + productCode)) {
    //             commit("updateAppKey", {
    //                 appKeys: Cookies.get("global_appKey_" + productCode).split(",")
    //             });
    //         } else if (options.length > 0) {
    //             commit("updateAppKey", {
    //                 appKeys: [options?.[0].value]
    //             });
    //         }
    //     });
    // }
};
export default {
    namespaced: true,
    state,
    mutations,
    actions
};
