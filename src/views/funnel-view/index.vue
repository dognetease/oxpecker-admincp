<template>
    <el-container class="live-view">
        <!-- 功能操作区域 -->
        <el-header class="el-header-change live-view-search">
            <!-- <div class="panel">
                <el-select :value="panelId" @change="onPanelChange" placeholder="请选择查询" clearable>
                    <el-option
                        v-for="item in panelOptions"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                    ></el-option>
                </el-select>
                <el-button class="query-btn" type="primary" @click="createDashboard">{{ panelText }}</el-button>
            </div> -->
            <search-header
                :spread="isSpread"
                :search="panelId"
                :searchOption="panelOptions"
                @search-change="onPanelChange"
                @btn-click="createDashboard"
            ></search-header>
            <el-form
                :inline="true"
                label-width="auto"
                ref="form"
                :rules="formRules"
                :model="searchData"
                size="small"
            >
                <!--步骤选择-->
                <el-form-item :label="metadata.steps.label" />
                <el-row justify="center">
                    <el-tabs
                        v-model="status.selectTab"
                        tab-position="left"
                        closable
                        class="step-tabs"
                        @tab-remove="deleteStep"
                        style="margin-top: 20px; margin-left: 50px"
                    >
                        <el-tab-pane
                            v-for="(step, stepIndex) in searchData.steps"
                            closable
                            :key="'step_tab' + stepIndex"
                            :label="'第' + (stepIndex + 1) + '步'"
                            :name="stepIndex.toString()"
                        >
                            <el-row :gutter="10" style="margin-bottom: 20px">
                                <!--选择EventId-->
                                <el-form-item :label="metadata.eventId.label" prop="eventId">
                                    <el-col :span="12">
                                        <el-select
                                            v-model="step.eventId"
                                            clearable
                                            filterable
                                            remote
                                            :remote-method="handleEventIdSearch"
                                            :loading="metadata.eventId.loading"
                                            @change="handleEventChange($event, stepIndex)"
                                            @focus="handleEventIdFocus"
                                            placeholder="输入关键词搜索事件..."
                                        >
                                            <el-option
                                                v-for="(item, index) in metadata.eventId.options"
                                                :key="index + item.value"
                                                :label="item.label"
                                                :value="item.value"
                                            />
                                        </el-select>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-input
                                            v-model="step.name"
                                            placeholder="给步骤设置一个名字"
                                            clearable
                                        />
                                    </el-col>
                                </el-form-item>
                            </el-row>
                            <el-row>
                                <!--选择过滤条件-->
                                <el-form-item :label="metadata.conditions.label" prop="condition">
                                    <el-row class="mb-4">
                                        <div
                                            class="condition-div"
                                            v-for="(condition, conditionIndex) in step.conditions"
                                            :key="conditionIndex"
                                        >
                                            <el-row :gutter="10">
                                                <el-col :span="6">
                                                    <!-- 过滤条件属性选择 -->
                                                    <el-select
                                                        v-model="condition.attributeName"
                                                        clearable
                                                        filterable
                                                        default-first-option
                                                        placeholder="属性"
                                                        @change="
                                                            handleEventConditionChange(
                                                                $event,
                                                                metadata.conditions.eventAttributesOptions[
                                                                    step.eventId
                                                                ],
                                                                condition
                                                            )
                                                        "
                                                    >
                                                        <el-option
                                                            v-for="(option, attrIndex) in metadata.conditions
                                                                .eventAttributesOptions[step.eventId]"
                                                            :key="'attr' + option.value + attrIndex"
                                                            :label="option.label"
                                                            :value="option.value"
                                                        ></el-option>
                                                    </el-select>
                                                </el-col>
                                                <!-- 过滤条件操作符选择 -->
                                                <el-col :span="6">
                                                    <el-select
                                                        v-model="condition.filterType"
                                                        @change="
                                                            handlerOperatorSelected(
                                                                stepIndex,
                                                                conditionIndex,
                                                                condition.filterType
                                                            )
                                                        "
                                                        clearable
                                                        placeholder="操作符"
                                                    >
                                                        <el-option
                                                            v-for="(option, ftIndex) in metadata.conditions
                                                                .operatorOptions"
                                                            :key="'op' + option.label + ftIndex"
                                                            :label="option.label"
                                                            :value="option.value"
                                                        ></el-option>
                                                    </el-select>
                                                </el-col>
                                                <!-- 过滤条件value选择 -->
                                                <el-col :span="6">
                                                    <el-select
                                                        v-model="condition.valueSet"
                                                        clearable
                                                        filterable
                                                        allow-create
                                                        default-first-option
                                                        multiple
                                                        remote
                                                        v-show="condition.showConditionValueSelect"
                                                        :loading="metadata.conditions.loading"
                                                        :remote-method="
                                                            handleConditionValueOptions.bind(
                                                                undefined,
                                                                step.eventId,
                                                                condition.attributeName
                                                            )
                                                        "
                                                        @focus="
                                                            handleConditionValueFocus(
                                                                step.eventId,
                                                                condition.attributeName
                                                            )
                                                        "
                                                        placeholder="value"
                                                    >
                                                        <el-option
                                                            v-for="(item, vsIndex) in metadata.conditions
                                                                .valueOptions"
                                                            :key="'value' + item.label + vsIndex"
                                                            :label="item.label"
                                                            :value="item.value"
                                                        />
                                                    </el-select>
                                                </el-col>
                                                <!-- 删除过滤条件-->
                                                <el-col :span="6">
                                                    <el-button
                                                        type="danger"
                                                        plain
                                                        size="small"
                                                        icon="el-icon-minus"
                                                        @click="deleteCondition(stepIndex, conditionIndex)"
                                                    ></el-button>
                                                </el-col>
                                            </el-row>
                                        </div>
                                    </el-row>
                                    <el-row>
                                        <el-button
                                            type="primary"
                                            plain
                                            size="small"
                                            icon="el-icon-plus"
                                            @click="addCondition(stepIndex)"
                                        />
                                    </el-row>
                                </el-form-item>
                            </el-row>
                            <el-row>
                                <el-form-item
                                    :label="metadata.conditionRelationType.label"
                                    style="margin-top: 20px"
                                >
                                    <el-radio-group v-model="step.conditionRelationType">
                                        <el-radio-button label="AND"></el-radio-button>
                                        <el-radio-button label="OR"></el-radio-button>
                                    </el-radio-group>
                                </el-form-item>
                            </el-row>
                        </el-tab-pane>
                    </el-tabs>
                </el-row>
                <el-row>
                    <el-button
                        type="primary"
                        plain
                        size="small"
                        @click="addStep"
                        style="float: left; margin-left: 65px; margin-top: 30px"
                        >添加步骤</el-button
                    >
                </el-row>
                <el-divider />
                <!-- 筛选条件 -->
                <el-row>
                    <el-form-item :label="metadata.conditions.label" prop="condition">
                        <el-row class="mb-4">
                            <div
                                class="condition-div"
                                v-for="(condition, index) in searchData.funnelCondition.conditions"
                                :key="index"
                            >
                                <el-row :gutter="20">
                                    <el-col :span="6">
                                        <el-select
                                            v-model="condition.attributeName"
                                            clearable
                                            filterable
                                            default-first-option
                                            placeholder="属性"
                                            @focus="funnelConditionAttributeFocus"
                                            @change="
                                                handleEventConditionChange(
                                                    $event,
                                                    metadata.funnelCondition.attributesOptions,
                                                    condition
                                                )
                                            "
                                        >
                                            <el-option
                                                v-for="(option, attrIndex) in metadata.funnelCondition
                                                    .attributesOptions"
                                                :key="'funnel_condition_attr' + option.value + attrIndex"
                                                :label="option.label"
                                                :value="option.value"
                                            ></el-option>
                                        </el-select>
                                    </el-col>
                                    <el-col :span="6">
                                        <el-select
                                            v-model="condition.filterType"
                                            @change="funnelConditionOperatorSelected(index)"
                                            clearable
                                            placeholder="操作符"
                                        >
                                            <el-option
                                                v-for="(option, ftIndex) in metadata.conditions
                                                    .operatorOptions"
                                                :key="'op' + option.label + ftIndex"
                                                :label="option.label"
                                                :value="option.value"
                                            ></el-option>
                                        </el-select>
                                    </el-col>
                                    <el-col :span="6">
                                        <el-select
                                            v-model="condition.valueSet"
                                            v-show="condition.showConditionValueSelect"
                                            clearable
                                            filterable
                                            allow-create
                                            default-first-option
                                            multiple
                                            remote
                                            :remote-method="
                                                funnelConditionValueOptions.bind(
                                                    undefined,
                                                    index,
                                                    condition.attributeName
                                                )
                                            "
                                            :loading="metadata.funnelCondition.loading"
                                            @focus="funnelConditionValueFocus(index, condition.attributeName)"
                                            placeholder="value"
                                        >
                                            <el-option
                                                v-for="(item, vsIndex) in metadata.funnelCondition
                                                    .valueOptions"
                                                :key="'value' + item.label + vsIndex"
                                                :label="item.label"
                                                :value="item.value"
                                            />
                                        </el-select>
                                    </el-col>
                                    <el-col :span="6">
                                        <el-button
                                            type="danger"
                                            plain
                                            size="small"
                                            icon="el-icon-minus"
                                            @click="deleteFunnelCondition(index)"
                                        ></el-button>
                                    </el-col>
                                </el-row>
                            </div>
                        </el-row>
                        <el-row>
                            <el-button
                                type="primary"
                                plain
                                size="small"
                                icon="el-icon-plus"
                                @click="addFunnelCondition"
                            />
                        </el-row>
                    </el-form-item>
                </el-row>
                <el-row>
                    <el-form-item :label="metadata.conditionRelationType.label" style="margin-top: 20px">
                        <el-radio-group v-model="searchData.funnelCondition.conditionRelationType">
                            <el-radio-button label="AND"></el-radio-button>
                            <el-radio-button label="OR"></el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </el-row>
                <el-divider />
                <el-row style="margin-top: 40px">
                    <!-- 转化周期选择 -->
                    <el-row>
                        <el-form-item :label="metadata.duration.label">
                            <el-select v-model="searchData.duration" size="small" style="width: 80px">
                                <el-option
                                    v-for="item in metadata.duration.options"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                >
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-row>
                    <el-row style="margin-top: 20px">
                        <el-form-item :label="metadata.timeRange.label">
                            <el-date-picker
                                v-model="searchData.time"
                                :clearable="false"
                                :picker-options="pickerOptions"
                                type="daterange"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                range-separator=" 至 "
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"
                                :default-time="['00:00:00', '23:59:59']"
                                style="width: 270px"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <!-- 搜索按钮 -->
                        <el-button
                            @click="search()"
                            type="primary"
                            icon="el-icon-search"
                            :loading="configs.isLoading"
                            style="float: right"
                            >{{ configs.isLoading ? "查询中..." : "查询" }}</el-button
                        >
                    </el-row>
                </el-row>
                <el-divider />
            </el-form>
        </el-header>

        <!-- 图表区域 -->
        <el-main
            v-loading="configs.isLoading"
            element-loading-text="加载中..."
            style="width: 100%; margin-top: 15px"
        >
            <div class="chart-box">
                <funnel-chart :dataList="funnelList"></funnel-chart>
            </div>
            <el-table :data="metadata.table.data" border fit>
                <el-table-column
                    v-for="(tableColumn, i) in metadata.table.columns"
                    :key="i"
                    :prop="tableColumn.prop"
                    :label="tableColumn.label"
                />
            </el-table>
        </el-main>
        <create-dashboard-modal
            type="funnel"
            v-if="dashboardVisible"
            :visible="dashboardVisible"
            :origin="searchData"
            :computed="queryData"
            @close="() => (this.dashboardVisible = false)"
            @create-panel-done="queryPanelsSearch"
        ></create-dashboard-modal>
    </el-container>
