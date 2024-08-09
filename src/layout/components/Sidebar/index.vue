<template>
    <div :class="{ 'has-logo': showLogo }" class="nav">
        <el-menu
            :default-active="activeMenu"
            :background-color="variables.menuBg"
            :text-color="variables.menuText"
            :unique-opened="false"
            :active-text-color="variables.menuActiveText"
            :collapse-transition="false"
            mode="horizontal"
            class="top-menu"
        >
            <div class="begin">
                <img class="logo" src="@/assets/logo.png" />
            </div>
            <div class="middle">
                <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" />
            </div>
            <div class="end">
                <!-- <img @click="viewDoc" src="@/icons/svg/question.svg" /> -->
                <i class="el-icon-question" @click="viewDoc"></i>
            </div>
        </el-menu>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import Logo from "./Logo";
import SidebarItem from "./SidebarItem";
import variables from "@/styles/variables.module.scss";

export default {
    components: { SidebarItem, Logo },
    computed: {
        ...mapGetters(["permission_routes"]),
        routes() {
            return this.$router.options.routes;
        },
        activeMenu() {
            const route = this.$route;
            const { meta, path } = route;
            // if set path, the sidebar will highlight the path you set
            if (meta.activeMenu) {
                return meta.activeMenu;
            }
            return path;
        },
        showLogo() {
            return this.$store.state.settings.sidebarLogo;
        },
        variables() {
            return variables;
        },
    },
    methods: {
        viewDoc() {
            window.open('https://docs.popo.netease.com/lingxi/a305ba9fe3184a9d83ffede8aa607478', '_blank')
        }
    }
};
</script>

<style lang="scss" scoped>
.top-menu {
    display: flex;
    align-items: center;
    // padding-left: 100px;
    justify-content: center;

    ::v-deep .el-menu-item {
        font-size: 16px;
    }

    ::v-deep .el-submenu__title {
        font-size: 16px;
        .el-submenu__icon-arrow {
            position: static;
            margin-top: 0;
            margin-left: 8px;
            color: unset;
        }
    }

    .logo {
        margin-left: 20px;
        height: 38px;
        order: -1;
    }

    .begin,
    .end {
        flex: 0 0 250px;
    }
    .end {
        height: 30px;
        display: flex;
        align-items: center;
        i {
            margin-left: auto;
            margin-right: 30px;
            font-size: 23px;
            color: #f5f5f5;
            cursor: pointer;
        }
    }
    .middle {
        flex: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 56px;
    }
}
.nav {
    display: flex;
    align-items: center;
    height: 56px;
}
</style>

// <style lang="scss">
// 全局去覆盖el-menu的样式
.el-menu--horizontal {
    .el-menu--popup {
        min-width: 0 !important;
        background-color: #fff !important;
        text-align: center;
        .el-menu-item {
            background-color: #fff !important;
            color: #000 !important;
            min-width: 0;
            padding: 0 30px;
            &:hover {
                background-color: #eee !important;
            }
        }
    }
}
</style>
