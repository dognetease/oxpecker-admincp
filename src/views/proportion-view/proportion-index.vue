<template>
    <div class="proportion pl-5 pr-5 pt-5">
        <EventHeader
            :search="panel"
            :search-option="panelOption"
            :spread="spread"
            @search-change="onPanelChange"
            @btn-click="onPanelClick"
        ></EventHeader>
        <el-form ref="formRef" inline label-width="80px" label-position="left" :model="formData">
            <div class="numerator">
                <div class="flex items-center mb-6">
                    <el-form-item prop="numeratorEvent" label="分子事件" required style="margin: 0">
                        <FetchEventSelect
                            ref="numeratorEventRef"
                            :size="size"
                            :event="numeratorEvent"
                            @change="onNumeratorChange"
                        ></FetchEventSelect>
                    </el-form-item>

                    <span class="ml-3 mr-3">的</span>
                    <EventRestriction
                        :multiple="false"
                        :size="size"
                        :query="numeratorRQuery"
                        :restriction="numeratorRestrictions"
                        @change="onNumeratorRChange"
                    ></EventRestriction>

                    <el-button
                        class="ml-3"
                        type="text"
                        icon="el-icon-plus"
                        :disabled="numeratorEvent.length === 0"
                        @click="addNumFilter"
                        >新增筛选条件</el-button
                    >
                </div>

                <div class="filter ml-20">
                    <div class="flex items-stretch">
                        <LogicRadio
                            v-if="numeratorFilters.length > 1"
                            class="mr-3"
                            :value="numeratorCond"
                            @change="val => (numeratorCond = val)"
                        ></LogicRadio>
                        <FilterComp
                            ref="numeratorFilterRef"
                            :event="numeratorEvent"
                            @change="val => (numeratorFilters = val)"
                        ></FilterComp>
                    </div>
                </div>
            </div>
            <el-divider></el-divider>
            <div class="denominator">
                <div class="flex items-center mb-6">
                    <el-form-item prop="denominatorEvent" label="分母事件" required style="margin: 0">
                        <FetchEventSelect
                            ref="denominatorEventRef"
                            :size="size"
                            :event="denominatorEvent"
                            @change="onDenominatorChange"
                        ></FetchEventSelect
                    ></el-form-item>

                    <span class="ml-3 mr-3">的</span>
                    <EventRestriction
                        :multiple="false"
                        :size="size"
                        :query="denominatorRQuery"
                        :restriction="denominatorRestrictions"
                        @change="onDenominatorRChange"
                    ></EventRestriction>
                    <el-button
                        class="ml-3"
                        type="text"
                        icon="el-icon-plus"
                        :disabled="denominatorEvent.length === 0"
                        @click="addDenominatorFilter"
                        >新增筛选条件</el-button
                    >
                </div>
                <div class="filter ml-20">
                    <div class="flex items-stretch">
                        <LogicRadio
                            v-if="denominatorFilters.length > 1"
                            class="mr-3"
                            :value="denominatorCond"
                            @change="val => (denominatorCond = val)"
                        ></LogicRadio>
                        <FilterComp
                            ref="denominatorFilterRef"
                            :event="denominatorEvent"
                            @change="val => (denominatorFilters = val)"
                        ></FilterComp>
                    </div>
                </div>
            </div>
        </el-form>
        <el-divider></el-divider>
        <div class="dimension text-sm text-gray-900 flex items-center">
            <span>选择维度</span>
            <span class="ml-3 mr-3">按</span>
            <el-select :value="dimensions" @change="onDimensionChange" multiple clearable>
                <el-option
                    v-for="item in dimensionOption"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></el-option>
            </el-select>
            <span class="ml-3">查看</span>
            <div class="ml-auto mr-0">
                <SearchButton :loading="loading" @click="search"></SearchButton>
            </div>
        </div>
        <el-divider></el-divider>
        <div class="chart">
            <div class="flex items-center gap-x-2">
                <div class="w-64">
                    <DateTimePicker :date-range="dateRange" @change="onDateChange"></DateTimePicker>
                </div>
                <div class="w-32">
                    <DimensionInterval
                        :value="dimensionType"
                        @change="val => (dimensionType = val)"
                    ></DimensionInterval>
                </div>
                <div class="ml-auto mr-0 flex items-center gap-x-2">
                    <el-select v-model="searchType" class="w-20" :disabled="loading">
                        <el-option label="明细" value="detail"></el-option>
                        <el-option label="汇总" value="summary"></el-option>
                    </el-select>
                    <el-radio-group v-model="activeChart">
                        <el-radio-button
                            v-for="item in chartTypeList"
                            :key="item"
                            :label="item"
                        ></el-radio-button>
                    </el-radio-group>
                    <ChartConfig
                        :disabled="restrictionsNames.length === 0 || groupFields.length === 0"
                        :indexes="restrictionsNames"
                        :checkTop10="checkTop10"
                        :dimensions="groupFields"
                        @toggle-dimensions="onGroupChange"
                        @toggle-top10="onToggleTop10"
                        @toggle-indexes="onToggleRestrictions"
                    ></ChartConfig>
                </div>
            </div>
            <div v-loading="loading">
                <h4>chart数据</h4>
                <div v-if="chartData.length === 0" class="no-data">暂无数据</div>
                <div v-else>
                    <DetailChartComp
                        v-if="searchType === 'detail'"
                        :chart-type="activeChart"
                        :data="chartData"
                    ></DetailChartComp>
                    <SummaryChartComp v-else :chart-type="activeChart" :data="chartData"></SummaryChartComp>
                </div>
            </div>
        </div>
        <el-divider></el-divider>
        <div class="table w-full" v-loading="loading">
            <h4>table数据</h4>
            <ProportionTable :data="tableData" :column="tableColumn"></ProportionTable>
        </div>
        <CreateDashboardModal
            type="proportion"
            v-if="dashboardOpen"
            :visible="dashboardOpen"
            :origin="pageState"
            :computed="pageQuery"
            @close="() => (dashboardOpen = false)"
            @create-panel-done="reGetPanel"
        ></CreateDashboardModal>
    </div>
