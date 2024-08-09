<template>
    <div class="event-filter">
        <div class="event" v-for="event in list" :key="event.id">
            <div class="name">
                <el-select
                    :value="event.name"
                    @change="name => onEventChange(event.id, name)"
                    @focus="() => fetchEventOption('')"
                    filterable
                    remote
                    :remote-method="fetchEventOption"
                    :size="size"
                >
                    <el-option
                        v-for="option in eventOption"
                        :key="option.value"
                        :value="option.value"
                        :label="option.label"
                    ></el-option>
                </el-select>
                <div class="add" @click="() => addFilter(event.id)">
                    <i class="icon el-icon-plus"></i>
                    <span>触发限制条件</span>
                </div>
                <i class="delete el-icon-close" @click="() => removeEvent(event.id)"></i>
            </div>
            <div class="filters" v-if="event.filters.length > 0">
                <div class="filter-cond" v-if="event.filters.length > 1">
                    <div class="text">且</div>
                </div>
                <div class="filter">
                    <div class="each" v-for="filter in event.filters" :key="filter.id">
                        <el-select
                            filterable
                            :size="size"
                            :value="filter.name"
                            class="attr"
                            @change="
                                name =>
                                    updateFilter(event.id, filter.id, {
                                        name,
                                    })
                            "
                        >
                            <el-option
                                v-for="option in event.option"
                                :key="option.value"
                                :value="option.value"
                                :label="option.label"
                            ></el-option>
                        </el-select>

                        <el-select
                            filterable
                            class="cond"
                            :size="size"
                            :value="filter.cond"
                            @change="
                                cond => {
                                    updateFilter(event.id, filter.id, {
                                        cond,
                                    });
                                }
                            "
                        >
                            <el-option
                                v-for="option in filterCondOption"
                                :key="option.value"
                                :value="option.value"
                                :label="option.label"
                            ></el-option>
                        </el-select>

                        <el-select
                            filterable
                            :size="size"
                            :value="filter.value"
                            multiple
                            remote
                            reserve-keyword
                            default-first-option
                            allow-create
                            clearable
                            collapse-tags
                            class="value"
                            v-if="filter.cond !== 'N_MTY' && filter.cond !== 'MTY'"
                            @change="
                                value => {
                                    updateFilter(event.id, filter.id, {
                                        value,
                                    });
                                }
                            "
                            @focus="
                                fetchValueOption(event.id, filter.id, {
                                    eventId: event.name,
                                    attribute: filter.name,
                                    match: '',
                                })
                            "
                            :remote-method="
                                match => {
                                    fetchValueOption(event.id, filter.id, {
                                        eventId: event.name,
                                        attribute: filter.name,
                                        match,
                                    });
                                }
                            "
                        >
                            <el-option
                                v-for="option in filter.option"
                                :key="option.value"
                                :value="option.value"
                                :label="option.label"
                            ></el-option>
                        </el-select>

                        <i class="delete el-icon-close" @click="() => removeFilter(event.id, filter.id)"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="add w-28" @click="addEvent">
            <i class="icon el-icon-circle-plus"></i>
            <span>添加事件</span>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { productCode$ } from "@/serviceStore/global/index.js";
import { useUnsubscribe } from "@/utils/hooks/useUnsubscribe";
import { EventFilter } from "./eventCondition.js";
import { getCondOption } from "@/conf/common";
import optionApi from "@/api/options";
import liveViewApi from "@/api/live-view";
import { debounce, filter } from "lodash";

const props = defineProps({
    data: {
        type: Array,
        default: () => [],
    },
    size: {
        type: String,
        default: "small",
    },
    filterCondType: {
        type: String,
        default: "ALL",
    },
});
const emits = defineEmits(["update"]);

const productCode = ref("");
const addSubScription = useUnsubscribe();

