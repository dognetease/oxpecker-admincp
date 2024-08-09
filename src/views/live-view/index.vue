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
                <!--事件选择-->
                <div>
                    <el-form-item :label="metadata.eventId.label" prop="eventId">
                        <el-select
                            v-model="searchData.eventId"
                            clearable
                            filterable
                            remote
                            :remote-method="handleEventIdSearch"
                            :loading="metadata.eventId.loading"
                            @change="handleEventChange"
                            @focus="handleEventIdFocus"
                            placeholder="输入关键词搜索..."
                        >
                            <el-option
                                v-for="(item, index) in metadata.eventId.options"
                                :key="index + item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item> 的</el-form-item>
                    <el-form-item>
                        <el-cascader
                            :props="props"
                            separator="的"
                            clearable
                            v-model="searchData.displays"
                            :options="metadata.displays.options"
                        />
                    </el-form-item>
                </div>
                <!--筛选条件-->
                <el-divider />
                <div>
                    <el-row>
                        <el-form-item :label="metadata.conditions.label" prop="condition">
                            <el-row class="mb-4">
                                <div
                                    class="condition-div"
                                    v-for="(condition, index) in searchData.conditions"
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
                                                        metadata.eventAttributesOptions.options,
                                                        condition
                                                    )
                                                "
                                            >
                                                <el-option
                                                    v-for="(option, attrIndex) in metadata
                                                        .eventAttributesOptions.options"
                                                    :key="'attr' + option.value + attrIndex"
                                                    :label="option.label"
                                                    :value="option.value"
                                                ></el-option>
                                            </el-select>
                                        </el-col>
                                        <el-col :span="6">
                                            <el-select
                                                v-model="condition.filterType"
                                                @change="handlerOperatorSelected(index)"
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
                                                    handleConditionValueOptions.bind(undefined, index)
                                                "
                                                :loading="metadata.conditions.loading"
                                                @focus="handleConditionValueFocus(index)"
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
                                                @click="deleteCondition(index)"
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
                                    @click="addCondition"
                                />
                            </el-row>
                        </el-form-item>
                    </el-row>
                    <el-row>
                        <el-form-item :label="metadata.conditionRelationType.label" style="margin-top: 20px">
                            <el-radio-group v-model="searchData.conditionRelationType">
                                <el-radio-button label="AND"></el-radio-button>
                                <el-radio-button label="OR"></el-radio-button>
                            </el-radio-group>
                        </el-form-item>
                    </el-row>
                </div>
                <el-divider />
                <!--选择维度-->
                <div>
                    <el-row>
                        <el-form-item :label="metadata.groupFields.label" prop="groupFields">
                            按
                            <el-select
                                v-model="searchData.groupFields"
                                @change="onGroupFieldsChange"
                                clearable
                                multiple
                                filterable
                                default-first-option
                                placeholder="选择维度"
                            >
                                <el-option
                                    v-for="(item, index) in metadata.groupFields.options"
                                    :key="'groupby' + item.value + index"
                                    :label="item.label"
                                    :value="item.value"
                                />
                            </el-select>
                            查看
                        </el-form-item>

                        <el-button
                            @click="search()"
                            type="primary"
                            icon="el-icon-search"
                            :loading="chartLoading"
                            style="margin-top: 10px; float: right"
                            >{{ chartLoading ? "查询中..." : "查询" }}
                        </el-button>
                    </el-row>
                </div>
                <el-divider />

                <div class="condition">
                    <el-form-item prop="time">
                        <el-date-picker
                            v-model="searchData.time"
                            :clearable="false"
                            :picker-options="pickerOptions"
                            type="daterange"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            range-separator=" - "
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            :default-time="['00:00:00', '23:59:59']"
                            style="width: 240px"
                        >
                        </el-date-picker>
                    </el-form-item>
                    <el-select
                        v-model="searchData.interval"
                        placeholder="请选择"
                        size="small"
                        style="width: 80px; margin-right: 10px"
                    >
                        <el-option
                            v-for="item in metadata.interval"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        >
                        </el-option>
                    </el-select>
                    <el-button
                        @click="download()"
                        type="primary"
                        icon="el-icon-download"
                        :loading="chartLoading"
                        size="small"
                        >下载
                    </el-button>

                    <div class="chart">
                        <el-select
                            v-model="searchData.searchType"
                            @change="onSearchTypeChange"
                            style="width: 80px"
                        >
                            <el-option key="detail" value="detail" label="明细"></el-option>
                            <el-option key="summary" value="summary" label="汇总"></el-option>
                        </el-select>
                        <el-radio-group v-model="chartType">
                            <el-radio-button
                                v-if="searchData.searchType === 'detail'"
                                label="Line"
                            ></el-radio-button>
                            <el-radio-button label="Bar"></el-radio-button>
                            <el-radio-button
                                v-if="searchData.searchType === 'summary'"
                                label="Pie"
                            ></el-radio-button>
                        </el-radio-group>
                        <chart-config
                            :disabled="chartLoading"
                            :indexes="indexes"
                            :dimensions="dimensions"
                            :checkTop10="checkTop10"
                            @toggle-top10="toggleTop10"
                            @toggle-indexes="toggleIndexes"
                            @toggle-dimensions="toggleDimensions"
                        ></chart-config>
                    </div>
                </div>
            </el-form>
        </el-header>

        <!-- 图表区域 -->
        <el-main
            v-loading="chartLoading"
            element-loading-text="加载中..."
            style="width: 100%; margin-top: 15px"
        >
            <h4>表格数据</h4>
            <div class="chart-wrapper">
                <div class="no-data" v-if="isEmptyChart">暂无数据</div>
                <div class="chart" v-else-if="chartType === 'Line' || chartType === 'Bar'">
                    <line-chart v-if="chartType === 'Line'" :option="chartOption"></line-chart>
                    <bar-chart v-if="chartType === 'Bar'" :option="chartOption"></bar-chart>
                </div>
                <div class="chart-pie" v-else>
                    <div class="pie" v-for="(option, idx) in pieChartOptions" :key="idx">
                        <pie-chart :option="option"></pie-chart>
                    </div>
                </div>
            </div>
            <h4 class="table-title">table数据</h4>
            <el-table
                :data="metadata.table.data.slice((currentPage - 1) * pagesize, currentPage * pagesize)"
                :current-page.sync="currentPage"
                border
                fit
            >
                <el-table-column
                    v-for="(tableColumn, i) in metadata.table.columns"
                    :key="i"
                    :prop="tableColumn.prop"
                    :label="tableColumn.label"
                />
            </el-table>
            <div class="pagination">
                <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :page-sizes="[20, 40, 60]"
                    :page-size="pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total"
                >
                </el-pagination>
            </div>
        </el-main>
        <create-dashboard-modal
            type="custom"
            v-if="dashboardVisible"
            :visible="dashboardVisible"
            :origin="searchData"
            :computed="queryData"
            :name="panelName"
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
import ChartConfig from "@/components/chart-config.vue";
import { ChartDetailData, ChartSummaryData } from "../../utils/liveviewUtils";
import dayjs from "dayjs";
import LineChart from "@/components/G2Plot/LineChart/index.vue";
import BarChart from "@/components/G2Plot/BarChart/index.vue";
import PieChart from "@/components/G2Plot/PieChart/index.vue";
import SearchHeader from "@/components/eventHeader/index.vue";
import _ from "lodash";

