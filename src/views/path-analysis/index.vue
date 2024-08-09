<template>
    <div class="path">
        <EventHeader
            :spread="isSpread"
            :search="panelId"
            :searchOption="panelOption"
            @search-change="onPanelChange"
            @btn-click="onPanelBtnClick"
        ></EventHeader>
        <el-form ref="formRef" :model="formData" :rules="formRules">
            <div class="row">
                <el-form-item class="form-item-required">
                    <div class="app-key">
                        <span>选择AppKey</span>
                        <el-form-item prop="appKey">
                            <el-select
                                class="inline-input w-48"
                                size="mini"
                                v-model="formData.appKey"
                                multiple
                                collapse-tags
                                placeholder="请选择appKey"
                                @change="changeGlobalAppKey"
                            >
                                <el-option
                                    v-for="item in appKeyOptions"
                                    :label="item.label"
                                    :value="item.value"
                                    :key="item.value"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                        <el-button class="reset-button" size="mini" @click="resetQuery" type="danger"
                            >重置</el-button
                        >
                    </div>
                </el-form-item>
            </div>
            <div class="row init-event">
                <el-form-item class="form-item-required">
                    <div class="event">
                        <span>选择</span>
                        <el-radio-group class="inline-input switch" size="mini" v-model="formData.eventType">
                            <el-radio-button label="起始事件"></el-radio-button>
                            <el-radio-button label="结束事件"></el-radio-button>
                        </el-radio-group>
                        <span>为</span>
                        <el-form-item prop="event">
                            <el-select
                                filterable
                                clearable
                                remote
                                class="inline-input"
                                size="mini"
                                v-model="formData.event"
                                :remote-method="getEventList"
                            >
                                <el-option
                                    v-for="item in eventList"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                        <span>的路径</span>
                        <el-button
                            :disabled="formData.event.length === 0"
                            type="info"
                            size="mini"
                            style="margin: 0 8px"
                            @click="addInitFilter"
                            >新增筛选条件</el-button
                        >
                    </div>
                </el-form-item>
                <div class="init-filter">
                    <div class="filter">
                        <div class="each" v-for="item in selfInitFilters" :key="item.id">
                            <SimpleCond
                                size="mini"
                                :attr="item.attr"
                                :value="item.value"
                                :cond="item.cond"
                                :attrOptions="selfInitFilterOption"
                                :eventId="formData.event"
                                @value-change="value => updateInitFilter(item.id, 'value', value)"
                                @cond-change="value => updateInitFilter(item.id, 'cond', value)"
                                @attr-change="value => updateInitFilter(item.id, 'attr', value)"
                            ></SimpleCond>
                            <SubIcon @click.native="() => subInitFilter(item.id)"></SubIcon>
                        </div>
                    </div>
                    <div class="logic" v-if="selfInitFilters.length > 0">
                        <span class="label">条件关系</span>
                        <el-radio-group v-model="selfInitLogic" size="mini">
                            <el-radio-button label="AND"></el-radio-button>
                            <el-radio-button label="OR"></el-radio-button>
                        </el-radio-group>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="event-cond">
                    <el-button size="mini" type="primary" style="margin: 0" @click="addEventItem"
                        >新增事件条件</el-button
                    >
                    <MultiCond
                        v-if="selfEventList.length > 0"
                        style="margin-top: 15px"
                        type="event"
                        :eventList="eventList"
                        :list="selfEventList"
                        :remoteMethod="getEventList"
                        @sub-item="subEventItem"
                        @add-inner-item="addEventInnerItem"
                        @sub-inner-item="subEventInnerItem"
                        @update-inner-item="updateEventInnerItem"
                        @update-logic="updateEventLogic"
                        @event-change="onSelfEventChange"
                    ></MultiCond>
                </div>
            </div>
            <div class="row">
                <div class="user-cond">
                    <div class="label">
                        <span>用户条件</span>
                        <el-button size="mini" type="info" style="margin: 0 8px" @click="addUserItem"
                            >新增用户筛选条件</el-button
                        >
                    </div>
                    <div class="filter">
                        <div class="each" v-for="item in selfUserList" :key="item.id">
                            <SimpleCond
                                size="mini"
                                :attr="item.attr"
                                :value="item.value"
                                :cond="item.cond"
                                eventId="pc_dailyActiveUser"
                                :attrOptions="selfUserListOptions"
                                @value-change="value => updateUserItem(item.id, 'value', value)"
                                @cond-change="value => updateUserItem(item.id, 'cond', value)"
                                @attr-change="value => updateUserItem(item.id, 'attr', value)"
                            ></SimpleCond>
                            <SubIcon @click.native="() => subUserItem(item.id)"></SubIcon>
                        </div>
                    </div>
                    <div class="logic" v-if="selfUserList.length > 0">
                        <span class="label">条件关系</span>
                        <el-radio-group v-model="selfUserListLogic" size="mini">
                            <el-radio-button label="AND"></el-radio-button>
                            <el-radio-button label="OR"></el-radio-button>
                        </el-radio-group>
                    </div>
                </div>
            </div>
            <div class="row">
                <el-form-item class="form-item-required">
                    <div class="session">
                        <span>设置Session时间间隔</span>
                        <el-form-item prop="sessionSpan">
                            <el-select size="mini" class="inline-input" v-model.number="formData.sessionSpan">
                                <el-option label="0.5小时" :value="1800"></el-option>
                                <el-option label="1小时" :value="3600"></el-option>
                                <el-option label="1天" :value="86400"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-button
                            :loading="searchLoading"
                            type="primary"
                            class="search-btn"
                            size="mini"
                            @click="searchData"
                            >查询</el-button
                        >
                    </div>
                </el-form-item>
            </div>
            <div class="chart">
                <div class="conf">
                    <div class="time-range">
                        <el-date-picker
                            size="mini"
                            v-model="formData.timeRange"
                            type="daterange"
                            align="right"
                            unlink-panels
                            range-separator=" - "
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            :picker-options="timeRangeOption"
                        >
                        </el-date-picker>
                    </div>
                    <div class="node">
                        <span>每层最多显示</span>
                        <el-input-number
                            size="mini"
                            class="inline-input count"
                            v-model="nodeCount"
                            :min="1"
                            :max="20"
                        ></el-input-number>
                        <span>个节点</span>
                    </div>
                </div>
                <div class="pic">
                    <G2Plot
                        v-loading="addLoading"
                        v-if="!isChartEmpty"
                        name="Sankey"
                        :option="chartConf"
                        :eventList="chartEvents"
                    ></G2Plot>
                    <div class="text" v-else>暂无数据</div>
                </div>
            </div>
        </el-form>
        <create-dashboard-modal
            type="sankey"
            v-if="dashboardVisible"
            :visible="dashboardVisible"
            :origin="originQuery"
            :computed="computedQuery"
            @close="() => (dashboardVisible = false)"
            @create-panel-done="queryPanelsSearch"
        ></create-dashboard-modal>
    </div>
