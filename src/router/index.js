import Vue from "vue";
import Router from "vue-router";
import track from "@/utils/dataTracker";
import { isUserLogin, registerUserId } from "@/utils/dataTracker";

Vue.use(Router);

/* Layout */
import Layout from "@/layout";

export const constantRoutes = [
    {
        path: "/404",
        component: () => import("@/views/404"),
        hidden: true,
    },
    // {
    //     path: "/",
    //     redirect: {
    //         name: "proportion",
    //     },
    // },
    {
        path: "/",
        redirect: "/behavior/event",
    },
    // 产品线管理
    {
        path: "/product/index",
        component: () => import("@/views/product/index"),
    },
    {
        path: "/behavior",
        component: Layout,
        meta: { title: "行为分析" },
        children: [
            {
                path: "event",
                component: () => import("@/views/live-view/index"),
                name: "live-view",
                meta: { title: "事件分析" },
            },
            {
                path: "retention",
                component: () => import("@/views/retention-view/index"),
                name: "retention-view",
                meta: { title: "留存分析" },
            },
            {
                path: "funnel",
                component: () => import("@/views/funnel-view/index"),
                name: "funnel-view",
                meta: { title: "漏斗分析" },
            },
            {
                path: "/pathAnalysis",
                component: () => import("@/views/path-analysis/index.vue"),
                name: "path-analysis",
                meta: {
                    title: "路径分析",
                },
            },
            {
                path: "/proportion",
                component: () => import("@/views/proportion-view/proportion-index.vue"),
                name: "proportion",
                meta: {
                    title: "占比分析",
                },
            },
            {
                path: "/self-analysis",
                component: () => import("@/views/self-analysis/index.vue"),
                name: "self-analysis",
                meta: {
                    title: "自主分析",
                },
            },
        ],
    },
    {
        path: "/buried",
        component: Layout,
        meta: { title: "埋点管理" },
        children: [
            {
                path: "input",
                component: () => import("@/views/entry-buried/index.vue"),
                // component: () => import("@/views/entry-buried/index"),
                name: "entry-buried",
                meta: { title: "埋点录入" },
            },
            {
                path: "search",
                component: () => import("@/views/query-buried/index"),
                name: "query-buried",
                meta: { title: "埋点查询" },
            },
            {
                path: "virtual",
                component: () => import("@/views/virtual-event/virtual.vue"),
                name: "virtual-event",
                meta: { title: "虚拟事件" },
            },
        ],
    },
    {
        path: "/dashboard",
        component: Layout,
        children: [
            {
                path: "index",
                component: () => import("@/views/dashboard/index"),
                name: "dashboard",
                meta: {
                    title: "数据看板",
                },
            },
        ],
    },
    {
        path: "/debug",
        component: Layout,
        children: [
            {
                path: "index",
                component: () => import("@/views/debug/index"),
                name: "debug",
                meta: { title: "实时调试" },
            },
        ],
    },
    {
        path: "/application",
        component: Layout,
        children: [
            {
                path: "index",
                component: () => import("@/views/application/index"),
                name: "application",
                meta: { title: "应用管理" },
            },
        ],
    },
    {
        path: "/product-user-permission",
        component: Layout,
        children: [
            {
                path: "index",
                component: () => import("@/views/product-user-permission/index"),
                name: "product-user-permission",
                meta: { title: "用户产品权限" },
            },
        ],
    },
    {
        path: "/redirect/:path*",
        component: () => import("@/views/redirect/index"),
        hidden: true,
    },
    // 404 page must be placed at the end !!!
    { path: "*", redirect: "/404", hidden: true },
];

export const asyncRoutes = [];

const createRouter = () =>
    new Router({
        // mode: 'history', // require service support
        scrollBehavior: () => ({ y: 0 }),
        routes: constantRoutes,
    });

const router = createRouter();
const pvLabel = "oxpecker_web_accessPath";
router.beforeEach((to, from, next) => {
    const path = to.path;
    if (isUserLogin()) {
        track(pvLabel, {
            path,
        });
        next();
    } else {
        registerUserId()
            .then(() => {
                track(pvLabel, {
                    path,
                });
            })
            .finally(() => {
                next();
            });
    }
});

export function resetRouter() {
    const newRouter = createRouter();
    router.matcher = newRouter.matcher; // reset router
}
export default router;