const chartDetailData = new ChartDetailData();
const chartSummaryData = new ChartSummaryData();
const storeCookiePreKey = "analysis_custom_searchData_v1";

export default {
    name: "Live-view",
    components: {
        CreateDashboardModal,
        ChartConfig,
        LineChart,
        BarChart,
        PieChart,
        SearchHeader,
    },
    data() {
        return {
            // panel相关
            panelId: "",
            panelOptions: [],
            panelName: "",

            // chart相关
            indexes: [],
            dimensions: [],
            disableConfig: false,
            checkTop10: true,
            chartType: "Line",
            chartLoading: false,
            chartOption: {},
            pieChartOptions: [],
            isEmptyChart: true,

            downloadLoading: false,

            stripe: true, //是否为斑马纹 table
            tableData: [],
            currentPage: 1,
            pagesize: 20,
            total: 0,
            searchData: {
                appKey: [],
                eventId: "",
                displays: [],
                conditions: [],
                conditionRelationType: "AND",
                groupFields: [],
                time: [],
                interval: "DAY",
                // 图表类型
                searchType: "detail",
            },
            metadata: {
                ...config,
            },
            // configs: {
            //     isLoading: false,
            //     showType: "Line"
            // },
            aggregationValueLabelMap: new Map(),
            formRules: {
                productCode: [{ required: true, message: "请选择产品", trigger: "blur" }],
                appKey: [{ required: true, message: "请选择应用类型", trigger: "blur" }],
                eventId: [{ required: true, message: "请选择事件", trigger: "change" }],
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
            dashboardVisible: false,
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
        productCode() {
            return this.globalState.productId;
        },
        queryData() {
            return this.getQueryParam(this.searchData);
        },
        panelText() {
            if (!this.panelId) {
                return "新建";
            }
            return "更新";
        },
        checkedIndexes() {
            return this.indexes.filter(el => el.checked).map(el => el.index);
        },
        checkedDimensions() {
            return this.dimensions.filter(el => el.checked).map(el => el.key);
        },
        chartQueries() {
            return {
                indexes: this.checkedIndexes,
                dimensions: this.checkedDimensions,
                chartType: this.chartType,
            };
        },
        storeSearchData() {
            return _.omit(this.searchData, ["productCode", "appKey"]);
        },
    },
    watch: {
        // productCodeAppKey(val, oldVal) {
        //     const isInit = oldVal.appKey.length === 0;
        //     if (
        //         val.productCode &&
        //         val.productCode.length &&
        //         val.appKey &&
        //         val.appKey.length > 0 &&
        //         val.appKey.slice().sort().toString() !== oldVal.appKey.slice().sort().toString()
        //     ) {
        //         console.log('object');
        //         this.reloadPage(isInit);
        //     }
        // },
        storeSearchData: {
            handler() {
                if (this.productCodeAppKey.productCode && this.productCodeAppKey.productCode.length) {
                    Cookies.set(
                        storeCookiePreKey + this.productCodeAppKey.productCode,
                        JSON.stringify(this.searchData)
                    );
                }
            },
            deep: true,
        },
        productCode(code, oldCode) {
            const isInit = oldCode === "";
            this.reloadPage(isInit);
        },
        chartQueries(val) {
            this.createChartDetailData(this.searchData.searchType, val);
        },
        globalState: {
            deep: true,
            handler() {
                this.searchData = {
                    ...this.searchData,
                    productCode: this.productCodeAppKey.productCode,
                    appKey: this.productCodeAppKey.appKey,
                };
            }
        }
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
    methods: {
        createChartDetailData(searchType, query) {
            const { indexes, dimensions, chartType } = query;
            if (searchType === "detail") {
                // 明细场景下只有折线图、柱状图
                switch (chartType) {
                    case "Line": {
                        const { option, hasData } = chartDetailData.getLineOption(indexes, dimensions);
                        this.chartOption = option;
                        this.isEmptyChart = !hasData;
                        break;
                    }

                    case "Bar": {
                        const { option, hasData } = chartDetailData.getBarOption(indexes, dimensions);
                        this.chartOption = option;
                        this.isEmptyChart = !hasData;
                        break;
                    }
                }
            } else if (searchType === "summary") {
                // 汇总场景下只有柱状图、饼图
                switch (chartType) {
                    case "Bar": {
                        const { option, hasData } = chartSummaryData.getBarOption(indexes, dimensions);
                        this.chartOption = option;
                        this.isEmptyChart = !hasData;
                        break;
                    }
                    case "Pie": {
                        const { optionList, hasData } = chartSummaryData.getPieOption(indexes, dimensions);
                        this.pieChartOptions = optionList;
                        this.isEmptyChart = !hasData;
                        break;
                    }
                }
            }
        },
        onSearchTypeChange(val) {
            if (val === "detail") {
                this.chartType = "Line";
            } else {
                this.chartType = "Bar";
            }

            this.indexes = [];
            this.dimensions = [];

            this.search();
        },
        //筛选条件数据变更
        handleEventConditionChange(item, options, condition) {
            condition.attributeType = options.filter(e => e.value === item)[0]?.type;
        },
        formatChartDetailData(data) {
            chartDetailData.setChartOriginData(data);
            this.dimensions = chartDetailData.getDimensions();
            this.indexes = chartDetailData.getIndexes();

            // 总共展示的线的条数大概是10条左右
            const indexesLen = this.indexes.length;
            const checkedDimensionLen = Math.ceil(10 / indexesLen);
            this.dimensions = this.dimensions.map((el, index) => {
                if (index < checkedDimensionLen) {
                    el.checked = true;
                }
                return el;
            });

            this.checkTop10 = checkedDimensionLen >= 10;
        },

        formatChartSummaryData(data) {
            chartSummaryData.setChartOriginData(data);
            this.dimensions = chartSummaryData.getDimensions();
            this.indexes = chartSummaryData.getIndexes();

            // 总共展示的线的条数大概是10条左右
            const indexesLen = this.indexes.length;
            const checkedDimensionLen = Math.ceil(10 / indexesLen);
            this.dimensions = this.dimensions.map((el, index) => {
                if (index < checkedDimensionLen) {
                    el.checked = true;
                }
                return el;
            });

            this.checkTop10 = checkedDimensionLen >= 10;
        },

        toggleTop10() {
            const isCheckTop10 = this.checkTop10;
            if (isCheckTop10) {
                // 取消前10项勾选
                this.dimensions = this.dimensions.map((el, index) => {
                    if (index < 10) {
                        return {
                            ...el,
                            checked: false,
                        };
                    }
                    return el;
                });
            } else {
                // 勾选前10项
                this.dimensions = this.dimensions.map((el, index) => {
                    if (index < 10) {
                        return {
                            ...el,
                            checked: true,
                        };
                    }
                    return el;
                });
            }
            this.checkTop10 = !isCheckTop10;
        },
        toggleIndexes(key) {
            this.indexes = this.indexes.map(each => {
                if (each.key === key) {
                    return {
                        ...each,
                        checked: !each.checked,
                    };
                }
                return each;
            });
        },
        toggleDimensions(key) {
            this.dimensions = this.dimensions.map(each => {
                if (each.key === key) {
                    return {
                        ...each,
                        checked: !each.checked,
                    };
                }
                return each;
            });
        },

        reloadPage(isInit) {
            if (isInit && this.$route.query.searchData) {
                const { eventId } = JSON.parse(decodeURIComponent(this.$route.query.searchData));
                this.searchData.eventId = eventId;
                this.metadata.eventAttributesOptions.options = null;
                if (this.searchData.eventId) {
                    this.handleDisplayFocus();
                    this.handleEventIdFocus();
                    this.handleGroupByFocus();
                    this.searchData = {
                        ...this.searchData,
                        displays: [this.metadata.displays.defaultOptions[0].value],
                        conditions: [],
                        groupFields: [this.metadata.groupFields.defaultOptions[0].value],
                    };
                }
            } else if (this.$route.query.id && this.$route.query.name) {
                const { id, name } = this.$route.query;
                this.panelId = +id;
                this.panelName = name;
                this.queryPanelSearchById();
            } else {
                ////从cookie中读取上次的选择条件
                const cookieStr = Cookies.get(storeCookiePreKey + this.productCodeAppKey.productCode);
                if (cookieStr && cookieStr.length > 0) {
                    this.searchData = JSON.parse(
                        Cookies.get(storeCookiePreKey + this.productCodeAppKey.productCode)
                    );
                    this.metadata.eventAttributesOptions.options = null;
                    if (this.searchData.eventId) {
                        this.handleDisplayFocus();
                        this.handleGroupByFocus();
                        this.handleEventIdFocus();
                        //构建聚合value和label的map，用于数据展示是value转label
                        [
                            ...this.metadata.aggregationType.options,
                            ...this.metadata.displays.defaultOptions,
                        ].forEach(item => {
                            this.aggregationValueLabelMap.set(item.value, item.label);
                        });
                    }

                    if (this.searchData.searchType === "detail") {
                        this.chartType = "Line";
                    } else {
                        this.chartType = "Bar";
                    }
                    this.$nextTick(() => {
                        this.search();
                    });
                } else {
                    this.searchData = this.getDefaultSearchData();
                }
            }

            this.initPage();
        },
        getDefaultSearchData() {
            return {
                appKey: [],
                eventId: "",
                displays: [],
                conditions: [],
                conditionRelationType: "AND",
                groupFields: [],
                time: [],
                interval: "DAY",
                // 图表类型
                searchType: "detail",
            };
        },
        initPage() {
            this.searchData = {
                ...this.searchData,
                productCode: this.productCodeAppKey.productCode,
                appKey: this.productCodeAppKey.appKey,
            };
            // 时间统一默认为前三天
            this.initTime();
            this.getPanelOptions();
            //table、chart数据清空
            this.metadata.chart.data.dimensions.data = []; //x轴设置
            this.metadata.chart.data.measures = [];
            this.metadata.table.columns = [];
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
                if (this.searchData.searchType === "summary") {
                    this.chartType = "Bar";
                }

                this.handleDisplayFocus();
                this.handleGroupByFocus();
                this.handleEventIdFocus();
                this.doSearch();
            });
        },
        getPanelOptions() {
            getPanelsByType("custom", this.searchData.productCode).then(list => {
                this.panelOptions = list.map(el => {
                    return {
                        id: el.id,
                        name: el.name,
                    };
                });
            });
        },

        //分页
        handleSizeChange(val) {
            this.pagesize = val;
        },
        //分页
        handleCurrentChange(val) {
            this.currentPage = val;
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
            // 请求接口2
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
        async handleEventChange(item) {
            this.metadata.eventAttributesOptions.options = null;
            let { appKey, productCode } = this.searchData;
            await this.handleEventAttributeFocus(appKey, productCode, item);
            await this.handleDisplayFocus();
            await this.handleGroupByFocus();
            this.searchData = {
                ...this.searchData,
                displays: [this.metadata.displays.defaultOptions[0].value],
                conditions: [],
                groupFields: [this.metadata.groupFields.defaultOptions[0].value],
            };
        },
        //获取Display的json
        async handleDisplayFocus() {
            let { productCode, appKey, eventId } = this.searchData;
            let eventAttributes = await this.handleEventAttributeFocus(appKey, productCode, eventId);
            let attributesFieldOptions = eventAttributes.map(item => {
                const { value, label, type } = item;
                return {
                    value,
                    label,
                    children:
                        type === "NUMBER"
                            ? this.metadata.aggregationType.options
                            : this.metadata.aggregationType.disabledOptions,
                };
            });
            attributesFieldOptions.unshift(...this.metadata.displays.defaultOptions);
            this.metadata = {
                ...this.metadata,
                displays: {
                    ...this.metadata.displays,
                    options: attributesFieldOptions,
                },
            };
        },
        // /获取eventId的所有属性
        async handleEventAttributeFocus(appKey, productCode, eventId) {
            let eventAttributesOptions = null;
            if (this.metadata.eventAttributesOptions.options) {
                return this.metadata.eventAttributesOptions.options;
            } else {
                eventAttributesOptions = await api.getEventAttributes({
                    appKey: appKey.join(","),
                    productCode,
                    eventId,
                });
                this.metadata = {
                    ...this.metadata,
                    eventAttributesOptions: {
                        ...this.metadata.eventAttributesOptions,
                        options: eventAttributesOptions,
                    },
                };
            }

            return eventAttributesOptions;
        },
        // condition value 搜索
        async handleConditionValueOptions(index, match) {
            this.metadata.conditions.valueOptions = [];
            this.metadata.conditions.loading = true;
            const attribute = this.searchData.conditions[index]?.attributeName || null;
            const { appKey, productCode, eventId } = this.searchData;
            let options = await api.getEventAttributeValues({
                appKey: appKey.join(","),
                productCode,
                eventId,
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
        async handleConditionValueFocus(index) {
            await this.handleConditionValueOptions(index, "");
        },
        handlerOperatorSelected(index) {
            if (
                "N_MTY" === this.searchData.conditions[index].filterType ||
                "MTY" === this.searchData.conditions[index].filterType
            ) {
                this.searchData.conditions[index].showConditionValueSelect = false;
            } else {
                this.searchData.conditions[index].showConditionValueSelect = true;
            }
        },
        addCondition() {
            this.searchData.conditions.push({
                filterType: "EQ",
                showConditionValueSelect: true,
            });
        },
        deleteCondition(index) {
            this.searchData.conditions.splice(index, 1);
        },
        async handleGroupByFocus() {
            let { productCode, appKey, eventId } = this.searchData;
            let eventAttributes = await this.handleEventAttributeFocus(appKey, productCode, eventId);
            eventAttributes = eventAttributes.map(item => {
                return { label: item.label, value: item.value };
            });
            eventAttributes.unshift(...this.metadata.groupFields.defaultOptions);
            this.metadata = {
                ...this.metadata,
                groupFields: {
                    ...this.metadata.groupFields,
                    options: eventAttributes,
                },
            };
        },
        onGroupFieldsChange(item) {
            let defaultValue = this.metadata.groupFields.defaultOptions[0].value;

            if (item.length > 1 && item[item.length - 1] === defaultValue) {
                //删除其他
                this.searchData.groupFields = [];
                this.searchData.groupFields.push(defaultValue);
            } else if (this.searchData.groupFields.length > 1) {
                //删除 总体
                if (this.searchData.groupFields.indexOf(defaultValue) > -1) {
                    this.searchData.groupFields.splice(this.searchData.groupFields.indexOf(defaultValue), 1);
                }
            } else if (this.searchData.groupFields.length === 0) {
                //添加 总体
                this.searchData.groupFields.push(defaultValue);
            }
        },

        // 查看图表跳转的初始化搜索不需要校验， 所以将搜索逻辑单独提出来
        download() {
            this.$refs["form"].validate(isValid => {
                if (isValid) {
                    this.downloadLoading = true;
                    this.$track("event_analysis_download");
                    api.download(this.getQueryParam())
                        .then(() => {
                            this.chartLoading = false;
                        })
                        .catch(err => console.error(err))
                        .finally(() => {
                            this.downloadLoading = false;
                        });
                }
            });
        },
        search() {
            this.$refs["form"].validate(isValid => {
                if (isValid) {
                    this.$track("event_analysis_search");
                    this.doSearch();
                }
            });
        },
        doSearch() {
            this.chartLoading = true;
            api.query(this.getQueryParam())
                .then(data => {
                    // this.configs.isLoading = false;
                    //table、chart数据清空
                    this.metadata.chart.data.dimensions.data = data.timeList; //x轴设置
                    this.metadata.chart.data.measures = [];
                    this.metadata.table.columns = [];
                    this.metadata.table.data = [];

                    //table列设置
                    this.metadata.table.columns.push({
                        prop: "time",
                        label: "时间",
                    });
                    if (data.groupFields[0] !== "*") {
                        this.metadata.table.columns.push({
                            prop: "groupValueString",
                            label: data.groupFields.join(", "),
                        });
                    }

                    for (let [i, item] of data.displays.entries()) {
                        let allCount = this.metadata.displays.defaultOptions[0];
                        let avg = this.metadata.displays.defaultOptions[1];

                        let isDefaultField;
                        let aggName;
                        let prop = item.attributeName;
                        if (item.aggregationType === allCount.value) {
                            aggName = allCount.label;
                            isDefaultField = true;
                        } else if (
                            item.attributeName === "userId" &&
                            item.aggregationType === "DISTINCT_COUNT"
                        ) {
                            aggName = avg.label;
                            isDefaultField = true;
                        } else if (
                            item.attributeName === "userId" &&
                            item.aggregationType === "PERSON_AVG_COUNT"
                        ) {
                            aggName = this.metadata.displays.defaultOptions[2].label;
                            isDefaultField = true;
                        } else {
                            aggName = this.aggregationValueLabelMap.get(item.aggregationType)
                                ? this.aggregationValueLabelMap.get(item.aggregationType)
                                : item.aggregationType;
                            isDefaultField = false;
                        }

                        this.metadata.table.columns.push({
                            prop: i.toString(),
                            label: isDefaultField
                                ? data.eventId + "的" + aggName
                                : data.eventId + "的" + prop + "的" + aggName,
                        });
                    }
                    ``;
                    for (let item of data.rows) {
                        let time = "";
                        if (this.searchData.searchType === "detail") {
                            time = item.t;
                        } else {
                            // 在汇总条件下，后端没有返回time串，前端填充时间段
                            const [begin, end] = this.searchData.time;
                            time = `${dayjs(begin).format("YYYY-MM-DD")} - ${dayjs(end).format(
                                "YYYY-MM-DD"
                            )}`;
                        }
                        let tableRow = {
                            time: time,
                            groupValueString: item.g.toString(),
                        };
                        for (let [i, r] of item.v.entries()) {
                            tableRow[i] = r;
                        }
                        this.metadata.table.data.push(tableRow);
                    }
                    this.total = this.metadata.table.data.length;
                    if (this.searchData.searchType === "summary") {
                        this.formatChartSummaryData(data);
                    } else if (this.searchData.searchType === "detail") {
                        this.formatChartDetailData(data);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => {
                    this.chartLoading = false;
                });
        },

        getQueryParam() {
            const params = Object.assign({}, this.searchData);
            params.appKey = this.productCodeAppKey.appKey;
            params.productCode = this.productCodeAppKey.productCode;
            // 处理时间头尾
            const [startTime, endTime] = this.getTime();
            params.startTime = startTime.split(" ")[0] + " 00:00:00";
            params.endTime = endTime.split(" ")[0] + " 23:59:59";
            // 删除多余字段
            Reflect.deleteProperty(params, "time");
            //displays构建
            params.displays = params.displays
                .filter(item => item)
                .map(item => {
                    if (typeof item === "string") {
                        item = [item];
                    }
                    if (item[0] === this.metadata.displays.defaultOptions[0].value) {
                        return { attributeName: "*", aggregationType: "COUNT" };
                    } else if (item[0] === this.metadata.displays.defaultOptions[1].value) {
                        return { attributeName: "userId", aggregationType: "DISTINCT_COUNT" };
                    } else if (item[0] === this.metadata.displays.defaultOptions[2].value) {
                        return { attributeName: "userId", aggregationType: "PERSON_AVG_COUNT" };
                    } else {
                        return { attributeName: item[0], aggregationType: item[1] };
                    }
                });
            //condition过滤
            params.conditions = params.conditions
                .filter(item => item && item.attributeName && item.filterType && item.valueSet)
                .map(item => {
                    if (item && item.valueSet && item.attributeName && item.filterType) {
                        return item;
                    }
                });

            return params;
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
    },
};
</script>
<style lang="scss">
.live-view {
    // chart相关
    .chart-wrapper {
        .no-data {
            height: 400px;
            line-height: 400px;
            text-align: center;
        }

        .chart {
            height: 400px;
            margin-bottom: 20px;
        }

        .chart-pie {
            .pie {
                height: 300px;
                margin-top: 20px;

                &:first-child {
                    margin-top: 0;
                }
            }
        }
    }

    &-filter {
        display: flex;

        .el-form-item__content {
            margin-left: 9px;
        }
    }

    &-search {
        //&-productcode {
        //    .el-form-item__content {
        //        margin-left: 27px;
        //    }
        //}
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

    .condition {
        display: flex;
        align-items: center;

        .chart {
            display: inline-flex;
            margin-left: auto;
            margin-right: 0;
            column-gap: 10px;
        }
    }
}
</style>
