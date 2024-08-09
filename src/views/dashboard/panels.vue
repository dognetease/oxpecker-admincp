<template>
    <div class="panel" v-loading="loading">
        <div class="header">
            <span class="name">
                <el-input
                    ref="edit-input"
                    v-if="isEditing"
                    v-model="editName"
                    size="mini"
                    @blue="changeTitle"
                    @keyup.enter.native="changeTitle"
                ></el-input>
                <span v-else>{{ editName }}</span>
            </span>
            <span class="op">
                <img
                    v-if="!isAmplify"
                    src="./icons/amplify-icon.svg"
                    class="icon"
                    @click="$emit('amplify-panel', id)"
                />
                <img v-else src="./icons/shrink-icon.svg" class="icon" @click="$emit('shrink-panel', id)" />
                <i class="el-icon-edit icon" @click="gotoQueryPage"></i>
                <el-dropdown class="icon">
                    <i class="el-icon-more"></i>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item @click.native="setPanelName">重命名</el-dropdown-item>
                        <el-dropdown-item v-if="isPrivate" @click.native="$emit('share-panel', id, editName)"
                            >分享到</el-dropdown-item
                        >
                        <el-dropdown-item v-if="isPrivate" @click.native="$emit('move-panel', id, editName)"
                            >移动到</el-dropdown-item
                        >
                        <el-dropdown-item @click.native="$emit('delete-panel', id)">删除</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </span>
        </div>
        <div class="body" :class="{ amplified: isAmplify }">
            <div class="query-table" v-if="type === 'retention'">
                <el-table :data="tableData" style="width: 100%">
                    <el-table-column
                        v-for="item in tableColumn"
                        :key="item.value"
                        :prop="item.value"
                        :label="item.label"
                        align="center"
                    ></el-table-column>
                </el-table>
            </div>
            <funnel-chart v-else-if="type === 'funnel'" :dataList="chartData"></funnel-chart>
            <G2Plot v-else-if="type === 'sankey'" name="Sankey" :option="chartData"></G2Plot>
            <div v-else-if="type === 'proportion'" class="chart-box">
                <G2Plot
                    key="proportion-line"
                    name="Line"
                    v-if="chart.type === 'line'"
                    :option="chart.option"
                ></G2Plot>
                <G2Plot
                    key="proportion-bar"
                    name="Column"
                    v-else-if="chart.type === 'bar'"
                    :option="chart.option"
                ></G2Plot>
            </div>
            <div v-else class="chart-box">
                <line-chart v-if="chart.type === 'line'" :option="chart.option"></line-chart>
                <bar-chart v-else-if="chart.type === 'bar'" :option="chart.option"></bar-chart>
            </div>
        </div>
    </div>
</template>

<script>
import FunnelChart from "../../components/G2Plot/FunnelChart/index.vue";
import BarChart from "@/components/G2Plot/BarChart/index.vue";
import LineChart from "@/components/G2Plot/LineChart/index.vue";
import G2Plot from "@/components/G2Plot/index.vue";

export default {
    name: "Panel",
    components: { FunnelChart, BarChart, LineChart, G2Plot },
    props: {
        id: {
            type: Number,
            require: true,
        },
        name: {
            type: String,
            require: true,
        },
        isAmplify: {
            type: Boolean,
            require: true,
        },
        type: {
            type: String,
            require: true,
        },
        tableData: {
            type: Array,
            require: true,
        },
        chartData: {
            type: Object | Array,
            require: true,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        tableColumn: {
            type: Array,
            default: () => [],
        },
        isPrivate: {
            type: Boolean,
            require: true,
        },
    },
    computed: {
        chart() {
            const type = this.chartData.type;
            let option = {
                ...this.chartData,
            };
            Reflect.deleteProperty(option, "type");
            return {
                type,
                option,
            };
        },
    },
    watch: {
        isEditing() {
            this.$nextTick(() => {
                if (this.isEditing && this.$refs["edit-input"]) {
                    this.$refs["edit-input"].focus();
                }
            });
        },
    },
    data() {
        return {
            editName: this.name,
            isEditing: false,
        };
    },
    methods: {
        changeTitle() {
            if (this.editName.length === 0) {
                this.$message({
                    type: "error",
                    message: "图标名称能为空",
                });
            }
            this.$emit("edit-panel-name", this.id, this.editName);
            this.$emit("is-operate", false);
            this.isEditing = false;
        },
        setPanelName() {
            this.$emit("is-operate", true);
            this.isEditing = true;
        },
        gotoQueryPage() {
            this.$emit("edit-search", this.id);
        },
    },
};
</script>

<style lang="scss" scoped>
.panel {
    height: 100%;
    width: 100%;
    border: 1px solid #eee;
    padding: 12px 20px 10px 20px;
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        height: 38px;

        .name {
            margin-left: 0;
            margin-right: auto;
        }

        .op {
            display: flex;
            column-gap: 8px;
            align-items: center;

            .icon {
                width: 14px;
            }

            img {
                cursor: pointer;
                font-weight: 700;
            }

            i {
                cursor: pointer;
            }
        }
    }

    .body {
        height: calc(100% - 38px);
        width: 100%;

        .query-table {
            width: 100%;
            height: 100%;
            overflow: auto;
        }

        .chart-box {
            height: 100%;
            width: 100%;
        }
    }

    .amplified {
        height: 600px;
    }
}
</style>