const eventFilter = ref(null);
const list = ref([]);
const addEvent = () => {
    list.value = eventFilter.value.add();
};
const removeEvent = id => {
    list.value = eventFilter.value.remove(id);
};
const onEventChange = (id, name) => {
    list.value = eventFilter.value.update(id, {
        name,
        filters: [],
    });

    liveViewApi
        .getEventAttributes({
            productCode: productCode.value,
            eventId: name,
        })
        .then(option => {
            list.value = eventFilter.value.update(id, {
                option,
            });
        });
};

const addFilter = id => {
    list.value = eventFilter.value.addInnerItem(id);
};
const removeFilter = (id, itemId) => {
    list.value = eventFilter.value.removeInnerItem(id, itemId);
};
const updateFilter = (id, itemId, item) => {
    list.value = eventFilter.value.updateInnerItem(id, itemId, item);
};

watch(
    list,
    debounce(function (val) {
        emits("update", val);
    }, 500)
);

const initList = (data = []) => {
    if (eventFilter.value) {
        eventFilter.value.init(data);
        list.value = eventFilter.value.getData();
    }
};
defineExpose({
    initList,
});

const fetchValueOption = (id, itemId, query) => {
    if (query.eventId === "" || query.attribute === "") {
        return;
    }
    const params = {
        productCode: productCode.value,
        ...query,
    };
    liveViewApi.getEventAttributeValues(params).then(res => {
        list.value = eventFilter.value.updateInnerItem(id, itemId, {
            option: res,
        });
    });
};

const eventOption = ref([]);
const fetchEventOption = match => {
    const params = {
        productCode: productCode.value,
        eventType: 'biz,perf,unknown',
        match,
    };
    optionApi.getEventIdOptions(params).then(res => {
        // 接口特殊处理，虚拟事件不能给ox_any
        eventOption.value = filter(res || [], each => {
            return each.value !== "ox_any";
        });
    });
};

const filterCondOption = ref(getCondOption());

onMounted(() => {
    const productSub = productCode$.subscribe(code => {
        productCode.value = code;
    });
    addSubScription(productSub);

    // 获取eventOption
    fetchEventOption("");

    eventFilter.value = new EventFilter();
});
</script>

<style lang="scss" scoped>
.event-filter {
    .add {
        padding-left: 20px;
        margin: 12px 0;
        .icon {
            font-size: 14px;
            color: #00bf8a;
            margin-right: 5px;
        }
        user-select: none;
        cursor: pointer;
    }

    .event {
        padding: 12px 20px;
        &:hover {
            background-color: #fafafa;
        }

        .name {
            display: flex;
            align-items: center;

            .add {
                color: #2d94fb;
                .icon {
                    color: #2d94fb;
                }
            }

            .delete {
                margin-left: auto;
                margin-right: 0;
                cursor: pointer;
                color: #c0ccda;
                font-size: 20px;
                &:hover {
                    color: #ef4136;
                }
            }
        }

        .filters {
            display: flex;
            align-items: stretch;
            background: #edf4fb;

            .filter-cond {
                // position: relative;
                // margin-left: 10px;
                // flex: 0 0 20px;
                display: flex;
                align-items: center;
                background: #c0ccda;
                width: 2px;
                margin: 13px 9px 13px 19px;

                .text {
                    // display: flex;
                    // align-items: center;
                    background: #c0ccda;
                    border-radius: 2px;
                    flex: 0 0 18px;
                    height: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    left: -8px;
                    font-size: 12px;
                    color: #fff;
                    line-height: 18px;
                }
            }

            .filter {
                flex: auto;
                .each {
                    display: flex;
                    align-items: center;
                    padding-left: 12px;
                    column-gap: 10px;
                    margin-top: 12px;
                    &:last-child {
                        margin-bottom: 12px;
                    }

                    .cond {
                        width: 120px;
                    }

                    .delete {
                        font-size: 20px;
                        color: #c0ccda;
                        cursor: pointer;
                        &:hover {
                            color: #ef4136;
                        }
                    }
                }
            }
        }
    }
}
</style>