</template>

<script setup>
import MultiCond from "./components/multiCond/index.vue";
import SimpleCond from "./components/condition/index.vue";
import G2Plot from "@/components/G2Plot/index.vue";
import SubIcon from "@/components/subIcon/index.vue";
import EventHeader from "@/components/eventHeader/index.vue";
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from "vue";
import { Message } from "element-ui";
import { useGlobalState, useStore, useRoute } from "@/utils/hooks/useVuePlugin";
import liveViewApi from "@/api/live-view";
import { getTimeRangeOption } from "@/utils/index";
import dayjs from "dayjs";
import { getSankeyData } from "@/api/pathAnalysis.js";
import SankeyData from "./dataOperate";
import optionsApi from "@/api/options";
import { Serialize } from "@/utils/serialize";
import { IncrementId } from "@/utils/incrementId";
import { getPanelQueryById, updatePanel, getPanelsByType } from "@/api/dashboard";
import CreateDashboardModal from "@/components/CreateDashboardModal";
import { appKeyOption$ } from "@/serviceStore/global/index";
import { useUnsubscribe } from "@/utils/hooks/useUnsubscribe";

const nodeCount = ref(10);

const timeRangeOption = getTimeRangeOption();

const globalState = useGlobalState();
const store = useStore();
const addSubscription = useUnsubscribe();
const searchLoading = ref(false);