</template>

<script setup>
import SearchButton from "@/components/search-button.vue";
import DateTimePicker from "@/components/datetime-picker.vue";
import FetchEventSelect from "@/components/fetch-event.vue";
import EventRestriction from "@/components/event-restriction.vue";
import FilterComp from "./filter-comp.vue";
import DimensionInterval from "@/components/dimension-interval.vue";
import LogicRadio from "@/components/logic-radio.vue";
import DetailChartComp from "./detail-comp.vue";
import SummaryChartComp from "./summary-comp.vue";
import ChartConfig from "@/components/chart-config.vue";
import EventHeader from "@/components/eventHeader/index.vue";
import CreateDashboardModal from "@/components/CreateDashboardModal";
import ProportionTable from "./proportion-table.vue";
import useLogic from "./useLogic";
import { useAutoUnSub } from "@/utils/hooks/useUnsubscribe";
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { fetchAttrByQuery, fetchPanelOption, fetchStateByPanel } from "@/api/common";
import { updatePanel } from "@/api/dashboard";
import { useRoute } from "@/utils/hooks/useVuePlugin";
import { showMessage } from "@/utils/index.js";

const size = "small";
const { autoUnSubscribe } = useAutoUnSub();
const {
    numeratorEvent,
    denominatorEvent,
    numeratorRestrictions,
    denominatorRestrictions,
    dimensions,
    dimensionOption,
    dimensionType,
    numeratorFilters,
    denominatorFilters,
    numeratorCond,
    denominatorCond,

    resetNumeratorRestriction,
    resetDenominatorRestriction,
    resetDimensions,

    dateRange,

    productCode,
    appKeys,

    searchType,

    tableColumn,
    tableData,
    chartData,

    getProportionData,
    getPageQuery,
    getPageState,
    replaceCurrentState,

    restrictions,
    checkTop10,
    groupFields,
} = useLogic(autoUnSubscribe);

const chartTypeList = ref(["Line", "Bar"]);
const activeChart = ref("Line");
watch(searchType, type => {
    if (type === "detail") {
        chartTypeList.value = ["Line", "Bar"];
        activeChart.value = "Line";
        search();
    } else if (type === "summary") {
        chartTypeList.value = ["Bar", "Pie"];
        activeChart.value = "Bar";
        search();
    }
});

const globalParam = computed(() => {
    return {
        productCode: productCode.value,
        appKey: appKeys.value.join(","),
    };
});

const numeratorRQuery = computed(() => {
    return {
        ...globalParam.value,
        eventId: numeratorEvent.value,
    };
});
const denominatorRQuery = computed(() => {
    return {
        ...globalParam.value,
        eventId: denominatorEvent.value,
    };
});
const dimensionRQuery = computed(() => {
    if (numeratorEvent.value.length && denominatorEvent.value.length) {
        return {
            ...globalParam.value,
            eventId: `${numeratorEvent.value},${denominatorEvent.value}`,
            intersection: true,
        };
    }
});

watch(dimensionRQuery, query => {
    if (!query) {
        return;
    }
    fetchAttrByQuery(query).then(data => {
        let list = _.map(data, each => {
            return {
                label: each.attributeChineseName,
                value: each.attributeName,
            };
        });
        list = _.concat(
            [
                {
                    label: "总体",
                    value: "*",
                },
            ],
            list
        );
        dimensionOption.value = list;
    });
});

const formData = computed(() => {
    return {
        numeratorEvent: numeratorEvent.value,
        denominatorEvent: denominatorEvent.value,
    };
});

const onNumeratorRChange = val => {
    numeratorRestrictions.value = val;
};

const onDenominatorRChange = val => {
    denominatorRestrictions.value = val;
};

// 分子事件的ref
const numeratorFilterRef = ref(null);
const addNumFilter = () => {
    numeratorFilterRef.value.addItem();
};
// 分母事件的ref
const denominatorFilterRef = ref(null);
const addDenominatorFilter = () => {
    denominatorFilterRef.value.addItem();
};

