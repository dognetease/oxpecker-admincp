<template>
    <div class="cond">
        <el-select filterable clearable class="left" :value="attr" @change="handleAttrChange" :size="size">
            <el-option
                v-for="item in attrOptions"
                :key="item.value + '-' + item.label"
                :label="item.label"
                :value="item.value"
            ></el-option>
        </el-select>

        <el-select class="middle" :value="cond" @change="val => $emit('cond-change', val)" :size="size">
            <el-option
                v-for="item in condOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            ></el-option>
        </el-select>

        <el-select
            class="right"
            :size="size"
            multiple
            filterable
            remote
            reserve-keyword
            default-first-option
            allow-create
            clearable
            collapse-tags
            :remote-method="getOptionWrapper"
            v-if="cond !== 'N_MTY' && cond !== 'MTY'"
            :value="value"
            @change="val => $emit('value-change', val)"
        >
            <el-option
                v-for="item in options"
                :label="item.label"
                :key="item.value"
                :value="item.value"
            ></el-option>
        </el-select>
    </div>
</template>

<script setup>
import { condOptions } from "./config";
import { ref, computed, watch, onMounted } from "vue";
import { useGlobalState } from "@/utils/hooks/useVuePlugin";
import liveViewApi from "@/api/live-view";

const globalState = useGlobalState();
const props = defineProps(["attr", "cond", "value", "attrOptions", "size", "eventId"]);
const emits = defineEmits(["attr-change", "cond-change", "value-change"]);

const options = ref([]);
const appKeys = computed(() => {
    return globalState.appKey || [];
});
const productCode = computed(() => {
    return globalState.productId || "";
});
const getOptions = ({ product = "", appKeys = [], event = "", match = "", attribute = "" }) => {
    if (product.length && appKeys.length && attribute.length) {
        liveViewApi
            .getEventAttributeValues({
                appKey: appKeys.join(","),
                productCode: product,
                eventId: event,
                match,
                attribute,
            })
            .then(data => {
                options.value = data;
            });
    }
};
watch(
    () => props.attr,
    val => {
        getOptions({
            product: productCode.value,
            appKeys: appKeys.value,
            event: props.eventId,
            attribute: val,
        });
    }
);

const getOptionWrapper = match => {
    getOptions({
        product: productCode.value,
        appKeys: appKeys.value,
        event: props.eventId,
        attribute: props.attr,
        match,
    });
};

onMounted(() => {
    getOptions({
        product: productCode.value,
        appKeys: appKeys.value,
        event: props.eventId,
        attribute: props.attr,
    });
});

const handleAttrChange = val => {
    emits("attr-change", val);
    emits("value-change", []);
    options.value = [];
};
</script>

<style lang="scss" scoped>
.cond {
    display: flex;
    align-items: center;
    column-gap: 14px;
    width: 500px;
    .left {
        width: 140px;
    }
    .middle {
        width: 110px;
    }

    .right {
        width: 200px;
    }
}
</style>