const getDefaultFormData = () => {
    return {
        appKey: appKeys ?? [],
        eventType: "起始事件",
        event: "",
        sessionSpan: 1800,
        timeRange: [dayjs().subtract(1, "day").toDate(), dayjs().subtract(1, "day").toDate()],
    };
};
const formData = ref(getDefaultFormData());
const formRef = ref(null);
const resetForm = () => {
    formData.value = getDefaultFormData();
    formRef.value.resetFields();
};
const formRules = {
    event: [
        {
            required: true,
            message: "请选择起始事件或结束事件",
            trigger: "change",
        },
    ],
    sessionSpan: [
        {
            required: true,
            message: "请选择Session时间间隔",
            trigger: "change",
        },
    ],
    appKey: [
        {
            validator: (_, value, cb) => {
                if (value && value.length > 0) {
                    cb();
                    return;
                }
                cb(new Error("请选择appKey"));
            },
            trigger: "change",
        },
    ],
};

// 全局一些状态
const productCode = computed(() => {
    return globalState.productId || "";
});
const appKeyOptions = ref([]);
const sub = appKeyOption$.subscribe(option => {
    appKeyOptions.value = option;
});
addSubscription(sub);
const appKeys = computed(() => {
    return globalState.appKey || [];
});
const resetByAppKey = () => {
    formData.value.event = "";
    formRef.value.clearValidate();
    resetEventList();
    resetUserList();
    chartConf.value.data = [];
};
watch(
    () => formData.value.appKey,
    () => {
        resetByAppKey();
        getEventList("");
    }
);
watch(appKeys, val => {
    if (val && val.length) {
        formData.value.appKey = val;
    }
});
const changeGlobalAppKey = val => {
    store.commit("globalState/updateAppKey", {
        appKeys: val,
    });
};
const changeGlobalProductCode = val => {
    store.commit("globalState/updateProductId", {
        id: val,
    });
};
const eventList = ref([]);
const getEventList = match => {
    const pCode = productCode.value;
    const aKey = formData.value.appKey.join(",");
    if (pCode && pCode.length && aKey && aKey.length) {
        optionsApi
            .getEventIdOptions({
                productCode: pCode,
                appKey: aKey,
                match,
            })
            .then(data => {
                eventList.value = data;
            });
    }
};

const addItem = (data, item) => {
    data.push(item);
    return data;
};
const subItem = (data, id) => {
    return data.filter(each => each.id !== id);
};
const updateItem = (data, id, item = {}) => {
    data = data.map(each => {
        if (each.id === id) {
            return {
                ...each,
                ...item,
            };
        }
        return each;
    });
    return data;
};
const getCommonFilter = () => {
    return {
        attr: "",
        cond: "EQ",
        value: [],
    };
};

// 事件条件
const eventIncrementId = new IncrementId();
const selfEventList = ref([]);
const getDefaultEventItem = () => {
    return {
        idInstance: new IncrementId(),
        event: "",
        conditions: [],
        attrOptions: [],
        logic: "AND",
    };
};
const resetEventList = () => {
    eventIncrementId.reset();
    selfEventList.value = [];
};
const addEventItem = () => {
    const item = {
        ...getDefaultEventItem(),
        id: eventIncrementId.getId(),
    };
    selfEventList.value = addItem(selfEventList.value, item);
};
const subEventItem = id => {
    selfEventList.value = subItem(selfEventList.value, id);
};
const addEventInnerItem = id => {
    const found = selfEventList.value.find(each => each.id === id);
    if (found) {
        const innerId = found.idInstance.getId();
        found.conditions.push({
            id: innerId,
            ...getCommonFilter(),
        });
    }
};
const subEventInnerItem = (id, subId) => {
    const found = selfEventList.value.find(each => each.id === id);
    if (found) {
        found.conditions = subItem(found.conditions, subId);
    }
};
const updateEventInnerItem = ({ changeType, value, id, subId }) => {
    const found = selfEventList.value.find(each => each.id === id);
    if (found) {
        found.conditions = updateItem(found.conditions, subId, {
            [changeType]: value,
        });
    }
};
const updateEventLogic = (id, value) => {
    selfEventList.value = updateItem(selfEventList.value, id, {
        logic: value,
    });
};
const onSelfEventChange = (id, value) => {
    const found = selfEventList.value.find(each => each.id === id);
    found.event = value;
    if (!value) {
        found.event = "";
        found.conditions = [];
        found.attrOptions = [];
    } else {
        found.event = value;
        found.conditions = found.conditions.map(each => {
            each.attr = "";
            each.cond = "EQ";
            each.value = [];
            return each;
        });
        found.attrOptions = [];
        liveViewApi
            .getEventAttributes({
                productCode: productCode.value,
                appKey: formData.value.appKey.join(","),
                eventId: value,
            })
            .then(data => {
                found.attrOptions = data;
            });
    }
};

