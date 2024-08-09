<template>
    <div class="view">
        <div class="filter" v-if="!isEditPanel">
            <span class="name">{{ dashboardName }}</span>
            <el-form :inline="true" ref="filter-form" :model="dashboardQuery" class="form" :rules="formRules">
                <el-form-item label="时间" prop="dateRange" class="date">
                    <el-date-picker
                        v-model="dashboardQuery.dateRange"
                        :picker-options="pickerOptions"
                        type="daterange"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                    ></el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSearchCharts">查询</el-button>
                </el-form-item>
                <el-button type="primary" @click="editDashboardPanel">编辑视图</el-button>
            </el-form>
        </div>
        <div v-else class="flex justify-end gap-x-5">
            <el-button type="danger" @click="cancelEditPanel">取消</el-button>
            <el-button type="primary" @click="confirmEditPanel" :loading="resizePanelLoading">保存</el-button>
        </div>
        <div class="body" v-loading="loadingPanels">
            <div class="amplified" v-if="amplifyIndex !== -1">
                <chart-panels
                    :isAmplify="amplifyData.isAmplify"
                    :name="amplifyData.name"
                    :id="amplifyData.id"
                    :chartData="amplifyData.chartData"
                    :tableData="amplifyData.tableData"
                    :tableColumn="amplifyData.tableColumn"
                    :type="amplifyData.type"
                    :loading="amplifyData.loading"
                    :isPrivate="isPrivateDashboard"
                    @delete-panel="deletePanel"
                    @share-panel="sharePanel"
                    @move-panel="movePanel"
                    @amplify-panel="amplifyPanel"
                    @shrink-panel="shrinkPanel"
                    @edit-panel-name="editPanelName"
                    @edit-search="gotoEditPage"
                ></chart-panels>
            </div>
            <grid-layout
                v-else-if="panels.length > 0"
                :layout.sync="panels"
                :is-draggable="isDraggable"
                :is-resizable="isResizable"
                :row-height="150"
                :responsive="false"
                :col-num="4"
                :vertical-compact="true"
                :isBounded="true"
            >
                <grid-item
                    v-for="chart in panels"
                    :key="chart.id"
                    :x="chart.x"
                    :y="chart.y"
                    :w="chart.w"
                    :h="chart.h"
                    :i="chart.i"
                    :style="{
                        touchAction: 'none',
                    }"
                >
                    <chart-panels
                        :isAmplify="chart.isAmplify"
                        :name="chart.name"
                        :id="chart.id"
                        :chartData="chart.chartData"
                        :tableData="chart.tableData"
                        :tableColumn="chart.tableColumn"
                        :type="chart.type"
                        :loading="chart.loading"
                        :isPrivate="isPrivateDashboard"
                        @delete-panel="deletePanel"
                        @share-panel="sharePanel"
                        @move-panel="movePanel"
                        @amplify-panel="amplifyPanel"
                        @shrink-panel="shrinkPanel"
                        @edit-panel-name="editPanelName"
                        @edit-search="gotoEditPage"
                    ></chart-panels>
                </grid-item>
            </grid-layout>
            <div class="empty" v-else-if="!loadingPanels && panels.length === 0">
                <span class="text">暂无数据，请前往【行为分析】新建查询</span>
                <el-button @click="gotoBehavior" type="primary" style="width: 118px">前往</el-button>
            </div>
        </div>
        <share-dialog
            :type="shareType"
            :visible="shareVisible"
            :id="shareId"
            :foldersRoot="
                folderList.length ? (shareType === 'panel' ? [folderList[1]] : [folderList[0]]) : []
            "
            @close="() => (this.shareVisible = false)"
            @share-panel-done="() => (this.shareVisible = false)"
            @move-panel-done="
                () => {
                    this.shareVisible = false;
                    this.getAllPanels();
                }
            "
        ></share-dialog>
        <delete-dialog
            type="panel"
            :visible="deleteVisible"
            :id="deleteId"
            @close="() => (this.deleteVisible = false)"
            @delete-panel="
                () => {
                    this.deleteVisible = false;
                    this.getAllPanels();
                }
            "
        ></delete-dialog>
    </div>
</template>

