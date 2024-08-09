<template>
    <el-container class="retation-view">
        <!-- 功能操作区域 -->
        <el-header class="el-header-change retention-view-search">
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
                <!--初始行为选择-->
                <div class="firstEvent">
                    <el-form-item :label="metadata.firstEvent.label" prop="firstEvent">
                        <el-select
                            v-model="searchData.firstEvent"
                            clearable
                            filterable
                            remote
                            :remote-method="handleEventIdSearch.bind(undefined, 'first')"
                            :loading="metadata.firstEvent.loading"
                            @change="handleEventChange('first')"
                            @focus="handleEventIdFocus('first')"
                            placeholder="输入关键词搜索..."
                        >
                            <el-option
                                v-for="(item, index) in metadata.firstEvent.options"
                                :key="index + item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </el-form-item>
                </div>
                <!--初始行为-筛选条件-->
                <div class="firstConditions">
                    <el-row>
                        <el-form-item :label="metadata.firstConditions.label" prop="firstCondition">
                            <el-row class="mb-4">
                                <div
                                    class="condition-div"
                                    v-for="(condition, index) in searchData.firstCondition"
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
                                                @change="
                                                    handleEventConditionChange(
                                                        $event,
                                                        metadata.firstEventAttributesOptions.options,
                                                        condition
                                                    )
                                                "
                                            >
                                                <el-option
                                                    v-for="(option, attrIndex) in metadata
                                                        .firstEventAttributesOptions.options"
                                                    :key="'attr' + option.value + attrIndex"
                                                    :label="option.label"
                                                    :value="option.value"
                                                ></el-option>
                                            </el-select>
                                        </el-col>
                                        <el-col :span="6">
                                            <el-select
                                                v-model="condition.filterType"
                                                @change="handlerOperatorSelected('first', index)"
                                                clearable
                                                placeholder="操作符"
                                            >
                                                <el-option
                                                    v-for="(option, ftIndex) in metadata.firstConditions
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
                                                    handleFirstConditionValueOptions.bind(undefined, index)
                                                "
                                                :loading="metadata.firstConditions.loading"
                                                @focus="handleConditionValueFocus('first', index)"
                                                placeholder="value"
                                            >
                                                <el-option
                                                    v-for="(item, vsIndex) in metadata.firstConditions
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
                                                @click="deleteCondition('first', index)"
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
                                    @click="addCondition('first')"
                                />
                            </el-row>
                        </el-form-item>
                    </el-row>
                </div>
                <el-divider />
                <!--后续行为选择-->
                <div class="secondEvent">
                    <el-form-item :label="metadata.secondEvent.label" prop="secondEvent">
                        <el-select
                            v-model="searchData.secondEvent"
                            clearable
                            filterable
                            remote
                            :remote-method="handleEventIdSearch.bind(undefined, 'second')"
                            :loading="metadata.secondEvent.loading"
                            @change="handleEventChange('second')"
                            @focus="handleEventIdFocus('second')"
                            placeholder="输入关键词搜索..."
                        >
                            <el-option
                                v-for="(item, index) in metadata.secondEvent.options"
                                :key="index + item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </el-form-item>
                </div>
                <!--后续行为-筛选条件-->
                <div class="secondConditions">
                    <el-row>
                        <el-form-item :label="metadata.secondConditions.label" prop="secondCondition">
                            <el-row class="mb-4">
                                <div
                                    class="condition-div"
                                    v-for="(condition, index) in searchData.secondCondition"
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
                                                @change="
                                                    handleEventConditionChange(
                                                        $event,
                                                        metadata.secondEventAttributesOptions.options,
                                                        condition
                                                    )
                                                "
                                            >
                                                <el-option
                                                    v-for="(option, attrIndex) in metadata
                                                        .secondEventAttributesOptions.options"
                                                    :key="'attr' + option.value + attrIndex"
                                                    :label="option.label"
                                                    :value="option.value"
                                                ></el-option>
                                            </el-select>
                                        </el-col>
                                        <el-col :span="6">
                                            <el-select
                                                v-model="condition.filterType"
                                                @change="handlerOperatorSelected('second', index)"
                                                clearable
                                                placeholder="操作符"
                                            >
                                                <el-option
                                                    v-for="(option, ftIndex) in metadata.secondConditions
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
                                                    handleSecondConditionValueOptions.bind(undefined, index)
                                                "
                                                :loading="metadata.secondConditions.loading"
                                                @focus="handleConditionValueFocus('second', index)"
                                                placeholder="value"
                                            >
                                                <el-option
                                                    v-for="(item, vsIndex) in metadata.secondConditions
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
                                                @click="deleteCondition('second', index)"
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
                                    @click="addCondition('second')"
                                />
                            </el-row>
                        </el-form-item>
                    </el-row>
                </div>
                <el-divider />
                <!--用户条件-筛选条件-->
                <div class="conditions">
                    <el-row>
                        <el-form-item :label="metadata.conditions.label" prop="condition">
                            <el-row class="mb-4">
                                <div
                                    class="condition-div"
                                    v-for="(condition, index) in searchData.condition"
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
                                                @change="
                                                    handleEventConditionChange(
                                                        $event,
                                                        metadata.userAttributesOptions.options,
                                                        condition
                                                    )
                                                "
                                            >
                                                <el-option
                                                    v-for="(option, attrIndex) in metadata
                                                        .userAttributesOptions.options"
                                                    :key="'attr' + option.value + attrIndex"
                                                    :label="option.label"
                                                    :value="option.value"
                                                ></el-option>
                                            </el-select>
                                        </el-col>
                                        <el-col :span="6">
                                            <el-select
                                                v-model="condition.filterType"
                                                @change="handlerOperatorSelected('user', index)"
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
                                                    handleUserConditionValueOptions.bind(undefined, index)
                                                "
                                                :loading="metadata.conditions.loading"
                                                @focus="handleConditionValueFocus('user', index)"
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
                                        <el-col :span="6">
                                            <el-button
                                                type="danger"
                                                plain
                                                size="small"
                                                icon="el-icon-minus"
                                                @click="deleteCondition('user', index)"
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
                                    @click="addCondition('user')"
                                />
                            </el-row>
                        </el-form-item>
                    </el-row>

                    <el-button
                        @click="search()"
                        type="primary"
                        icon="el-icon-search"
                        :loading="configs.isLoading"
                        size="small"
                        class="search-btn"
                        >{{ configs.isLoading ? "查询中..." : "查询" }}</el-button
                    >
                </div>
                <el-divider />
                <el-row>
                    <el-form-item :label="metadata.time.label" prop="time">
                        <el-date-picker
                            v-model="searchData.time"
                            :clearable="false"
                            type="daterange"
                            align="right"
                            unlink-panels
                            range-separator=" 至 "
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            :picker-options="pickerOptions"
                        >
                        </el-date-picker>
                    </el-form-item>
                    <el-select v-model="searchData.duration" placeholder="请选择" size="small">
                        <el-option-group
                            v-for="group in metadata.duration"
                            :key="group.label"
                            :label="group.label"
                        >
                            <el-option
                                v-for="item in group.options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            >
                            </el-option>
                        </el-option-group>
                    </el-select>

                    <el-radio-group
                        v-model="metadata.table.type"
                        size="small"
                        style="float: right; margin-right: 5px"
                    >
                        <el-radio-button label="NUMBER">人数</el-radio-button>
                        <el-radio-button label="PERCENT">比例</el-radio-button>
                    </el-radio-group>
                </el-row>
            </el-form>
        </el-header>

        <!-- 图表区域 -->
        <el-main style="width: 100%; margin-top: 15px">
            <el-table
                v-if="metadata.table.type === 'NUMBER'"
                :data="metadata.table.data"
                stripe
                border
                :cell-class-name="getCellClassName"
                style="width: 100%"
            >
                <template v-for="col in metadata.table.columns">
                    <el-table-column
                        :key="col.value"
                        :prop="col.value"
                        :label="col.label"
                        align="center"
                    ></el-table-column>
                </template>
            </el-table>
            <el-table
                v-if="metadata.table.type === 'PERCENT'"
                :data="metadata.table.percentData"
                stripe
                border
                :cell-class-name="getCellClassName"
                style="width: 100%"
            >
                <template v-for="col in metadata.table.columns">
                    <el-table-column
                        :key="col.value"
                        :prop="col.value"
                        :label="col.label"
                        align="center"
                    ></el-table-column>
                </template>
            </el-table>
        </el-main>
        <create-dashboard-modal
            type="retention"
            v-if="dashboardVisible"
            :visible="dashboardVisible"
            :origin="computedSearchData"
            :computed="{}"
            @close="() => (this.dashboardVisible = false)"
            @create-panel-done="queryPanelsSearch"
        ></create-dashboard-modal>
    </el-container>