const selfUserList = ref([]);
const selfUserListLogic = ref("AND");
const userIncrementId = new IncrementId();
const resetUserList = () => {
    userIncrementId.reset();
    selfUserList.value = [];
};
const selfUserListOptions = ref([]);
const getUserListOptions = query => {
    liveViewApi.getEventAttributes(query).then(data => {
        selfUserListOptions.value = data;
    });
};
const updateUserItem = (id, changeType, value) => {
    selfUserList.value = updateItem(selfUserList.value, id, {
        [changeType]: value,
    });
};
const addUserItem = () => {
    const item = {
        ...getCommonFilter(),
        id: userIncrementId.getId(),
    };
    selfUserList.value = addItem(selfUserList.value, item);
};
const subUserItem = id => {
    selfUserList.value = subItem(selfUserList.value, id);
};
// 用户条件
watch(
    productCode,
    code => {
        if (code && code.length > 0) {
            getUserListOptions({
                productCode: code,
            });
        }
    },
    { immediate: true }
);

const formatEventList = (list = []) => {
    if (list.length !== 0) {
        list = list.map(each => {
            const { conditions = [] } = each;
            const idInstance = new IncrementId();
            for (const item of conditions) {
                item.id = idInstance.getId();
            }
            each.idInstance = idInstance;
            each.id = eventIncrementId.getId();
            return each;
        });
    }
    return list;
};
const formatSelfList = (list = [], idInstance) => {
    if (list.length !== 0) {
        list = list.map(each => {
            return {
                ...each,
                id: idInstance.getId(),
            };
        });
    }
    return list;
};

// 页面初始筛选条件
const selfInitFilters = ref([]);
const selfInitFilterOption = ref([]);
const initIncrementId = new IncrementId();
const selfInitLogic = ref("AND");
const addInitFilter = () => {
    const item = {
        ...getCommonFilter(),
        id: initIncrementId.getId(),
    };
    selfInitFilters.value = addItem(selfInitFilters.value, item);
};
watch(
    () => formData.value.event,
    id => {
        if (id) {
            selfInitFilterOption.value = [];
            liveViewApi
                .getEventAttributes({
                    productCode: productCode.value,
                    appKey: formData.value.appKey.join(","),
                    eventId: id,
                })
                .then(data => {
                    selfInitFilterOption.value = data;
                });
            selfInitFilters.value = selfInitFilters.value.map(each => {
                each.attr = "";
                each.value = [];
                each.cond = "EQ";
                return each;
            });
        } else {
            selfInitFilterOption.value = [];
            selfInitFilters.value = [];
        }
    }
);
const updateInitFilter = (id, changeType, value) => {
    selfInitFilters.value = updateItem(selfInitFilters.value, id, {
        [changeType]: value,
    });
};
const subInitFilter = id => {
    selfInitFilters.value = subItem(selfInitFilters.value, id);
};
const resetInitFilter = () => {
    initIncrementId.reset();
    selfInitFilters.value = [];
};