<script>
import ChartPanels from "./panels.vue";
import { getPanels, updatePanel, updateDashboard } from "@/api/dashboard";
import liveViewApi from "@/api/live-view";
import optionApi from "@/api/options";
import { mapGetters } from "vuex";
import dayjs from "dayjs";
import ShareDialog from "./shareDialog.vue";
import DeleteDialog from "./deleteDialog.vue";
import { ChartSummaryData, ChartDetailData } from "../../utils/liveviewUtils";
import { getRetentionData, getTableColumn, getRetentionQuery } from "../../utils/retentionUtils";
import { getPanelSankeyData } from "@/api/pathAnalysis";
import SankeyData from "../path-analysis/dataOperate";
import { getTimeRangeOption } from "@/utils/index";
import VueGridLayout from "vue-grid-layout";
import _ from "lodash";
import { getData as getProportionData } from "@/views/proportion-view/api";
import { useDetailDataFormat } from "@/utils/hooks/useDetailDataFormat";
import { useSummaryDataFormat } from "@/utils/hooks/useSummaryDataFormat";
import { toPercent } from "@/utils/index";

const getIndexesAndDimensions = (indexes, dimensions) => {
    const indexKey = indexes.map(el => {
        return el.index;
    });
    const lineSum = 10;
    const checkedDimension = Math.ceil(lineSum / indexKey.length);
    const dimensionKey = dimensions
        .filter((_, i) => {
            return i < checkedDimension;
        })
        .map(el => el.key);
    return {
        indexes: indexKey,
        dimensions: dimensionKey,
    };
};

