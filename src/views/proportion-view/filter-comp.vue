<template>
    <div class="filter-comp">
        <div v-for="item in list" :key="item.id" class="flex items-center gap-3 mt-3 first:mt-0">
            <FilterCond
                size="small"
                :attr="item.attr"
                :cond="item.cond"
                :value="item.value"
                :event-id="event"
                @attr-change="val => onAttrChange(item.id, val)"
                @cond-change="val => onCondChange(item.id, val)"
                @value-change="val => onValueChange(item.id, val)"
            >
            </FilterCond>
            <div @click="() => removeItem(item.id)">
                <SubIcon :styles="{ fontSize: '20px' }"></SubIcon>
            </div>
        </div>
    </div>
</template>

<script setup>
import FilterCond from "@/components/filter-cond.vue";
import { ref } from "vue";
import { useIncrementId } from "@/utils/hooks/useIncrementId";
import SubIcon from "@/components/subIcon/index.vue";
import _ from "lodash";

const { getId } = useIncrementId();
const emits = defineEmits(["change"]);
const props = defineProps(["event"]);
const list = ref([]);
const addItem = () => {
    const defaultItem = {
        attr: "",
        attrType: "",
        cond: "EQ",
        value: [],
        id: getId(),
    };
    list.value.push(defaultItem);

    emitsCurrentStatue();
};
const replaceState = val => {
    list.value = _.map(val, el => {
        return {
            ...el,
            id: getId(),
        };
    });
};
defineExpose({
    replaceState,
    addItem,
});

const emitsCurrentStatue = () => {
    emits("change", list.value);
};

const removeItem = id => {
    list.value = _.filter(list.value, el => el.id !== id);
    emitsCurrentStatue();
};
const onChangeState = (val, id, type) => {
    _.each(list.value, each => {
        if (each.id === id) {
            switch (type) {
                case "attr":
                    each.attr = val.attr;
                    each.attrType = val.attrType;
                    break;
                case "cond":
                    each.cond = val;
                    break;
                case "value":
                    each.value = val;
                    break;
                default:
                    throw new Error("unknown type!!");
            }
        }
    });
    emitsCurrentStatue();
};
const onAttrChange = (id, obj) => {
    onChangeState(obj, id, "attr");
};
const onCondChange = (id, val) => {
    onChangeState(val, id, "cond");
};
const onValueChange = (id, val) => {
    onChangeState(val, id, "value");
};
</script>

<style lang="scss" scoped></style>
