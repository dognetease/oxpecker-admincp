<template>
    <div class="app-wrapper">
        <sidebar class="sidebar-container" />
        <div :class="{ hasTagsView: needTagsView }" class="main-container">
            <div :class="{ 'fixed-header': fixedHeader }">
                <navbar />
                <tags-view v-if="needTagsView" />
            </div>
            <app-main />
        </div>
    </div>
</template>

<script>
import { Navbar, Sidebar, AppMain, TagsView } from "./components";
import { mapState } from "vuex";

export default {
    name: "Layout",
    components: {
        Navbar,
        Sidebar,
        AppMain,
        TagsView,
    },
    computed: {
        ...mapState({
            needTagsView: state => state.settings.tagsView,
            fixedHeader: state => state.settings.fixedHeader,
        }),
    },
    methods: {
        handleClickOutside() {
            this.$store.dispatch("app/closeSideBar", { withoutAnimation: false });
        },
    },
};
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";
@import "~@/styles/variables.module.scss";

.app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    overflow: auto;
    scrollbar-gutter: stable;
}
.drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
}

.fixed-header {
    transition: width 0.28s;
    z-index: 1;
    position: relative;
    .navbar {
        margin-bottom: 0;
    }
}

.sidebar-container {
    position: sticky;
    top: 0;
    z-index: 2;
}
</style>