// 页面序列化和反序列化
const route = useRoute();
const serialize = new Serialize(route.name);
const initFormLocal = () => {
    const data = serialize.deserialize();
    let {
        productCode,
        appKeys,
        formData: localFormData,
        selfEventList: localSelfEventList,
        selfUserCond,
        nodeCount: localNodeCount,
        selfInitFilterCond,
    } = data;
    changeGlobalAppKey(appKeys);
    changeGlobalProductCode(productCode);

    nextTick(() => {
        // 防止看起来突变
        formData.value = localFormData;
        // appKey改成多选，兼容以前的代码
        if (typeof formData.value.appKey === "string") {
            const appKey = [formData.value.appKey];
            formData.value.appKey = appKey;
        }
        setTimeout(() => {
            selfEventList.value = formatEventList(localSelfEventList);
            let { list: localSelfUserList, logic } = selfUserCond;
            selfUserList.value = formatSelfList(localSelfUserList, userIncrementId);
            selfUserCond.value = logic;
            nodeCount.value = localNodeCount;
            const { list: localSelfInitFilter, logic: localInitLogic } = selfInitFilterCond;
            selfInitFilters.value = formatSelfList(localSelfInitFilter, initIncrementId);
            selfInitLogic.value = localInitLogic;
        }, 100);
    });
};
const shouldInitFromLocal = () => {
    return serialize.isCache();
    // if (!serialize.isCache()) {
    //     return false;
    // }
    // const data = serialize.deserialize();
    // const { productCode: pCode, appKeys: aKeys } = data;
    // if (pCode !== productCode.value) {
    //     return false;
    // }
    // const key = aKeys && aKeys[0];
    // if (!appKeys.value.includes(key)) {
    //     return false;
    // }
    // return true;
};
onBeforeUnmount(() => {
    serializePage();
    window.removeEventListener("pagehide", serializePage);
});
const getCacheData = () => {
    const data = {
        productCode: productCode.value,
        appKeys: appKeys.value,
        formData: formData.value,
        selfEventList: selfEventList.value
            .map(each => {
                const copy = Object.assign({}, each);
                Reflect.deleteProperty(copy, "idInstance");
                return copy;
            })
            .filter(each => each.event && each.event.length),
        selfUserCond: {
            logic: selfUserListLogic.value,
            list: selfUserList.value.filter(each => each.attr && each.attr.length),
        },
        selfInitFilterCond: {
            logic: selfInitLogic.value,
            list: selfInitFilters.value.filter(each => each.attr && each.attr.length),
        },
        nodeCount: nodeCount.value,
    };
    return data;
};
const serializePage = () => {
    // 三个关键性指标都是空的时候，不缓存
    if (
        formData.value.event.length === 0 &&
        selfUserList.value.length === 0 &&
        selfEventList.value.length === 0
    ) {
        return;
    }
    const data = getCacheData();
    serialize.serialize(data);
};

// 重置整个查询
const resetQuery = () => {
    resetForm();
    resetEventList();
    resetUserList();

    chartConf.value = {};
};

const getConditions = (list, option) => {
    const optionMap = new Map();
    for (const each of option) {
        optionMap.set(each.value, each);
    }
    return list
        .map(each => {
            return {
                attributeName: each.attr,
                filterType: each.cond,
                valueSet: each.value,
                attributeType: optionMap.get(each.attr)?.type ?? "",
            };
        })
        .filter(each => each.attributeName && each.attributeName.length > 0)
        .filter(each => each.valueSet && each.valueSet.length);
};
const getEventFilters = () => {
    const eventDataList = selfEventList.value;
    return eventDataList
        .filter(each => {
            return each.event && each.event.length;
        })
        .map(each => {
            return {
                eventId: each.event,
                conditionRelationType: each.logic,
                conditions: getConditions(each.conditions, each.attrOptions),
            };
        });
};
const getUserFilters = () => {
    return getConditions(selfUserList.value, selfUserListOptions.value);
};
const getInitFilters = () => {
    return getConditions(selfInitFilters.value, selfInitFilterOption.value);
};

const getQueryBody = eventIds => {
    const { eventType, sessionSpan, timeRange } = formData.value;
    let [startTime, endTime] = timeRange;
    const formatRule = "YYYY-MM-DD";
    startTime = dayjs(startTime).format(formatRule) + " 00:00:00";
    endTime = dayjs(endTime).format(formatRule) + " 23:59:59";
    return {
        appKey: formData.value.appKey,
        productCode: productCode.value,
        startTime,
        endTime,
        sessionInterval: sessionSpan,
        eventIds,
        searchDirection: eventType === "起始事件" ? "next" : "previous",
        eventCondition: getEventFilters(),
        conditions: getUserFilters(),
        conditionRelationType: selfUserListLogic.value,
        initialEventCondition: getInitFilters(),
        initialEvenConditionRelationType: selfInitLogic.value,
        nodeNumber: nodeCount.value ?? 20,
    };
};

