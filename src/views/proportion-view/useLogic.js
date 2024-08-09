import { getData } from "./api.js";
import { productCodeAndAppKeys$, productCode$ } from "@/serviceStore/global/index.js";
import { ref, onBeforeMount, watch, nextTick } from "vue";
import dayjs from "dayjs";
import { getRestrictOption } from "@/conf/common.js";
import _ from "lodash";
import { useDetailDataFormat } from "@/utils/hooks/useDetailDataFormat.js";
import { useSummaryDataFormat } from "@/utils/hooks/useSummaryDataFormat.js";
const topOption = getRestrictOption();

const detailFormat = useDetailDataFormat();
const summaryFormat = useSummaryDataFormat();

const getFirstItem = list => {
    if (list.length) {
        return [list[0]].map(el => {
            return el.value;
        });
    }
    return [];
};

const toPercentInTable = table => {
    return _.map(table, each => {
        _.forEach(each, (value, key) => {
            if (!Number.isNaN(+key)) {
                each[key] = (value * 100).toFixed(2) + " %";
            }
        });
        return each;
    });
};

export default function (autoUnSubscribe) {
    // 分子
    const numeratorEvent = ref("");
    const numeratorRestrictions = ref(getFirstItem(topOption));
    const resetNumeratorRestriction = () => {
        numeratorRestrictions.value = getFirstItem(topOption);
    };
    const numeratorFilters = ref([]);
    const numeratorCond = ref("AND");

    // 分母
    const denominatorEvent = ref("");
    const denominatorRestrictions = ref(getFirstItem(topOption));
    const resetDenominatorRestriction = () => {
        denominatorRestrictions.value = getFirstItem(topOption);
    };
    const denominatorFilters = ref([]);
    const denominatorCond = ref("AND");

    // 维度
    const dimensionOption = ref([{ label: "总体", value: "*" }]);
    const dimensions = ref(["*"]);
    const resetDimensions = () => {
        dimensions.value = ["*"];
    };
    const dimensionType = ref("DAY");

    // 时间
    const dateRange = ref([dayjs().subtract(3, "day").toDate(), dayjs().toDate()]);

    // 全局
    const productCode = ref("");
    const appKeys = ref([]);

    // 数据
    const chartData = ref([]);
    const tableData = ref([]);
    const tableColumn = ref([]);

    // 查询类型
    const searchType = ref("detail");

    // 显示设置的维度
    const restrictions = ref([]);
    const checkTop10 = ref(true);
    const groupFields = ref([]);

    const dataGroup = {
        numeratorEvent,
        numeratorRestrictions,
        numeratorFilters,
        numeratorCond,

        denominatorEvent,
        denominatorRestrictions,
        denominatorFilters,
        denominatorCond,

        dimensions,
        dimensionType,
        dateRange,
    };

    watch(
        () => {
            return {
                r: restrictions.value,
                g: groupFields.value,
            };
        },
        obj => {
            const { r, g } = obj;
            const gKeys = _.chain(g)
                .filter(el => el.checked)
                .map(el => el.key)
                .value();
            const rKeys = _.chain(r)
                .filter(el => el.checked)
                .value();
            if (searchType.value === "detail") {
                const data = detailFormat.getChartDataByCond(gKeys, rKeys);
                chartData.value = data;
            } else if (searchType.value === "summary") {
                chartData.value = summaryFormat.getChartDataByCond(gKeys, rKeys);
            }
        },
        { deep: true }
    );

    const clearState = () => {
        numeratorEvent.value = "";
        numeratorCond.value = "AND";
        numeratorFilters.value = [];

        denominatorEvent.value = "";
        denominatorCond.value = "AND";
        denominatorFilters.value = [];

        chartData.value = [];
        tableColumn.value = [];
        tableData.value = [];

        restrictions.value = [];
        checkTop10.value = true;
        groupFields.value = [];
    };
    const subscribeRxjs = () => {
        autoUnSubscribe(productCodeAndAppKeys$, ([p, a]) => {
            productCode.value = p;
            appKeys.value = a;
        });
        autoUnSubscribe(productCode$, () => {
            clearState();
        });
    };

    const getPageState = () => {
        const state = {
            productCode,
            appKeys,
            dateRange,
            searchType,

            // 分子事件
            numeratorEvent,
            numeratorRestrictions,
            numeratorFilters,
            numeratorCond,

            // 分母事件
            denominatorEvent,
            denominatorRestrictions,
            denominatorFilters,
            denominatorCond,

            // 维度
            dimensions,
            dimensionType,

            // 显示设置
            restrictions,
            checkTop10,
            groupFields,
        };
        return _.mapValues(state, val => {
            return val.value;
        });
    };

    const getDisplays = (list = []) => {
        if (list.length === 0) {
            return [];
        } else if (list.length === 1) {
            const type = list[0];
            const name = _.find(topOption, op => op.value === type).name;
            return [
                {
                    attributeName: name,
                    aggregationType: type,
                },
            ];
        } else {
            return [
                {
                    attributeName: list[0],
                    aggregationType: list[1],
                },
            ];
        }
    };

    const getConditions = (conditions = []) => {
        return _.map(conditions, ({ attr, attrType, cond, value }) => {
            return {
                attributeName: attr,
                attributeType: attrType,
                valueSet: value,
                filterType: cond,
            };
        });
    };

    const getQuery = () => {
        const state = getPageState();
        const { dateRange } = state;
        const startTime = dayjs(dateRange[0]).startOf("day").format("YYYY-MM-DD HH:mm:ss");
        const endTime = dayjs(dateRange[1]).endOf("day").format("YYYY-MM-DD HH:mm:ss");
        const body = {
            productCode: state.productCode,
            appKey: state.appKeys,
            startTime,
            endTime,
            searchType: state.searchType,

            // 分子
            numeratorEventId: state.numeratorEvent,
            numeratorDisplays: getDisplays(state.numeratorRestrictions),
            numeratorConditions: getConditions(state.numeratorFilters),
            numeratorConditionRelationType: state.numeratorCond,

            // 分母
            denominatorEventId: state.denominatorEvent,
            denominatorDisplays: getDisplays(state.denominatorRestrictions),
            denominatorConditions: getConditions(state.denominatorFilters),
            denominatorConditionRelationType: state.denominatorCond,

            // 维度
            groupFields: state.dimensions,
            interval: state.dimensionType,
        };
        return body;
    };

    const replaceState = state => {
        const mutableKeys = [
            "searchType",
            "numeratorEvent",
            "numeratorRestrictions",
            "numeratorFilters",
            "numeratorCond",
            "denominatorEvent",
            "denominatorRestrictions",
            "denominatorFilters",
            "denominatorCond",
            "dimensions",
            "dimensionType",
        ];
        state = _.pick(state, mutableKeys);
        state = _.pickBy(state, val => val !== undefined || val !== null);
        _.forEach(state, (value, key) => {
            if (_.isNil(value) || !_.has(dataGroup, key)) {
                return;
            }
            dataGroup[key].value = value;
        });

        nextTick(() => {
            dimensions.value = state.dimensions;
            numeratorRestrictions.value = state.numeratorRestrictions;
            denominatorRestrictions.value = state.denominatorRestrictions;
            searchType.value = state.searchType;
        });
    };

    const setDetailData = data => {
        detailFormat.setSourceData(data);

        const table = detailFormat.getTableData();
        tableData.value = toPercentInTable(table);
        tableColumn.value = detailFormat.getTableColumn();
        chartData.value = detailFormat.getChartDataByCond();

        restrictions.value = _.map(detailFormat.getRestrictions(), el => {
            return {
                ...el,
                checked: true,
            };
        });
        checkTop10.value = true;
        const groupValueList = detailFormat.getGroups();
        groupFields.value = _.map(groupValueList, (each, index) => {
            return {
                key: each,
                label: each,
                checked: index < 10 ? true : false,
            };
        });
    };
    const setSummaryData = data => {
        const timeStr =
            dayjs(dateRange.value[0]).format("YYYY-MM-DD") +
            " ~ " +
            dayjs(dateRange.value[1]).format("YYYY-MM-DD");
        summaryFormat.setSourceData(data, timeStr);

        const table = summaryFormat.getTableData();
        tableData.value = toPercentInTable(table);

        tableColumn.value = summaryFormat.getTableColumn();
        chartData.value = summaryFormat.getChartDataByCond();

        restrictions.value = _.map(summaryFormat.getRestrictions(), el => {
            return {
                ...el,
                checked: true,
            };
        });
        checkTop10.value = true;
        const groupValueList = summaryFormat.getGroups();
        groupFields.value = _.map(groupValueList, (each, index) => {
            return {
                key: each,
                label: each,
                checked: index < 10 ? true : false,
            };
        });
    };

    onBeforeMount(() => {
        subscribeRxjs();
    });

    return {
        numeratorEvent,
        denominatorEvent,
        numeratorRestrictions,
        denominatorRestrictions,
        numeratorFilters,
        denominatorFilters,
        numeratorCond,
        denominatorCond,

        dimensions,
        dimensionType,
        dimensionOption,
        resetDimensions,

        productCode,
        appKeys,

        searchType,

        tableColumn,
        tableData,
        chartData,

        restrictions,
        checkTop10,
        groupFields,

        resetNumeratorRestriction,
        resetDenominatorRestriction,

        dateRange,
        getProportionData() {
            const body = getQuery();
            return getData(body).then(data => {
                if (searchType.value === "detail") {
                    setDetailData(data);
                } else {
                    setSummaryData(data);
                }
            });
        },

        getPageState() {
            return _.omit(getPageState(), ["restrictions", "checkTop10", "groupFields"]);
        },
        getPageQuery() {
            return getQuery();
        },
        replaceCurrentState(state = {}) {
            replaceState(state);
        },
    };
}