</template>

<script>
import optionsApi from "@/api/options";
import api from "@/api/live-view";
import config from "./config";
import Cookies from "js-cookie";
import CreateDashboardModal from "@/components/CreateDashboardModal";
import { getPanelQueryById, getPanelsByType, updatePanel } from "@/api/dashboard";
import { mapGetters } from "vuex";
import FunnelChart from "../../components/G2Plot/FunnelChart/index.vue";
import SearchHeader from "@/components/eventHeader/index.vue";

export default {
    name: "funnel-view",
    components: {
        CreateDashboardModal,
        FunnelChart,
        SearchHeader,
    },
    computed: {
        isSpread() {
            return this.$route.query.id !== undefined;
        },
        ...mapGetters(["globalState"]),
        productCodeAppKey() {
            const productCode = this.globalState.productId;
            const appKey = this.globalState.appKey;
            return { productCode, appKey };
        },
        queryData() {
            return this.getQueryParam();
        },
        panelText() {
            if (!this.panelId) {
                return "新建";
            }
            return "更新";
        },
    },
    data() {
        return {
            // panel相关
            panelId: "",
            panelOptions: [],

            dashboardVisible: false,
            searchData: {
                appKey: [],
                time: [],
                duration: "DAY_1",
                steps: [
                    { conditions: [], conditionRelationType: "AND" },
                    { conditions: [], conditionRelationType: "AND" },
                ],
                funnelCondition: {
                    conditions: [],
                    conditionRelationType: "AND",
                },
            },
            metadata: {
                ...config,
            },
            configs: {
                isLoading: false,
                showType: "Line",
            },
            status: {
                selectTab: 0,
            },
            aggregationValueLabelMap: new Map(),
            formRules: {
                productCode: [{ required: true, message: "请选择产品", trigger: "blur" }],
                appKey: [{ required: true, message: "请选择应用类型", trigger: "blur" }],
                // eventId: [{ required: true, message: "请选择事件", trigger: "change" }]
            },
            pickerOptions: {
                shortcuts: [
                    {
                        text: "今天",
                        onClick(picker) {
                            const start = new Date(new Date().setHours(0, 0, 0, 0));
                            const end = new Date(new Date().setHours(23, 59, 59, 0));
                            picker.$emit("pick", [start, end]);
                        },
                    },
                    {
                        text: "昨天",
                        onClick(picker) {
                            const start = new Date(new Date().setHours(0, 0, 0, 0));
                            const end = new Date(new Date().setHours(23, 59, 59, 0));
                            start.setTime(start.getTime() - 3600 * 1000 * 24);
                            end.setTime(end.getTime() - 3600 * 1000 * 24);
                            picker.$emit("pick", [start, end]);
                        },
                    },
                    {
                        text: "最近三天",
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
                            picker.$emit("pick", [start, end]);
                        },
                    },
                    {
                        text: "最近一周",
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit("pick", [start, end]);
                        },
                    },
                    {
                        text: "最近一个月",
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit("pick", [start, end]);
                        },
                    },
                    {
                        text: "最近三个月",
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            picker.$emit("pick", [start, end]);
                        },
                    },
                ],
            },
            props: {
                multiple: true,
                expandTrigger: "hover",
            },
            // chartOption: {},
            funnelList: [],
        };
    },
    watch: {
        productCodeAppKey(val, oldVal) {
            const isInit = oldVal.appKey.length === 0;
            if (
                val.productCode &&
                val.productCode.length &&
                val.appKey &&
                val.appKey.length > 0 &&
                val.appKey.slice().sort().toString() !== oldVal.appKey.slice().sort().toString()
            ) {
                this.reloadPage(isInit);
            }
        },
        searchData: {
            handler(newVal, oldVal) {
                if (this.productCodeAppKey.productCode && this.productCodeAppKey.productCode.length) {
                    Cookies.set(
                        "analysis_funnel_searchData_" + this.productCodeAppKey.productCode,
                        JSON.stringify(newVal)
                    );
                }
            },
            deep: true,
        },
    },
    mounted: async function () {
        if (
            this.productCodeAppKey.productCode &&
            this.productCodeAppKey.productCode.length &&
            this.productCodeAppKey.appKey &&
            this.productCodeAppKey.appKey.length > 0
        ) {
            this.reloadPage(false);
        }
    },
    methods: {
        reloadPage(isInit) {
            if (isInit && this.$route.query.searchData) {
                const { eventId } = JSON.parse(decodeURIComponent(this.$route.query.searchData));
                this.searchData.eventId = eventId;
                this.funnelConditionAttributeFocus();
                this.searchData.steps.forEach(step => {
                    if (step.eventId) {
                        this.handleEventAttributeFocus(step.eventId);
                        this.handleEventIdFocus();
                    }
                });
            } else if (this.$route.query.id && this.$route.query.name) {
                const { id, name } = this.$route.query;
                this.panelId = +id;
                this.panelName = name;
                this.queryPanelSearchById();
            } else if (Cookies.get("analysis_funnel_searchData_" + this.productCodeAppKey.productCode)) {
                ////从cookie中读取上次的选择条件
                this.searchData = JSON.parse(
                    Cookies.get("analysis_funnel_searchData_" + this.productCodeAppKey.productCode)
                );
                this.funnelConditionAttributeFocus();
                this.searchData.steps.forEach(step => {
                    if (step.eventId) {
                        this.handleEventAttributeFocus(step.eventId);
                        this.handleEventIdFocus();
                    }
                });
            } else {
                this.searchData = {
                    duration: "DAY_1",
                    steps: [
                        { conditions: [], conditionRelationType: "AND" },
                        { conditions: [], conditionRelationType: "AND" },
                    ],
                    funnelCondition: {
                        conditions: [],
                        conditionRelationType: "AND",
                    },
                };
            }

            this.searchData = {
                ...this.searchData,
                productCode: this.productCodeAppKey.productCode,
                appKey: this.productCodeAppKey.appKey,
            };
            this.getPanelOptions();
            this.initTime();
            this.metadata.table.data = [];
        },

        queryPanelsSearch(panelId) {
            this.getPanelOptions();
            this.panelId = panelId;
        },
        onPanelChange(value) {
            this.panelId = value;
            if (this.panelId) {
                this.queryPanelSearchById();
            }
        },
        queryPanelSearchById() {
            getPanelQueryById(this.panelId).then(resp => {
                const { content } = resp;
                const { origin } = JSON.parse(content);
                this.searchData = origin;
                this.searchData = {
                    ...this.searchData,
                    productCode: this.productCodeAppKey.productCode,
                    appKey: this.productCodeAppKey.appKey,
                };

                this.funnelConditionAttributeFocus();
                this.searchData.steps.forEach(step => {
                    if (step.eventId) {
                        this.handleEventAttributeFocus(step.eventId);
                        this.handleEventIdFocus();
                    }
                });
                this.doSearch();
            });
        },
        getPanelOptions() {
            getPanelsByType("funnel", this.searchData.productCode).then(list => {
                this.panelOptions = list.map(el => {
                    return {
                        id: el.id,
                        name: el.name,
                    };
                });
            });
        },
        //筛选条件数据变更
        handleEventConditionChange(item, options, condition) {
            condition.attributeType = options.filter(e => e.value === item)[0]?.type;
        },
        createDashboard() {
            if (this.funnelList.length === 0) {
                this.$message({
                    message: "请先执行有数据的查询",
                    type: "error",
                });
                return;
            }
            // 直接去更新查询面板的参数
            if (this.panelId) {
                updatePanel({
                    id: this.panelId,
                    content: JSON.stringify({
                        origin: this.searchData,
                        computed: this.queryData,
                    }),
                }).then(() => {
                    this.$message({
                        type: "success",
                        message: "更新查询成功",
                    });
                });
                return;
            }
            this.dashboardVisible = true;
        },
        getTime() {
            let startTime = this.searchData.time?.[0];
            let endTime = this.searchData.time?.[1];
            return [startTime, endTime];
        },
        toDateTimeString(dateTime) {
            let d = new Date(dateTime),
                month = "" + (d.getMonth() + 1),
                day = "" + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) month = "0" + month;
            if (day.length < 2) day = "0" + day;

            return [year, month, day].join("-");
        },
        // 设置默认时间
        initTime() {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
            this.searchData = {
                ...this.searchData,
                time: [this.toDateTimeString(start) + " 00:00:00", this.toDateTimeString(end) + " 23:59:59"],
            };
        },
        // 获取事件下拉选项
        async handleEventIdFocus(queryString) {
            await this.handleEventIdSearch("");
        },
        //事件搜索
        async handleEventIdSearch(queryString) {
            const { appKey, productCode } = this.searchData;
            this.metadata.eventId.loading = true;
            // 请求接口
            const results = await optionsApi.getEventIdOptions({
                productCode,
                appKey: appKey.join(","),
                match: queryString,
            });
            this.metadata = {
                ...this.metadata,
                eventId: {
                    ...this.metadata.eventId,
                    options: results,
                },
            };
            this.metadata.eventId.loading = false;
            return results[0]?.value || null;
        },
        //事件变更
        async handleEventChange(eventId, stepIndex) {
            let { appKey, productCode } = this.searchData;
            this.searchData.steps[stepIndex].conditions = [];
            let eventAttributesOptions = null;
            if (
                this.metadata.conditions.eventAttributesOptions[eventId] &&
                this.metadata.conditions.eventAttributesOptions[eventId].length > 0
            ) {
            } else {
                eventAttributesOptions = await api.getEventAttributes({
                    appKey: appKey.join(","),
                    productCode,
                    eventId,
                });
                this.metadata.conditions.eventAttributesOptions[eventId] = [];
                this.metadata.conditions.eventAttributesOptions[eventId] = eventAttributesOptions;
            }
        },
        async handleEventAttributeFocus(eventId) {
            let { appKey, productCode } = this.searchData;
            let eventAttributesOptions = null;
            if (
                this.metadata.conditions.eventAttributesOptions[eventId] &&
                this.metadata.conditions.eventAttributesOptions[eventId].length > 0
            ) {
            } else {
                eventAttributesOptions = await api.getEventAttributes({
                    appKey: appKey.join(","),
                    productCode,
                    eventId,
                });
                this.metadata.conditions.eventAttributesOptions[eventId] = [];
                this.metadata.conditions.eventAttributesOptions[eventId] = eventAttributesOptions;
            }
        },
        // condition value 搜索
        async handleConditionValueOptions(eventId, attribute, match) {
            this.metadata.conditions.loading = true;
            const { appKey, productCode } = this.searchData;
            this.metadata.conditions.valueOptions = await api.getEventAttributeValues({
                appKey: appKey.join(","),
                productCode,
                eventId,
                attribute,
                match,
            });
            this.metadata.conditions.loading = false;
        },
        async handleConditionValueFocus(eventId, attribute) {
            this.metadata.conditions.valueOptions = [];
            await this.handleConditionValueOptions(eventId, attribute, "");
        },
        handlerOperatorSelected(stepIndex, conditionIndex, filterType) {
            this.searchData.steps[stepIndex].conditions[conditionIndex].showConditionValueSelect = !(
                "N_MTY" === filterType || "MTY" === filterType
            );
        },
        // step condition
        addCondition(stepIndex) {
            this.searchData.steps[stepIndex].conditions.push({
                filterType: "EQ",
                showConditionValueSelect: true,
            });
        },
        deleteCondition(stepIndex, conditionIndex) {
            this.searchData.steps[stepIndex].conditions.splice(conditionIndex, 1);
        },
        //step
        addStep() {
            this.searchData.steps.push({
                conditions: [],
                // eventId: "",
                conditionRelationType: "AND",
            });
        },
        deleteStep(index) {
            if (this.searchData.steps.length > 2) {
                this.searchData.steps.splice(index, 1);
                this.status.selectTab = (Number(this.status.selectTab) - 1).toString();
            }
        },
        // funnel condition
        addFunnelCondition() {
            this.searchData.funnelCondition.conditions.push({
                filterType: "EQ",
                showConditionValueSelect: true,
            });
        },
        deleteFunnelCondition(index) {
            this.searchData.funnelCondition.conditions.splice(index, 1);
        },
        //过滤条件属性下拉框
        async funnelConditionAttributeFocus() {
            let { appKey, productCode } = this.searchData;
            let eventAttributesOptions = null;
            if (
                this.metadata.funnelCondition.attributesOptions ||
                this.metadata.funnelCondition.attributesOptions.length === 0
            ) {
                eventAttributesOptions = await api.getEventAttributes({
                    appKey: appKey.join(","),
                    productCode,
                });
                this.metadata.funnelCondition.attributesOptions = eventAttributesOptions;
            }
        },
        funnelConditionOperatorSelected(index) {
            this.searchData.funnelCondition.conditions[index].showConditionValueSelect = !(
                "N_MTY" === this.searchData.funnelCondition.conditions[index].filterType ||
                "MTY" === this.searchData.funnelCondition.conditions[index].filterType
            );
        },
        async funnelConditionValueOptions(index, attribute, match) {
            this.metadata.funnelCondition.loading = true;
            let eventId = this.searchData.steps
                .map(function (element) {
                    return `${element.eventId}`;
                })
                .reduce((a, b) => a + "," + b);
            if (!eventId) return;

            this.metadata.funnelCondition.valueOptions = [];
            const { appKey, productCode } = this.searchData;
            this.metadata.funnelCondition.valueOptions = await api.getEventAttributeValues({
                appKey: appKey.join(","),
                eventId,
                productCode,
                attribute,
                match,
            });
            this.metadata.funnelCondition.loading = false;
        },
        async funnelConditionValueFocus(index, attributeName) {
            if (!attributeName) return;
            await this.funnelConditionValueOptions(index, attributeName, "");
        },
        search() {
            this.$refs["form"].validate(isValid => {
                if (isValid) {
                    try {
                        this.configs.isLoading = true;
                        this.$track("event_funnal_search");
                        this.doSearch();
                    } catch (err) {
                        this.configs.isLoading = false;
                    }
                }
            });
        },
        doSearch() {
            this.metadata.table.data = [];
            api.funnelQuery(this.getQueryParam())
                .then(data => {
                    // const option = createEchartsOption(data);
                    // this.chartOption = option;
                    this.funnelList = data;

                    // table format
                    let len = data.length;
                    for (let i = 0; i < len; i++) {
                        let item = data[i];

                        let cr = "";
                        let lr = "";
                        if (i !== len - 1) {
                            let rTotal = item.count;
                            let total = parseFloat(rTotal);
                            let crNum = parseFloat(data[i + 1].count);
                            let crPercent =
                                total <= 0 ? "0%" : Math.round((crNum / total) * 10000) / 100.0 + "%";
                            cr = crNum + " / " + crPercent;

                            let lrNum = rTotal - crNum;
                            let lrPercent =
                                total <= 0 ? "0%" : Math.round((lrNum / total) * 10000) / 100.0 + "%";
                            lr = lrNum + " / " + lrPercent;
                        }
                        this.metadata.table.data.push({
                            stepName: item.name ? item.name : item.eventId,
                            count: item.count,
                            cr: cr,
                            lr: lr,
                        });
                    }
                })
                .finally(() => {
                    this.configs.isLoading = false;
                });
        },
        getQueryParam() {
            const params = Object.assign({}, this.searchData);
            // 处理时间头尾
            let [startTime, endTime] = this.getTime();
            params.startTime = startTime.split(" ")[0] + " 00:00:00";
            params.endTime = endTime.split(" ")[0] + " 23:59:59";
            // 删除多余字段
            Reflect.deleteProperty(params, "time");
            return params;
        },
    },
};
</script>
<style lang="scss">
.live-view {

    .chart-box {
        display: flex;
        justify-content: center;
        margin-bottom: 50px;
    }

    &-filter {
        display: flex;

        .el-form-item__content {
            margin-left: 9px;
        }
    }

    .el-range-separator {
        padding: 0;
    }
    .el-row {
        margin-bottom: 0;
    }
    .el-button {
        margin-bottom: 0;
    }
    .condition-div {
        margin-bottom: 5px;
    }
    .el-form-item {
        margin-bottom: 0;
        font-weight: bold;
    }

    .step-tabs > .el-tabs__content {
        padding-left: 50px;
    }

    .box-wrap {
        align-items: center;
        width: 100%;
        margin-top: 15px;
        display: flex;
        flex-direction: column;
        gap: 50px;
        .grid-content {
            position: relative;
        }
        .childnums {
            position: absolute;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
        }
    }
}
</style>