const sankeyData = new SankeyData();
const chartConf = ref({});
const addLoading = ref(false);
const appendChartData = (eventIds, parentId) => {
    const body = getQueryBody(eventIds);
    addLoading.value = true;
    return getSankeyData(body)
        .then(data => {
            const { nodes = [] } = data;
            sankeyData.appendData(parentId, nodes);
            chartConf.value.data = sankeyData.getChartData();
            sankeyData.updateNode(parentId, {
                visited: true,
            });
        })
        .catch(err => console.error(err))
        .finally(() => (addLoading.value = false));
};
const chartEvents = ref([
    {
        name: "element:click",
        listener: node => {
            const data = node.data.data;
            if (!data.isNode) {
                return;
            }
            if (addLoading.value) {
                return;
            }

            const id = data.name;
            const item = sankeyData.getNode(id);
            if (item.parentId === null) {
                return;
            }

            if (item.visited) {
                // 二次点击，收起
                sankeyData.removeChildren(id);
                chartConf.value.data = sankeyData.getChartData();
                sankeyData.updateNode(id, {
                    visited: false,
                });
                return;
            }
            const idList = sankeyData.getEventList(id);
            appendChartData(idList, id);
        },
    },
]);
const isChartEmpty = computed(() => {
    const data = chartConf.value.data || [];
    return Object.keys(data).length === 0;
});
const searchData = () => {
    formRef.value
        .validate()
        .then(valid => {
            if (valid) {
                const body = getQueryBody([formData.value.event]);
                searchLoading.value = true;
                getSankeyData(body)
                    .then(data => {
                        const { total = 0, nodes = [] } = data;
                        sankeyData.setOrder(formData.value.eventType === "起始事件" ? "begin" : "end");
                        sankeyData.flushData(formData.value.event, total, nodes);
                        chartConf.value = sankeyData.getOption();
                    })
                    .catch(err => console.error(err))
                    .finally(() => {
                        searchLoading.value = false;
                    });
            }
        })
        .catch(err => console.error(err));
};

// 看板
const urlQuery = route.query || {};
const hasPanelId = urlQuery.id && String(urlQuery.id).length > 0;
const isSpread = ref(!!hasPanelId);
const panelOption = ref([]);
const panelId = ref(hasPanelId ? +urlQuery.id : "");
const initPageStateFromRemote = (data = {}) => {
    const { origin = {} } = data;
    //
    let {
        formData: remoteFormData,
        selfEventList: remoteSelfEventList,
        selfUserCond,
        nodeCount: remoteNodeCount,
        selfInitFilterCond,
    } = origin;
    const { event } = remoteFormData;
    formData.value = remoteFormData;
    // appKey改成多选，兼容以前的代码
    if (typeof formData.value.appKey === "string") {
        const appKey = [formData.value.appKey];
        formData.value.appKey = appKey;
    }
    selfEventList.value = formatEventList(remoteSelfEventList);
    let { list: remoteSelfUserList, logic } = selfUserCond;
    selfUserList.value = formatSelfList(remoteSelfUserList, userIncrementId);
    selfUserCond.value = logic;
    nodeCount.value = remoteNodeCount;

    nextTick(() => {
        formData.value.event = event;
        nextTick(() => {
            const { list: localSelfInitFilter, logic: localInitLogic } = selfInitFilterCond;
            selfInitFilters.value = formatSelfList(localSelfInitFilter, initIncrementId);
            selfInitLogic.value = localInitLogic;
        });
    });
};
const onPanelChange = value => {
    panelId.value = value;
    // todo 序列化整个查询
    getPanelQueryById(value).then(data => {
        const { content } = data;
        initPageStateFromRemote(JSON.parse(content));
    });
};
const onPanelBtnClick = () => {
    if (chartConf.value.data && chartConf.value.data.length) {
        const body = getQueryBody([formData.value.event]);
        const resultGraph = sankeyData.getDataList();
        body.resultGraph = resultGraph;
        computedQuery.value = body;
        const origin = getCacheData();
        originQuery.value = origin;
        if (panelId.value === "") {
            // 新建
            dashboardVisible.value = true;
        } else {
            // 更新
            updatePanel({
                id: panelId.value,
                content: JSON.stringify({
                    origin: originQuery.value,
                    computed: computedQuery.value,
                }),
            }).then(() => {
                Message({
                    type: "success",
                    message: "更新查询成功",
                });
            });
        }
    } else {
        Message({
            message: "请先执行有数据的查询",
            type: "error",
        });
    }
};
const shouldInitFromRemote = () => {
    return hasPanelId;
};
const getPanelOption = () => {
    getPanelsByType("sankey", productCode.value).then(data => {
        panelOption.value = data.map(each => {
            return {
                id: each.id,
                name: each.name,
            };
        });
    });
};
const initFromRemote = () => {
    const cb = () => {
        if (productCode.value) {
            getPanelOption();
            getPanelQueryById(panelId.value).then(data => {
                const { content } = data;
                initPageStateFromRemote(JSON.parse(content));
            });
            return;
        }
        setTimeout(cb, 100);
    };
    cb();
};
const dashboardVisible = ref(false);
const queryPanelsSearch = id => {
    panelId.value = id;
    getPanelOption();
};
const computedQuery = ref({});
const originQuery = ref({});

