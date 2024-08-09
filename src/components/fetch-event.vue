<template>
    <div>
        <el-select
            :value="event"
            :size="size"
            :remote-method="searchOption"
            :placeholder="placeholder"
            clearable
            filterable
            remote
            @focus="() => searchOption('')"
            @change="val => $emit('change', val)"
        >
            <el-option v-for="item in option" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
        </el-select>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { fetchEventOptionByMatch } from "@/api/common.js";
import { productCodeAndAppKeys$ } from "@/serviceStore/global/index";
import { of, map, withLatestFrom, mergeMap, from } from "rxjs";
const props = defineProps({
    event: String,
    query: Object,
    request: Function,
    placeholder: {
        type: String,
        default: "输入关键词搜索...",
    },
    size: {
        type: String,
        default: "medium",
    },
});
let sub = null;

const emits = defineEmits(["change"]);

const option = ref([]);
const request =
    props.request ??
    (q => {
        return fetchEventOptionByMatch(q);
    });
const searchOption = (match = "") => {
    const query = {
        match,
        query: props.query,
    };
    if (sub) {
        sub.unsubscribe();
    }
    sub = of(query)
        .pipe(
            withLatestFrom(productCodeAndAppKeys$),
            map(param => {
                const [q, [productCode, appKeys]] = param;
                const extraQuery = q.query || {};
                return {
                    productCode,
                    appKey: appKeys.join(","),
                    match: q.match || "",
                    ...extraQuery,
                };
            }),
            mergeMap(param => {
                return from(request(param));
            })
        )
        .subscribe(data => {
            option.value = data;
        });
};

onMounted(() => {
    searchOption(props.event || "");
});

const initEvent = event => {
    searchOption(event);
};
defineExpose({
    initEvent,
});
</script>

<style lang="scss" scoped></style>
