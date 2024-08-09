<template>
    <el-cascader
        separator="的"
        clearable
        :size="size"
        :value="restriction"
        :props="cascaderProps"
        :options="option"
        @change="onChange"
    ></el-cascader>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { fetchAttrByQuery } from "@/api/common";
import { getRestrictChildOption, getRestrictOption } from "@/conf/common";
import _ from "lodash";

const props = defineProps({
    size: {
        type: String,
        default: "medium",
    },
    query: Object,
    request: Function,
    restriction: {
        type: Array,
        required: true,
    },
    multiple: {
        type: Boolean,
        default: true,
    },
    topOption: {
        type: Array,
        default: () => getRestrictOption(),
    },
    bottomOption: {
        type: Array,
        default: () => getRestrictChildOption(),
    },
});

const cascaderProps = computed(() => {
    return {
        multiple: props.multiple,
        expandTrigger: "hover",
    };
});

const emits = defineEmits(["change"]);

watch(
    () => props.query,
    q => {
        request(q).then(data => {
            option.value = _.chain(props.topOption)
                .slice()
                .concat(
                    _.map(data, el => {
                        const type = el.type;
                        const childrenOption = _.slice(props.bottomOption);
                        const children =
                            type === "NUMBER"
                                ? _.map(childrenOption, el => {
                                      return {
                                          ...el,
                                          disabled: false,
                                      };
                                  })
                                : _.filter(childrenOption, el => !el.disabled);

                        return {
                            label: el.attributeChineseName,
                            value: el.attributeName,
                            children,
                        };
                    })
                )
                .value();
        });
    }
);

const option = ref(props.topOption);
const request =
    props.request ??
    (q => {
        return fetchAttrByQuery(q);
    });

const onChange = val => {
    emits("change", val);
};
</script>

<style lang="scss" scoped></style>