export default {
    name: "DashboardView",
    components: {
        ChartPanels,
        ShareDialog,
        DeleteDialog,
        GridLayout: VueGridLayout.GridLayout,
        GridItem: VueGridLayout.GridItem,
        // VueDraggable,
    },
    props: {
        dashboardName: {
            type: String,
            default: "未命名看板",
        },
        dashboardId: {
            type: Number,
            require: true,
        },
        isPrivateDashboard: {
            type: Boolean,
            require: true,
        },
        folderList: {
            type: Array,
            default: () => [],
        },
    },

    watch: {
        // dashboard id就绪之后，productCode是一定存在的
        dashboardId() {
            if (this.dashboardId !== -1) {
                this.getAllPanels().then(() => {
                    this.amplifyIndex = -1;
                });
                this.getApplications();
                this.resetForm();
            }
        },
    },
    computed: {
        amplifyData() {
            if (this.amplifyIndex === -1) {
                return {};
            }
            return this.panels[this.amplifyIndex];
        },
        ...mapGetters(["globalState"]),
        productCode() {
            return this.globalState.productId;
        },
        appKey() {
            return this.globalState.appKey;
        },
    },
    data() {
        return {
            // 快捷选项
            pickerOptions: getTimeRangeOption(),
            dashboardQuery: {
                dateRange: [dayjs().subtract(3, "d").toDate(), dayjs().toDate()],
            },
            formRules: {
                dateRange: [
                    {
                        validator: (_, value, cb) => {
                            if (value.length === 0) {
                                cb(new Error("请选择日期范围"));
                                return;
                            }
                            cb();
                        },
                        trigger: "change",
                    },
                ],
            },
            panels: [],
            amplifyIndex: -1,
            loadingPanels: false,

            apps: [],

            shareVisible: false,
            shareId: -1,
            shareType: "panel",

            deleteVisible: false,
            deleteId: -1,

            // 拖拽编辑
            isDraggable: false,
            isResizable: false,
            isEditPanel: false,
            resizePanelLoading: false,
            oldLayout: null,
        };
    },
    activated() {
        this.getAllPanels();
    },
    methods: {
        // 视图编辑相关
        getLayoutInfo(items = []) {
            return _.map(items, each => {
                return {
                    i: each.i,
                    x: each.x,
                    y: each.y,
                    w: each.w,
                    h: each.h,
                };
            });
        },
        setPanelLayout(layouts = []) {
            this.panels = _.map(this.panels, (p, i) => {
                const item = layouts[i];
                return {
                    ...p,
                    ...item,
                };
            });
        },
        editDashboardPanel() {
            this.isEditPanel = true;
            this.isDraggable = true;
            this.isResizable = true;
            this.oldLayout = this.getLayoutInfo(this.panels);
        },
        cancelEditPanel() {
            this.isEditPanel = false;
            this.isDraggable = false;
            this.isResizable = false;
            this.setPanelLayout(this.oldLayout);
            this.oldLayout = null;
        },
        confirmEditPanel() {
            this.isDraggable = false;
            this.isResizable = false;

            this.resizePanelLoading = true;
            const panelSequence = this.getLayoutInfo(this.panels);
            updateDashboard({ id: this.dashboardId, panelSequence: JSON.stringify(panelSequence) })
                .then(() => {
                    this.isEditPanel = false;
                    this.oldLayout = null;
                })
                .finally((this.resizePanelLoading = false));
        },
        createLayout(list = []) {
            if (list.length === 0) {
                return;
            }
            const hasLayout = _.every(list, each => each.position && typeof each.position === "string");
            if (hasLayout) {
                this.panels = _.map(list, el => {
                    const position = JSON.parse(el.position);
                    Reflect.deleteProperty(el, "position");
                    return {
                        ...el,
                        isAmplify: false,
                        chartData: {},
                        tableData: [],
                        tableColumn: [],
                        type: "",
                        loading: true,
                        editId: this.isPrivateDashboard ? el.id : el.linkId,
                        ...position,
                    };
                });
            } else {
                this.panels = _.map(list, (el, index) => {
                    return {
                        ...el,
                        isAmplify: false,
                        chartData: {},
                        tableData: [],
                        tableColumn: [],
                        type: "",
                        loading: true,
                        editId: this.isPrivateDashboard ? el.id : el.linkId,
                        i: el.id,
                        x: index % 2 === 0 ? 0 : 2,
                        y: Math.floor(index / 2),
                        w: 2,
                        h: 2,
                    };
                });
            }
        },

        getAllPanels() {
            if (this.dashboardId === -1) {
                return;
            }
            this.panels = [];
            this.loadingPanels = true;
            return getPanels(this.dashboardId).then(panels => {
                // 生成布局信息
                this.createLayout(panels);
                Promise.all(
                    panels.map((each, index) => {
                        const { content, type } = each;
                        const queryObj = JSON.parse(content);
                        if (this.appKey.length > 0) {
                            if (queryObj.computed) {
                                queryObj.computed.appKey = [...this.appKey];
                            }
                            if (queryObj.origin) {
                                queryObj.origin.appKey = [...this.appKey];
                            }
                        }
                        switch (type) {
                            case "custom":
                                return this.queryEvent(queryObj.computed, index);

                            case "funnel":
                                return this.queryFunnel(queryObj.computed, index);

                            case "retention":
                                return this.queryPreserve(queryObj.origin, index);

                            case "sankey":
                                return this.querySankey(queryObj.computed, index);

                            case "proportion":
                                return this.queryProportion(queryObj.computed, index);
                            default:
                                return new Promise((resolve, reject) => {
                                    reject("unknown query type, please check again!");
                                });
                        }
                    })
                )
                    .catch(err => console.error(err))
                    .finally(() => {
                        this.loadingPanels = false;
                    });
            });
        },

        resetForm() {
            this.$refs["filter-form"].resetFields();
        },
        onSearchCharts() {
            this.$refs["filter-form"].validate(valid => {
                if (valid) {
                    this.getAllPanels();
                }
            });
        },
        getCurrentTimes() {
            if (this.dashboardQuery.dateRange.length <= 0) {
                return null;
            }
            let [begin, end] = this.dashboardQuery.dateRange;
            begin = dayjs(begin).format("YYYY-MM-DD") + " 00:00:00";
            end = dayjs(end).format("YYYY-MM-DD") + " 23:59:59";
            return [begin, end];
        },

        queryEvent(query, index) {
            const timeSpan = this.getCurrentTimes();
            if (timeSpan) {
                const [startTime, endTime] = timeSpan;
                query.startTime = startTime;
                query.endTime = endTime;
            }

            liveViewApi.query(query).then(data => {
                const { searchType = "detail" } = query;
                let format = null;
                let option = null;

                if (searchType === "detail") {
                    const chartDetailData = new ChartDetailData();
                    format = chartDetailData;
                    chartDetailData.setChartOriginData(data);
                    const { indexes, dimensions } = getIndexesAndDimensions(
                        format.getIndexes(),
                        format.getDimensions()
                    );

                    option = format.getLineOption(indexes, dimensions).option;
                    option.type = "line";
                } else {
                    const chartSummaryData = new ChartSummaryData();
                    format = chartSummaryData;
                    chartSummaryData.setChartOriginData(data);

                    const { indexes, dimensions } = getIndexesAndDimensions(
                        format.getIndexes(),
                        format.getDimensions()
                    );
                    option = format.getBarOption(indexes, dimensions).option;
                    option.type = "bar";
                }

                // 一定是有数据的，无数据不能新建查询
                const target = this.panels[index];
                this.$set(this.panels, index, {
                    ...target,
                    chartData: option,
                    loading: false,
                    type: "custom",
                });
            });
        },
        queryPreserve(query, index) {
            query.time = this.dashboardQuery.dateRange;
            const tableShowType = query.tableShowType ?? "NUMBER";
            const param = getRetentionQuery(query);
            const tableColumn = getTableColumn(param.duration, param.unit);
            const tableData = [];
            this.$set(this.panels, index, {
                ...this.panels[index],
                tableColumn,
                type: "retention",
                tableData,
            });
            const cb = (lineData, percentData) => {
                const target = this.panels[index];
                if (target && target.type === "retention") {
                    const list = this.panels[index].tableData.slice();
                    if (tableShowType === "NUMBER") {
                        list.push(lineData);
                    } else {
                        list.push(percentData);
                    }

                    this.$set(this.panels, index, {
                        ...this.panels[index],
                        loading: false,
                        tableData: list,
                    });
                }
            };
            const finalCb = () => {
                this.$set(this.panels, index, {
                    ...this.panels[index],
                    loading: false,
                });
            };
            getRetentionData(param, cb, finalCb);
        },
        queryFunnel(query, index) {
            const timeSpan = this.getCurrentTimes();
            if (timeSpan) {
                const [startTime, endTime] = timeSpan;
                query.startTime = startTime;
                query.endTime = endTime;
            }
            liveViewApi.funnelQuery(query).then(data => {
                const target = this.panels[index];
                this.$set(this.panels, index, {
                    ...target,
                    loading: false,
                    chartData: data,
                    type: "funnel",
                });
            });
        },

        queryProportion(query, index) {
            const timeSpan = this.getCurrentTimes();
            if (timeSpan) {
                query.startTime = timeSpan[0];
                query.endTime = timeSpan[1];
            }
            const type = query.searchType;
            let chartConf = {};
            getProportionData(query).then(data => {
                if (type === "detail") {
                    const detailFormat = useDetailDataFormat();
                    detailFormat.setSourceData(data);
                    const groupKeys = detailFormat.getGroups();
                    const chartData = detailFormat.getChartDataByCond(groupKeys.slice(0, 10));
                    chartConf = {
                        xField: "time",
                        yField: "value",
                        seriesField: "category",
                        data: chartData,
                        yAxis: {
                            label: {
                                formatter: toPercent,
                            },
                        },
                        tooltip: {
                            formatter(datum) {
                                const value = toPercent(datum.value, 2);
                                return {
                                    name: datum.category,
                                    value,
                                };
                            },
                        },
                        type: "line",
                    };
                } else {
                    const summaryFormat = useSummaryDataFormat();
                    summaryFormat.setSourceData(data);
                    const groupKeys = summaryFormat.getGroups();
                    const chartData = summaryFormat.getChartDataByCond(groupKeys.slice(0, 10));
                    chartConf = {
                        xField: "group",
                        yField: "value",
                        seriesField: "name",
                        data: chartData,
                        isGroup: "true",
                        maxColumnWidth: 100,
                        yAxis: {
                            label: {
                                formatter: toPercent,
                            },
                        },
                        tooltip: {
                            formatter(datum) {
                                const value = toPercent(datum.value, 2);
                                return {
                                    name: datum.name,
                                    value,
                                };
                            },
                        },
                        type: "bar",
                    };
                }
                const target = this.panels[index];
                this.$set(this.panels, index, {
                    ...target,
                    loading: false,
                    chartData: chartConf,
                    type: "proportion",
                });
            });
        },

        querySankey(query, index) {
            const timeSpan = this.getCurrentTimes();
            if (timeSpan) {
                const [startTime, endTime] = timeSpan;
                query.startTime = startTime;
                query.endTime = endTime;
            }
            getPanelSankeyData(query).then(data => {
                const { nodes = [] } = data;
                const list = nodes.reduce((acc, cur) => {
                    let { parentId, eventIdCountPairs = [] } = cur;
                    eventIdCountPairs = eventIdCountPairs.map(each => {
                        return {
                            parentId,
                            visited: true,
                            value: each.count || 0,
                            id: each.id,
                            eventId: each.eventId,
                        };
                    });
                    return acc.concat(eventIdCountPairs);
                }, []);
                const firstNode = list.find(each => each.parentId === null);
                firstNode.value = nodes.find(each => each.parentId === firstNode.id)?.total;
                const sankeyData = new SankeyData();
                sankeyData.setOrder(query.searchDirection === "next" ? "begin" : "end");
                sankeyData.replaceData(list);
                const target = this.panels[index];
                this.$set(this.panels, index, {
                    ...target,
                    loading: false,
                    chartData: sankeyData.getOption(),
                    operateClass: sankeyData,
                    type: "sankey",
                });
            });
        },

        gotoBehavior() {
            this.$router.replace({
                name: "live-view",
            });
        },
        deletePanel(id) {
            this.deleteId = id;
            this.deleteVisible = true;
        },
        sharePanel(id) {
            this.shareType = "panel";
            this.shareId = id;
            this.shareVisible = true;
        },
        movePanel(id) {
            this.shareType = "move-panel";
            this.shareId = id;
            this.shareVisible = true;
        },

        findIndexById(id) {
            let index = -1;
            for (index = 0; index < this.panels.length; index++) {
                const item = this.panels[index];
                if (item.id === id) {
                    break;
                }
            }
            return index;
        },
        amplifyPanel(id) {
            this.amplifyIndex = this.findIndexById(id);
            if (this.amplifyIndex !== -1) {
                this.$set(this.panels, this.amplifyIndex, {
                    ...this.panels[this.amplifyIndex],
                    isAmplify: true,
                });
            }
        },

        shrinkPanel() {
            if (this.amplifyIndex !== -1) {
                this.$set(this.panels, this.amplifyIndex, {
                    ...this.panels[this.amplifyIndex],
                    isAmplify: false,
                });
            }
            this.amplifyIndex = -1;
        },

        editPanelName(id, name) {
            updatePanel({ id, name }).then(() => {
                this.getAllPanels();
            });
        },

        gotoEditPage(id) {
            const match = this.panels.find(each => each.id === id);
            if (match) {
                const auth = match.permissionControl;
                if (!auth) {
                    this.$message({
                        message: "无编辑权限，请联系管理员！",
                        type: "error",
                    });
                    return;
                }
                const { canEdit = false } = auth;
                if (!canEdit) {
                    this.$message({
                        message: "无编辑权限，请联系管理员！",
                        type: "error",
                    });
                    return;
                }

                const type = match.type;
                let name = "";
                switch (type) {
                    case "custom":
                        name = "live-view";
                        break;
                    case "funnel":
                        name = "funnel-view";
                        break;
                    case "retention":
                        name = "retention-view";
                        break;
                    case "sankey":
                        name = "path-analysis";
                        break;
                    case "proportion":
                        name = "proportion";
                        break;
                    default:
                        throw new Error("unknown chart type");
                }
                this.$router.push({
                    name,
                    query: {
                        id: match.editId,
                        name: match.name,
                    },
                });
            } else {
                throw new Error("can't match search, please check chart id");
            }
        },

        getApplications() {
            optionApi
                .getAppKeyOptions({
                    productCode: this.productCode,
                })
                .then(resp => {
                    this.apps = resp;
                });
        },
    },
};
</script>

<style lang="scss" scoped>
.view {
    .filter {
        display: flex;
        align-items: center;
        margin-bottom: 20px;

        .name {
            font-size: 16px;
            font-weight: bold;
        }

        .form {
            margin-left: auto;
            margin-right: 7px;

            ::v-deep .el-form-item {
                margin-bottom: 0;

                label {
                    margin-bottom: 0;
                }
            }
            .date {
                ::v-deep .el-date-editor--daterange {
                    width: 260px;
                }
            }
        }
    }

    .flip-list-move {
        transition: transform 0.5s;
    }

    .no-move {
        transition: transform 0s;
    }

    .ghost {
        opacity: 0.5;
        background: #c8ebfb;
    }

    .chart-group {
        display: grid;
        // min-width: 0;
        // min-height: 0;
        grid-template-columns: 1fr 1fr;
        column-gap: 20px;
        row-gap: 20px;
        position: relative;

        margin-right: 17px;

        &-item {
            min-width: 0;
        }
    }

    .empty {
        padding: 100px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        row-gap: 30px;
    }
}
</style>