</template>

<script>
import { getPanelQueryById, getPanelsByType, updatePanel } from "@/api/dashboard";
import api from "@/api/live-view";
import optionsApi from "@/api/options";
import CreateDashboardModal from "@/components/CreateDashboardModal";
import Cookies from "js-cookie";
import { mapGetters } from "vuex";
import { getRetentionQuery, getTableColumn, getRetentionData } from "../../utils/retentionUtils";
import config from "./config";
import SearchHeader from "@/components/eventHeader/index.vue";

export default {
    name: "retention-view",
    components: {
        CreateDashboardModal,
        SearchHeader,
    },
    data() {
        return {
            // panel相关
            panelId: "",
            panelOptions: [],

            dashboardVisible: false,
            searchData: {
                appKey: [],
                firstEvent: "", // 初始行为
                firstCondition: [], // 初始行为-筛选条件
                secondEvent: "", // 后续行为
                secondCondition: [], // 后续行为-筛选条件
                condition: [], // 用户条件-筛选条件
                time: [], // 查询时间
                duration: "7-DAY",
                unit: "",
            },
            metadata: {
                ...config,
            },
            configs: {
                isLoading: false,
                emptyText: "",
            },
            formRules: {
                productCode: [{ required: true, message: "请选择产品", trigger: "blur" }],
                appKey: [{ required: true, message: "请选择应用类型", trigger: "blur" }],
                firstEvent: [{ required: true, message: "请选择初始行为", trigger: ["blur", "change"] }],
                secondEvent: [{ required: true, message: "请选择后续行为", trigger: ["blur", "change"] }],
            },
            pickerOptions: {
                shortcuts: [
                    {
                        text: "今天",
                        onClick(picker) {
                            const start = new Date(new Date());
                            const end = new Date(new Date());
                            picker.$emit("pick", [start, end]);
                        },
                    },
                    {
                        text: "昨天",
                        onClick(picker) {
                            const start = new Date(new Date());
                            const end = new Date(new Date());
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
        };
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
        panelText() {
            if (!this.panelId) {
                return "新建";
            }
            return "更新";
        },
        computedSearchData() {
            return {
                ...this.searchData,
                tableShowType: this.metadata.table.type,
            };
        },
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
                        "analysis_retention_searchData_" + this.productCodeAppKey.productCode,
                        JSON.stringify(newVal)
                    );
                }
            },
            deep: true,
        },
    },
    mounted() {
        if (
            this.productCodeAppKey.productCode &&
            this.productCodeAppKey.productCode.length &&
            this.productCodeAppKey.appKey &&
            this.productCodeAppKey.appKey.length > 0
        ) {
            this.reloadPage(false);
        }
    },
    activated() {
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
            if (this.$route.query.id && this.$route.query.name) {
                const { id, name } = this.$route.query;
                this.panelId = +id;
                this.panelName = name;
                this.queryPanelSearchById();
            } else if (Cookies.get("analysis_retention_searchData_" + this.productCodeAppKey.productCode)) {
                //从cookie中读取上次的选择条件
                this.searchData = JSON.parse(
                    Cookies.get("analysis_retention_searchData_" + this.productCodeAppKey.productCode)
                );
            } else {
                this.searchData = {
                    firstEvent: "", // 初始行为
                    firstCondition: [], // 初始行为-筛选条件
                    secondEvent: "", // 后续行为
                    secondCondition: [], // 后续行为-筛选条件
                    condition: [], // 用户条件-筛选条件
                    time: [], // 查询时间
                    duration: "7-DAY",
                    unit: "",
                };
            }

            this.searchData = {
                ...this.searchData,
                productCode: this.productCodeAppKey.productCode,
                appKey: this.productCodeAppKey.appKey,
            };

            this.handleUserEventAttributeFocus();
            this.handleEventIdFocus("first");
            this.handleEventIdFocus("second");
            this.initTime();
            this.getPanelOptions();
            this.clearData();
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

                // 可能多一个showTableType的字段，为了兼容看板
                const type = origin.tableShowType;
                Reflect.deleteProperty(origin, "tableShowType");
                if (type) {
                    this.metadata.table.type = type;
                }
                this.searchData = origin;
                this.searchData = {
                    ...this.searchData,
                    productCode: this.productCodeAppKey.productCode,
                    appKey: this.productCodeAppKey.appKey,
                };
                // 默认三天，不用当时保留的时间
                this.initTime();
                this.handleEventIdFocus("first");
                this.handleEventIdFocus("second");
                this.handleFirstEventAttributeFocus(
                    this.productCodeAppKey.appKey,
                    this.productCodeAppKey.productCode,
                    this.searchData.firstEvent
                );
                this.handleSecondEventAttributeFocus(
                    this.productCodeAppKey.appKey,
                    this.productCodeAppKey.productCode,
                    this.searchData.secondEvent
                );
                this.handleUserEventAttributeFocus();
            });
        },
        getPanelOptions() {
            getPanelsByType("retention", this.searchData.productCode).then(list => {
                this.panelOptions = list.map(el => {
                    return {
                        id: el.id,
                        name: el.name,
                    };
                });
            });
        },

        createDashboard() {
            if (this.metadata.table.data.length === 0) {
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
                        origin: this.computedSearchData,
                        computed: {},
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
                time: [this.toDateTimeString(start), this.toDateTimeString(end)],
            };
        },
        // 获取产品线下拉选项
        async handleProductCodeFocus() {
            const productCodeOptions = await optionsApi.getProductCodeOptions();
            // const productCodeOptions = await api.getProductCodeOptions();
            this.metadata = {
                ...this.metadata,
                productCode: {
                    ...this.metadata.productCode,
                    options: productCodeOptions,
                },
            };

            return productCodeOptions[0]?.value || null;
        },
        // 修改产品线下拉选项
        async productCodeChange(item) {
            this.searchData = {
                appKey: [],
                firstEvent: "", // 初始行为
                firstCondition: [], // 初始行为-筛选条件
                secondEvent: "", // 后续行为
                secondCondition: [], // 后续行为-筛选条件
                condition: [], // 用户条件-筛选条件
                time: [], // 查询时间
                duration: "7-DAY",
                productCode: item,
            };
            // let appKey = await this.handleAppKeyFocus(item);
            // this.searchData.appKey.push(appKey);
            this.initTime();
        },
        // 获取AppKey下拉选项
        async handleAppKeyFocus(productCode) {
            const appKeyOptions = await optionsApi.getAppKeyOptions({ productCode });
            // const appKeyOptions = await api.getAppKeyOptions({ productCode });
            this.metadata = {
                ...this.metadata,
                appKey: {
                    ...this.metadata.appKey,
                    options: appKeyOptions,
                },
            };
            return appKeyOptions[0]?.value || null;
        },
        // 获取事件下拉选项
        async handleEventIdFocus(type, queryString) {
            await this.handleEventIdSearch(type, "");
        },
        //事件搜索
        async handleEventIdSearch(type, queryString) {
            const { appKey, productCode } = this.searchData;
            switch (type) {
                case "first":
                    this.metadata.firstEvent.loading = true;
                    // 请求接口
                    const firstResults = await optionsApi.getEventIdOptions({
                        productCode,
                        appKey: appKey.join(","),
                        match: queryString,
                    });
                    this.metadata = {
                        ...this.metadata,
                        firstEvent: {
                            ...this.metadata.firstEvent,
                            options: firstResults,
                        },
                    };
                    this.metadata.firstEvent.loading = false;
                    return firstResults[0]?.value || null;
                case "second":
                    this.metadata.secondEvent.loading = true;
                    // 请求接口
                    const secondResults = await optionsApi.getEventIdOptions({
                        productCode,
                        appKey: appKey.join(","),
                        match: queryString,
                    });
                    this.metadata = {
                        ...this.metadata,
                        secondEvent: {
                            ...this.metadata.secondEvent,
                            options: secondResults,
                        },
                    };
                    this.metadata.secondEvent.loading = false;
                    return secondResults[0]?.value || null;
                default:
                    alert("错误类型");
            }
        },
        //事件变更
        async handleEventChange(type) {
            let { appKey, productCode } = this.searchData;
            switch (type) {
                case "first":
                    if (!appKey || !productCode || !this.searchData.firstEvent) {
                        break;
                    }
                    this.metadata.firstEventAttributesOptions.options = null;
                    await this.handleFirstEventAttributeFocus(
                        appKey,
                        productCode,
                        this.searchData.firstEvent
                    );
                    this.searchData = {
                        ...this.searchData,
                        firstCondition: [],
                    };
                    break;
                case "second":
                    if (!appKey || !productCode || !this.searchData.secondEvent) {
                        break;
                    }
                    this.metadata.secondEventAttributesOptions.options = null;
                    await this.handleSecondEventAttributeFocus(
                        appKey,
                        productCode,
                        this.searchData.secondEvent
                    );
                    this.searchData = {
                        ...this.searchData,
                        secondCondition: [],
                    };
                    break;
                default:
                    alert("错误类型");
            }
        },
        // /获取eventId的所有属性
        async handleFirstEventAttributeFocus(appKey, productCode, eventId) {
            // return eventAttributesOptions;
            let eventAttributesOptions = await api.getEventAttributes({
                appKey: appKey.join(","),
                productCode,
                eventId,
            });
            this.metadata = {
                ...this.metadata,
                firstEventAttributesOptions: {
                    ...this.metadata.firstEventAttributesOptions,
                    options: eventAttributesOptions,
                },
            };
        },
        async handleSecondEventAttributeFocus(appKey, productCode, eventId) {
            let eventAttributesOptions = await api.getEventAttributes({
                appKey: appKey.join(","),
                productCode,
                eventId,
            });
            this.metadata = {
                ...this.metadata,
                secondEventAttributesOptions: {
                    ...this.metadata.secondEventAttributesOptions,
                    options: eventAttributesOptions,
                },
            };
        },
        async handleUserEventAttributeFocus() {
            const { productCode, appKey } = this.productCodeAppKey;
            let eventAttributesOptions = await api.getEventAttributes({
                appKey: appKey.join(","),
                productCode,
            });
            this.metadata = {
                ...this.metadata,
                userAttributesOptions: {
                    ...this.metadata.userAttributesOptions,
                    options: eventAttributesOptions,
                },
            };
        },
        //筛选条件数据变更
        handleEventConditionChange(item, options, condition) {
            condition.attributeType = options.filter(e => e.value === item)[0]?.type;
        },
        // condition value 搜索
        async handleFirstConditionValueOptions(index, match) {
            this.metadata.firstConditions.valueOptions = [];
            this.metadata.firstConditions.loading = true;
            const attribute = this.searchData.firstCondition[index]?.attributeName || null;
            const { appKey, productCode, firstEvent } = this.searchData;
            let options = await api.getEventAttributeValues({
                appKey: appKey.join(","),
                productCode,
                eventId: firstEvent,
                attribute,
                match,
            });
            this.metadata = {
                ...this.metadata,
                firstConditions: {
                    ...this.metadata.firstConditions,
                    valueOptions: options,
                },
            };
            this.metadata.firstConditions.loading = false;
        },
        async handleSecondConditionValueOptions(index, match) {
            this.metadata.secondConditions.valueOptions = [];
            this.metadata.secondConditions.loading = true;
            const attribute = this.searchData.secondCondition[index]?.attributeName || null;
            const { appKey, productCode, secondEvent } = this.searchData;
            let options = await api.getEventAttributeValues({
                appKey: appKey.join(","),
                productCode,
                eventId: secondEvent,
                attribute,
                match,
            });
            this.metadata = {
                ...this.metadata,
                secondConditions: {
                    ...this.metadata.secondConditions,
                    valueOptions: options,
                },
            };
            this.metadata.secondConditions.loading = false;
        },
        async handleUserConditionValueOptions(index, match) {
            const { appKey, productCode, firstEvent, secondEvent } = this.searchData;
            if (!firstEvent) {
                this.$message({
                    type: "warning",
                    message: "请选择初始行为",
                });
                return;
            }
            if (!secondEvent) {
                this.$message({
                    type: "warning",
                    message: "请选择后续行为",
                });
                return;
            }
            this.metadata.conditions.valueOptions = [];
            this.metadata.conditions.loading = true;
            const attribute = this.searchData.condition[index]?.attributeName || null;
            let options = await api.getEventAttributeValues({
                appKey: appKey.join(","),
                productCode,
                eventId: firstEvent + "," + secondEvent,
                attribute,
                match,
            });
            this.metadata = {
                ...this.metadata,
                conditions: {
                    ...this.metadata.conditions,
                    valueOptions: options,
                },
            };
            this.metadata.conditions.loading = false;
        },
        async handleConditionValueFocus(type, index) {
            switch (type) {
                case "first":
                    await this.handleFirstConditionValueOptions(index, "");
                    break;
                case "second":
                    await this.handleSecondConditionValueOptions(index, "");
                    break;
                case "user":
                    await this.handleUserConditionValueOptions(index, "");
                    break;
                default:
                    alert("错误类型");
            }
        },
        handlerOperatorSelected(type, index) {
            switch (type) {
                case "first":
                    if (
                        "N_MTY" === this.searchData.firstCondition[index].filterType ||
                        "MTY" === this.searchData.firstCondition[index].filterType
                    ) {
                        this.searchData.firstCondition[index].showConditionValueSelect = false;
                    } else {
                        this.searchData.firstCondition[index].showConditionValueSelect = true;
                    }
                    break;
                case "second":
                    if (
                        "N_MTY" === this.searchData.secondCondition[index].filterType ||
                        "MTY" === this.searchData.secondCondition[index].filterType
                    ) {
                        this.searchData.secondCondition[index].showConditionValueSelect = false;
                    } else {
                        this.searchData.secondCondition[index].showConditionValueSelect = true;
                    }
                    break;
                case "user":
                    if (
                        "N_MTY" === this.searchData.condition[index].filterType ||
                        "MTY" === this.searchData.condition[index].filterType
                    ) {
                        this.searchData.condition[index].showConditionValueSelect = false;
                    } else {
                        this.searchData.condition[index].showConditionValueSelect = true;
                    }
                    break;
                default:
                    alert("错误类型");
            }
        },
        addCondition(type) {
            switch (type) {
                case "first":
                    this.searchData.firstCondition.push({
                        filterType: "EQ",
                        showConditionValueSelect: true,
                    });
                    break;
                case "second":
                    this.searchData.secondCondition.push({
                        filterType: "EQ",
                        showConditionValueSelect: true,
                    });
                    break;
                case "user":
                    this.searchData.condition.push({
                        filterType: "EQ",
                        showConditionValueSelect: true,
                    });
                    break;
                default:
                    alert("错误类型");
            }
        },
        deleteCondition(type, index) {
            switch (type) {
                case "first":
                    this.searchData.firstCondition.splice(index, 1);
                    break;
                case "second":
                    this.searchData.secondCondition.splice(index, 1);
                    break;
                case "user":
                    this.searchData.condition.splice(index, 1);
                    break;
                default:
                    alert("错误类型");
            }
        },
        async search() {
            if (!this.searchData.duration) {
                this.$message({
                    type: "warning",
                    message: "请选择留存维度",
                });
                return;
            }

            await this.$refs["form"].validate(async isValid => {
                if (isValid) {
                    this.configs.isLoading = true;
                    this.$track("event_retention_search");
                    this.doSearch();
                }
            });
        },
        clearData() {
            this.metadata.table.columns = [];
            this.metadata.table.data = [];
            this.metadata.table.percentData = [];
            this.metadata.chart.data.dimensions.data = [];
            this.metadata.chart.data.measures = [];
            this.metadata.chart.percentData.dimensions.data = [];
            this.metadata.chart.percentData.measures = [];
        },
        async doSearch() {
            // 清空上次查询结果
            this.clearData();
            const params = this.getQueryParam();
            // 封装表头参数
            this.getTableColumns(params.duration, params.unit);
            const cb = (lineData, linePercentData) => {
                this.metadata.table.data.push(lineData);
                this.metadata.table.percentData.push(linePercentData);
            };
            const finallyCb = () => {
                this.configs.isLoading = false;
            };
            getRetentionData(params, cb, finallyCb);
        },
        getQueryParam() {
            return getRetentionQuery(this.searchData);
        },
        getTableColumns(duration, unit) {
            this.metadata.table.columns = getTableColumn(duration, unit);
        },
        getCellClassName({ row, column, rowIndex, columnIndex }) {
            if (columnIndex > 1) {
                const field = column.property;
                const value = row[field];
                if (value || value === 0) {
                    return "cell-stage";
                }
                return "cell-empty";
            }
        },
        ChangeDecimalToPercentage(data) {
            var data1 = (data * 100).toFixed(2) + "%";
            return data1;
        },
        ChangeDecimal(data) {
            var data1 = (data * 100).toFixed(2);
            return data1;
        },
        // geyChartData(duration, startDatas, data) {
        //     if (!data) {
        //         return;
        //     }
        //     this.metadata.chart.data.dimensions.data = startDatas.slice(0, duration);
        //     const newDate = {};
        //     const newDateArr = [];
        //     for (let index = 0; index < duration; index++) {
        //         newDateArr.push(data[index]);
        //     }
        //     newDate["data"] = newDateArr;
        //     newDate["name"] = "汇总";
        //     this.metadata.chart.data.measures.push(newDate);

        //     this.metadata.chart.percentData.dimensions.data = startDatas.slice(0, duration);
        //     const newPerDate = {};
        //     const newPerDateArr = [];
        //     const startUserCount = data[0];
        //     for (let index = 0; index < duration; index++) {
        //         const percentValue = startUserCount ? this.ChangeDecimal(data[index] / startUserCount) : 0;
        //         newPerDateArr.push(percentValue);
        //     }
        //     newPerDate["name"] = "汇总";
        //     newPerDate["data"] = newPerDateArr;
        //     this.metadata.chart.percentData.measures.push(newPerDate);
        // }
    },
};
</script>
<style lang="scss">
.retation-view {
    .conditions {
        display: flex;
        align-items: center;
        .search-btn {
            margin-left: auto;
            margin-right: 0;
            align-self: self-end;
        }
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
    .firstEvent {
        margin-bottom: 20px;
    }
    .secondEvent {
        margin-bottom: 20px;
    }
    .cell-empty {
        visibility: hidden;
    }

    .cell-stage {
        color: #606266;
        background-color: #cceeff !important;
    }
}
</style>