// 分子事件change
const onNumeratorChange = val => {
    numeratorEvent.value = val;
};
watch(numeratorEvent, () => {
    // 条件清空
    numeratorFilters.value = [];
    numeratorFilterRef.value.replaceState([]);

    // 重置restriction
    resetNumeratorRestriction();
    resetDimensions();
});

// 分母事件change
const onDenominatorChange = val => {
    denominatorEvent.value = val;
};
watch(denominatorEvent, () => {
    // 条件清空
    denominatorFilters.value = [];
    denominatorFilterRef.value.replaceState([]);

    // 重置restriction
    resetDenominatorRestriction();
    resetDimensions();
});
const onDimensionChange = values => {
    const defaultValue = "*";
    if (values.length === 0) {
        values = ["*"];
    } else if (values.at(-1) === defaultValue) {
        values = ["*"];
    } else {
        values = _.filter(values, each => each !== defaultValue);
    }
    dimensions.value = values;
};

const formRef = ref(null);

const loading = ref(false);
const search = () => {
    if (loading.value) {
        return;
    }
    formRef.value.validate(valid => {
        if (valid) {
            loading.value = true;
            getProportionData().finally(() => (loading.value = false));
        }
    });
};
const onDateChange = range => {
    dateRange.value = range;
};

// 显示设置
const restrictionsNames = computed(() => {
    return _.map(restrictions.value, el => ({
        key: el.key,
        label: el.nameString,
        checked: el.checked,
    }));
});
const onToggleRestrictions = key => {
    _.each(restrictions.value, el => {
        if (el.key === key) {
            el.checked = !el.checked;
        }
    });
};

const onToggleTop10 = () => {
    checkTop10.value = !checkTop10.value;
    const curCheckState = checkTop10.value;
    _.each(groupFields.value, (el, i) => {
        if (i < 10) {
            el.checked = curCheckState;
        }
    });
};

const onGroupChange = key => {
    _.each(groupFields.value, el => {
        if (el.key === key) {
            el.checked = !el.checked;
        }
    });
};

// 看板跳转视图
const route = useRoute();
const query = route.query;
const spread = ref(!!query.id);
const panel = ref(query.id ? +query.id : "");
const panelOption = ref([]);
const pageState = ref({});
const pageQuery = ref({});
const dashboardOpen = ref(false);
const numeratorEventRef = ref(null);
const denominatorEventRef = ref(null);
const getPanelOption = code => {
    fetchPanelOption(code, "proportion").then(data => {
        panelOption.value = data;
    });
};
const getStateByPanel = () => {
    fetchStateByPanel(panel.value).then(data => {
        const { content } = data;
        const { origin } = JSON.parse(content);
        replaceCurrentState(origin);
        // numeratorEventRef.value.initEvent(numeratorEvent.value);
        // denominatorEventRef.value.initEvent(denominatorEvent.value);

        const { numeratorFilters: nFilters, denominatorFilters: dFilters } = origin;
        setTimeout(() => {
            numeratorEventRef.value.initEvent(numeratorEvent.value);
            denominatorEventRef.value.initEvent(denominatorEvent.value);
            numeratorFilters.value = nFilters;
            denominatorFilters.value = dFilters;
            numeratorFilterRef.value.replaceState(nFilters);
            denominatorFilterRef.value.replaceState(dFilters);

            search();
        }, 200);
    });
};
const onPanelChange = p => {
    panel.value = p;
    if (p && p.length > 0) {
        getStateByPanel();
    }
};
const onPanelClick = () => {
    if (!panel.value) {
        if (chartData.value.length === 0) {
            showMessage("请先执行有数据的查询", "error");
            return;
        }
        dashboardOpen.value = true;
        pageState.value = getPageState();
        pageQuery.value = getPageQuery();
        return;
    } else {
        if (chartData.value.length === 0) {
            showMessage("请先执行有数据的查询", "error");
            return;
        }
        const state = getPageState();
        const query = getPageQuery();
        updatePanel({
            id: panel.value,
            content: JSON.stringify({
                origin: state,
                computed: query,
            }),
        }).then(() => {
            showMessage("更新查询成功", "success");
        });
    }
};
const reGetPanel = id => {
    panel.value = id;
    getPanelOption(productCode.value);
};

watch(productCode, code => {
    getPanelOption(code);
});
onMounted(() => {
    const getPanels = () => {
        if (productCode.value && productCode.value.length > 0) {
            getStateByPanel();
            return;
        }
        setTimeout(getPanels, 200);
    };
    if (route.query.id) {
        getPanels();
    }
});
</script>

<style lang="scss" scoped>
.chart {
    ::v-deep .el-radio-button__inner {
        width: 64px;
    }
    .no-data {
        height: 60px;
        color: #909399;
        border: 1px solid #ebeef5;
        line-height: 60px;
        font-size: 14px;
        text-align: center;
    }
}
</style>