const initPageStatus = () => {
    resetForm();
    resetEventList();
    resetUserList();
    resetInitFilter();
};
onMounted(() => {
    // 从后端拉取
    if (shouldInitFromRemote()) {
        initFromRemote();
    } else if (shouldInitFromLocal()) {
        // 从本地local拉取
        initFormLocal();
    } else {
        // init本页面的初始状态
        initPageStatus();
    }
    // getUserListOptions();

    window.addEventListener("pagehide", serializePage);
});
</script>

<script>
export default {
    name: "PathAnalysis",
};
</script>
<style lang="scss" scoped>
.path {
    padding: 20px 20px 0 20px;
    .inline-input {
        margin: 0 5px;
    }

    .init-event {
        ::v-deep(.el-form-item) {
            margin-bottom: 0;
        }
    }
    .row {
        margin: 0;
        border-bottom: 1px solid #ddd;
        margin-top: 22px;
        &:first-child {
            margin-top: 0;
        }

        .init-filter,
        .event-cond,
        .user-cond {
            padding-bottom: 22px;
            padding-left: 13px;
            .label {
                color: rgb(51, 51, 51);
                font-weight: normal;
                font-size: 14px;
                padding: 0;
                padding-right: 5px;
            }
            .filter {
                .each {
                    margin-top: 13px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
            }

            .logic {
                margin-top: 13px;
            }
            // border-bottom: 1px solid #f5f5f5;
        }

        .form-item-required {
            width: 100%;
            display: flex;
            align-items: center;
            &::before {
                content: "*";
                color: #f56c6c;
                height: 12px;
                margin-right: 8px;
            }

            ::v-deep(.el-form-item__content) {
                flex: auto;
            }
        }

        .app-key {
            display: flex;
            align-items: center;
            // padding-bottom: 22px;
            .reset-button {
                margin: 0 0 0 auto;
            }
        }

        .event {
            display: flex;
            align-items: center;

            .switch {
                margin: 0 5px;
                label {
                    margin-bottom: 0;
                }
            }
        }

        .session {
            display: flex;
            align-items: center;
            .search-btn {
                margin: 0 0 0 auto;
            }

            .inline-input {
                width: 110px;
            }
        }
    }

    .chart {
        margin-top: 22px;
        .conf {
            padding-left: 13px;
            display: flex;
            align-items: center;

            .node {
                margin-left: auto;
                margin-right: 0;
                display: flex;
                align-items: center;
                white-space: nowrap;

                .count {
                    width: 110px;
                }
            }
        }

        .pic {
            height: 1000px;
            .text {
                padding-top: 180px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: rgb(51, 51, 51);
                font-weight: bold;
                font-size: 16px;
            }
        }
    }
}
</style>
