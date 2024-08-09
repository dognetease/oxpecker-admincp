<template>
    <div class="view">
        <div class="bar">虚拟事件可以组合多个事件和筛选条件，以方便您灵活的使用各种分析模型</div>
        <div class="content">
            <div class="top">
                <div class="row">
                    <div class="name">虚拟事件显示名</div>
                    <div class="value">{{ data.displayName }}</div>
                </div>
                <div class="row">
                    <div class="name">虚拟事件名</div>
                    <div class="value">{{ data.name }}</div>
                </div>
                <div class="row">
                    <div class="name">创建人</div>
                    <div class="value">{{ data.operator }}</div>
                </div>
                <div class="row">
                    <div class="name">创建时间</div>
                    <div class="value">{{ createTime }}</div>
                </div>
                <div class="row">
                    <div class="name">更新时间</div>
                    <div class="value">{{ updateTime }}</div>
                </div>
                <div class="row">
                    <div class="name">标签</div>
                    <div class="value tags">
                        <el-tag size="small" type="info" v-for="(tag, idx) in data.tagList" :key="idx">{{
                            tag
                        }}</el-tag>
                    </div>
                </div>
                <div class="row">
                    <div class="name">事件截图</div>
                    <div class="value">
                        <el-image
                            class="ml-5 first:ml-0"
                            style="width: 80px; height: 80px"
                            v-for="(url, idx) in data.pictureList"
                            :preview-src-list="data.pictureList"
                            :key="idx"
                            :src="url"
                        ></el-image>
                    </div>
                </div>
                <div class="row">
                    <div class="name">备注</div>
                    <div class="value">{{ data.remark }}</div>
                </div>
            </div>
            <el-divider></el-divider>
            <div class="bottom">
                <div class="name">虚拟事件的组成</div>
                <div class="tip">当以下事件中任意一个被触发时，视作该虚拟事件被触发</div>
                <div class="mt-3" v-for="(event, idx) in data.conditions" :key="idx">
                    <div class="w-40 rounded-sm bg-slate-100 px-3 py-2 truncate">{{ event.cName }}</div>
                    <div class="flex items-stretch">
                        <div
                            class="ml-3 mr-4 mt-3 flex w-[2px] items-center justify-center bg-slate-100"
                            v-if="event.filters.length > 1"
                        >
                            <span class="rounded-sm bg-slate-100 px-1 text-sm">且</span>
                        </div>
                        <div>
                            <div
                                class="items-top mt-2 flex gap-x-3 only:ml-7"
                                v-for="(filter, index) in event.filters"
                                :key="index"
                            >
                                <div class="w-40 rounded-sm bg-slate-100 px-3 py-2 truncate">{{ filter.cName }}</div>
                                <div class="w-28 rounded-sm bg-slate-100 px-3 py-2">
                                    {{ filter.condCName }}
                                </div>
                                <div
                                    v-if="filter.hasValue"
                                    class="flex w-72 flex-wrap items-center gap-2 rounded-sm bg-slate-100 px-3"
                                >
                                    <el-tag
                                        size="small"
                                        type="info"
                                        v-for="(tag, idx) in filter.value"
                                        :key="idx"
                                        >{{ tag }}</el-tag
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer">
            <el-button @click="$emit('cancel')">关闭</el-button>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import dayjs from "dayjs";
const props = defineProps({
    data: {
        type: Object,
        default: () => ({}),
    },
    loading: {
        type: Boolean,
        default: false,
    },
});

const createTime = computed(() => {
    return dayjs(props.data.createTime).format("YYYY-MM-DD HH:mm:ss");
});
const updateTime = computed(() => {
    return dayjs(props.data.updateTime).format("YYYY-MM-DD HH:mm:ss");
});
</script>

<style lang="scss" scoped>
.view {
    font-size: 14px;
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: auto;
    color: #1f2d3d;
    .bar {
        background: #fff8ea;
        color: #475669;
        font-size: 12px;
        line-height: 1.5;
        font-weight: 400;
        position: sticky;
        padding: 8px 20px;
        top: 0;
        z-index: 1;
    }

    .content {
        padding: 24px 20px;
        flex: auto;

        .top {
            display: flex;
            flex-direction: column;
            row-gap: 20px;
            .row {
                margin: 0;
                display: flex;
                align-items: center;
                .name {
                    color: #1f2d3d;
                    font-size: 14px;
                    font-weight: 500;
                    flex: 0 0 120px;
                }

                .tags {
                    display: flex;
                    flex-wrap: wrap;
                    column-gap: 10px;
                }

                .value {
                    color: #475669;
                    font-size: 14px;
                }
            }
        }

        .bottom {
            color: #475669;
            .name {
                margin-bottom: 10px;
            }

            .tip {
                font-size: 12px;
                color: #8492a6;
            }
        }
    }

    .footer {
        position: sticky;
        bottom: 0;
        z-index: 1;
        background-color: #fff;

        padding: 10px 30px;
        display: flex;
        justify-content: flex-end;
        column-gap: 20px;

        box-shadow: 0 -2px 9px rgba(153, 169, 191, 0.17);
    }
}
</style>
