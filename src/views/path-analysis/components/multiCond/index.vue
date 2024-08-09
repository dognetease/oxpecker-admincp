<template>
    <div class="multi">
        <div class="each" v-for="(item, idx) in list || []" :key="item.key">
            <div class="header">
                <div class="tip flex items-center">
                    <div class="label">事件条件</div>
                    <el-tooltip v-if="idx === 0">
                        <div slot="content">
                            不选择事件条件的情况下使用全量数计算后续事件，选择事件条件后在符合事件条件的数据中计算后续事件。
                        </div>
                        <i class="icon el-icon-question"></i>
                    </el-tooltip>
                </div>
                <div class="content">
                    <el-select
                        filterable
                        remote
                        :remote-method="remoteMethod"
                        size="mini"
                        class="event"
                        :value="item.event"
                        clearable
                        @change="val => eventChange(item.id, val)"
                    >
                        <el-option
                            v-for="option in eventList"
                            :key="option.value"
                            :value="option.value"
                            :label="option.label"
                        ></el-option>
                    </el-select>
                    <el-button
                        :disabled="item.event === ''"
                        type="info"
                        size="mini"
                        style="margin: 0 8px"
                        @click="() => addInnerItem(item.id)"
                        >新增筛选条件</el-button
                    >
                    <SubIcon @click.native="() => subItem(item.id)"></SubIcon>
                </div>
            </div>

            <div class="filters">
                <div class="filter" v-for="each in item.conditions || []" :key="each.id">
                    <FilterComp
                        size="mini"
                        :eventId="item.event"
                        :attr="each.attr"
                        :value="each.value"
                        :cond="each.cond"
                        :attrOptions="item.attrOptions"
                        @attr-change="val => emitUpdate(val, 'attr', item.id, each.id)"
                        @cond-change="val => emitUpdate(val, 'cond', item.id, each.id)"
                        @value-change="val => emitUpdate(val, 'value', item.id, each.id)"
                    ></FilterComp>
                    <SubIcon @click.native="() => subInnerItem(item.id, each.id)"></SubIcon>
                </div>
                <div class="logic" v-if="item.conditions && item.conditions.length > 0">
                    <span class="label">条件关系</span>
                    <el-radio-group :value="item.logic" @input="val => updateLogic(item.id, val)" size="mini">
                        <el-radio-button label="AND"></el-radio-button>
                        <el-radio-button label="OR"></el-radio-button>
                    </el-radio-group>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import SubIcon from "@/components/subIcon/index.vue";
import FilterComp from "../condition/index.vue";
const props = defineProps(["list", "attrOptions", "eventList", "remoteMethod"]);
const emits = defineEmits([
    "add-item",
    "sub-item",
    "update-item",
    "add-inner-item",
    "sub-inner-item",
    "update-inner-item",
    "update-logic",
    "event-change",
]);

const emitUpdate = (val, type, id, subId) => {
    emits("update-inner-item", {
        changeType: type,
        value: val,
        id,
        subId,
    });
};

const addInnerItem = id => {
    emits("add-inner-item", id);
};

const subInnerItem = (id, subId) => {
    emits("sub-inner-item", id, subId, props.type);
};

const addItem = () => {
    emits("add-item", props.type);
};

const subItem = id => {
    emits("sub-item", id);
};

const updateLogic = (id, val) => {
    emits("update-logic", id, val);
};

const eventChange = (id, val) => {
    emits("event-change", id, val);
};
</script>

<style lang="scss" scoped>
.multi {
    .event {
        width: 180px;
    }

    .label {
        color: rgb(51, 51, 51);
        font-weight: normal;
        font-size: 14px;
        padding: 0;
        padding-right: 5px;
    }

    .each {
        margin-top: 30px;
        &:first-child {
            margin-top: 0;
        }
        .header {
            display: flex;
            align-items: center;
            .content {
                display: flex;
                align-items: center;
                column-gap: 15px;
            }

            .tip {
                width: 90px;
                .icon {
                    font-size: 14px;
                    &:hover {
                        cursor: pointer;
                    }
                }
            }
        }
        .filters {
            margin-left: 79px;
            .filter {
                display: flex;
                align-items: center;
                margin-top: 13px;
                column-gap: 15px;
            }

            .logic {
                margin-top: 13px;
            }
        }
        .user-filters {
            margin-left: 0;
        }
    }
}
</style>
