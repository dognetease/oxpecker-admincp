<template>
    <div class="navbar">
        <breadcrumb class="breadcrumb-container" />

        <div class="right-menu">
            <!-- 产品线选择 -->
            <el-select
                v-if="$route.name !== 'product-user-permission'"
                :value="productCode"
                @change="changeProductCode"
                class="product-select"
            >
                <el-option
                    v-for="item in productCodeOption"
                    :value="item.value"
                    :label="item.label"
                    :key="item.value"
                ></el-option>
            </el-select>
            <!-- 应用选择 -->
            <el-select
                v-if="!hiddenAppKey"
                multiple
                collapse-tags
                :value="appKeys"
                @change="changeAppKey"
                class="appKey-select"
            >
                <el-option
                    v-for="item in appKeysOption"
                    :value="item.value"
                    :label="item.label"
                    :key="item.value"
                ></el-option>
            </el-select>
            <el-dropdown class="avatar-container" trigger="click">
                <div class="avatar-wrapper">
                    <!-- <img :src="avatar + '?imageView2/1/w/80/h/80'" class="user-avatar" /> -->
                    设置
                    <i class="el-icon-caret-bottom" />
                </div>
                <el-dropdown-menu slot="dropdown" class="user-dropdown">
                    <el-dropdown-item divided>
                        <span style="display: block" @click="goProduct">产品线管理</span>
                    </el-dropdown-item>
                    <el-dropdown-item divided>
                        <span style="display: block" @click="logout">退出登录</span>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </div>
</template>

<script>
// import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import { setAppKeys, setProductCode, appKeyOption$, productCodeOption$ } from "@/serviceStore/global/index";
import { isSubSet } from "@/utils/index";
import Cookies from "js-cookie";
export default {
    components: {
        Breadcrumb,
    },
    data() {
        return {
            productCode: "",
            appKeys: [],
            productCodeOption: [],
            appKeysOption: [],
        };
    },
    computed: {
        hiddenAppKey() {
            const hiddenRouterName = [
                "path-analysis",
                "entry-buried",
                "debug",
                "application",
                "product-user-permission",
                "virtual-event",
            ];
            return hiddenRouterName.includes(this.$route.name);
        }
    },

    created() {
        productCodeOption$.subscribe(option => {
            this.productCodeOption = option;
            this.$store.commit("globalState/updateProductOptions", {
                options: option,
            });
            const globalProductCode = Cookies.get("global_productCode" + this.productCode);
            if (
                globalProductCode &&
                isSubSet(
                    [globalProductCode],
                    option.map(each => each.value)
                )
            ) {
                this.productCode = globalProductCode;
            } else if (option.length > 0) {
                this.productCode = option[0].value;
            }
            this.$store.commit("globalState/updateProductId", {
                id: this.productCode,
            });
            setProductCode(this.productCode);
        });
        appKeyOption$.subscribe(option => {
            this.appKeysOption = option;
            this.$store.commit("globalState/updateAppKeyOptions", {
                appKeys: option,
            });
            let codeList = [];
            const selectAppKeysCookie = Cookies.get("global_appKey_" + this.productCode);
            if (selectAppKeysCookie) {
                codeList = selectAppKeysCookie.split(",");
            } else if (option.length > 0) {
                codeList = [option[0].value];
            }
            this.appKeys = codeList;
            this.$store.commit("globalState/updateAppKey", {
                appKeys: codeList,
            });
            setAppKeys(codeList);
        });
    },
    methods: {
        async logout() {
            await this.$store.dispatch("user/logout");
            this.$router.replace({
                path: "/redirect" + this.$route.fullPath,
            });
        },
        goProduct() {
            this.$router.push("/product/index");
        },
        changeProductCode(value) {
            this.productCode = value;
            this.$store.commit("globalState/updateProductId", {
                id: value,
            });
            Cookies.set("global_productCode", this.productCode);
            setProductCode(value);
        },
        changeAppKey(value) {
            if (value.length === 0) return;
            this.appKeys = value;
            Cookies.set("global_appKey_" + this.productCode, value.join(","));
            this.$store.commit("globalState/updateAppKey", {
                appKeys: value,
            });
            setAppKeys(value);
        },
    },
};
</script>

<style lang="scss" scoped>
.navbar {
    height: 50px;
    overflow: hidden;
    position: relative;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

    display: flex;
    align-items: center;

    .hamburger-container {
        line-height: 46px;
        height: 100%;
        float: left;
        cursor: pointer;
        transition: background 0.3s;
        -webkit-tap-highlight-color: transparent;

        &:hover {
            background: rgba(0, 0, 0, 0.025);
        }
    }

    .breadcrumb-container {
        float: left;
    }

    .right-menu {
        // float: right;
        // height: 100%;
        // line-height: 50px;
        margin-right: 8px;
        margin-left: auto;
        display: flex;
        align-items: center;

        &:focus {
            outline: none;
        }

        .product-select {
            width: 150px;
            margin-right: 20px;
        }

        .appKey-select {
            width: 210px;
            margin-right: 50px;
            ::v-deep(.el-select__tags > span) {
                display: flex;
            }
            ::v-deep(.el-select__tags span.el-tag:nth-child(1)) {
                flex: auto;
            }
        }

        .avatar-container {
            display: flex;
            align-items: center;
        }
    }
}
</style>
