<template>
    <div class="config">
        <el-popover trigger="click" :disabled="disabled" placement="bottom-end">
            <el-button slot="reference" :disabled="disabled">
                <span class="text"> 显示设置 </span>
                <i class="el-icon-arrow-down"></i>
            </el-button>
            <div class="body">
                <div class="tabs">
                    <div
                        class="tab"
                        @click="activeTab = 'index'"
                        :class="{
                            active: activeTab === 'index'
                        }"
                    >
                        显示指标
                    </div>
                    <div
                        class="tab"
                        :class="{
                            active: activeTab === 'dimension'
                        }"
                        @click="activeTab = 'dimension'"
                    >
                        显示维度
                    </div>
                </div>
                <div class="index">
                    <div v-show="activeTab === 'index'" class="index-list">
                        <div class="item" v-for="item in indexes" :key="item.key">
                            <input
                                class="checkbox"
                                type="checkbox"
                                :id="'__index_' + item.key"
                                :name="'__index_' + item.key"
                                :checked="item.checked"
                                @change="onIndexesChange(item.key)"
                            />
                            <label class="checkbox-label" :for="'__index_' + item.key"> {{ item.label }}</label>
                        </div>
                    </div>
                    <div v-show="activeTab === 'dimension'" class="dimension">
                        <el-input :value="search" @input="onSearchChange" class="search">
                            <el-button slot="append" icon="el-icon-search"></el-button>
                        </el-input>
                        <div class="dimension-list">
                            <div class="item" v-for="item in displayDimensions" :key="item.key">
                                <input
                                    class="checkbox"
                                    type="checkbox"
                                    :id="'__dimension_' + item.key"
                                    :name="'__dimension_' + item.key"
                                    :checked="item.checked"
                                    @change="onDimensionChange(item.key)"
                                />
                                <label class="checkbox-label" :for="'__dimension_' + item.key"> {{ item.label }}</label>
                            </div>
                        </div>
                        <div class="op">
                            <input
                                type="checkbox"
                                class="checkbox"
                                id="__dimension_top10"
                                name="__dimension_top10"
                                :checked="checkTop10"
                                @change="onTop10Change"
                            />
                            <label for="__dimension_top10" class="checkbox-label">选中前10项</label>
                        </div>
                    </div>
                </div>
            </div>
        </el-popover>
    </div>
</template>

<script>
import _ from 'lodash';

export default {
    name: "chartConfig",
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        dimensions: {
            type: Array,
            default: () => []
        },
        indexes: {
            type: Array,
            default: () => []
        },
        checkTop10: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            search: "",
            shadowSearch: "",
            activeTab: "dimension"
        };
    },
    computed: {
        displayDimensions() {
            const dimensions = this.dimensions;
            const search = this.shadowSearch;

            if (search === "") {
                return dimensions;
            }
            return dimensions.filter((el) => {
                const { label } = el;
                return label.includes(search);
            });
        }
    },
    methods: {
        onIndexesChange(key) {
            this.$emit("toggle-indexes", key);
        },
        onDimensionChange(key) {
            this.$emit("toggle-dimensions", key);
        },
        onTop10Change() {
            this.$emit("toggle-top10");
        },
        onSearchChange(val) {
            this.search = val;
            this.setShadowSearch(val);
        },
        setShadowSearch: _.debounce(function(val) {
            this.shadowSearch = val;
        }, 200)
    }
};
</script>

<style lang="scss" scoped>
.body {
    .checkbox-label {
        margin: 0;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        display: block;
        font-weight: normal;
        font-size: 14px;
    }

    .checkbox {
        cursor: pointer;
        position: relative;
        width: 14px;
        height: 14px;
        margin: 0;
    }

    width: 300px;
    box-sizing: border-box;

    .tabs {
        display: flex;
        align-items: center;
        justify-content: center;
        column-gap: 30px;
        margin-bottom: 15px;

        .tab {
            height: 40px;
            line-height: 40px;
            white-space: nowrap;
            box-sizing: border-box;
            cursor: pointer;
        }

        .active {
            color: #409eff;
            border-bottom: 2px solid;
        }
    }

    .index-list,
    .dimension-list {
        max-height: 240px;
        overflow: auto;
        content-visibility: auto;

        .item {
            padding: 5px 0;
            display: flex;
            align-items: center;
            column-gap: 10px;
        }
    }

    .dimension {
        .search {
            margin-bottom: 15px;
        }

        .op {
            margin-top: 15px;
            display: flex;
            column-gap: 10px;
            align-items: center;
        }
    }
}
</style>
