<template>
    <el-container>
        <!-- 功能操作区域 -->
        <el-header class="el-header-change">
            <el-input placeholder="id" v-model="searchData.id" clearable style="width:200px" class="bottom-distance"></el-input>
            <el-button-group>
                <el-button @click="list()" type="primary">搜索</el-button>
                <el-button @click="openDialog('create', {})" type="success">新建</el-button>
            </el-button-group>
        </el-header>

        <!-- 数据表格区域 -->
        <el-main>
            <el-table :data="tableData.data" stripe border style="width: 100%" v-loading="listLoading">
                <template v-for="col in metadata">
                    <el-table-column
                        v-if="col.showInTable"
                        :key="col.column"
                        :prop="col.column"
                        :label="col.label"
                        :width="col.width"
                        :formatter="col.formatter"
                        align="center"
                    >
                    </el-table-column>
                </template>
                <el-table-column fixed="right" label="操作" align="center" width="240">
                    <template v-slot="scope">
                        <el-button @click="openViewDialog(scope.row)" type="info" size="mini">查看</el-button>
                        <el-button @click="openDialog('edit', scope.row)" type="primary" size="mini">编辑</el-button>
                        <el-popconfirm @onConfirm="deleteById(scope.row)" title="确定要删除吗?" confirmButtonType="text" cancelButtonType="primary">
                            <el-button slot="reference" type="danger" size="mini">删除</el-button>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
            <pagination
                v-if="tableData.total > 0"
                :total="tableData.total"
                :page.sync="searchData.page"
                :limit.sync="searchData.size"
                @pagination="list"
            />
        </el-main>

        <!-- 新建/编辑弹窗 -->
        <el-dialog :title="dialogAction" :visible.sync="dialogVisible" :close-on-click-modal="false">
            <el-form ref="form" :model="formData" :rules="formRules" label-width="120px" style="width: 600px">
                <el-form-item :label="metadata.id.label" prop="id">
                    <el-input v-model="formData.id" type="Number"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitDialog">确定</el-button>
            </span>
        </el-dialog>
        <!-- 查看弹窗 -->
        <el-dialog title="查看" :visible.sync="viewDialogVisible" :close-on-click-modal="false">
            <el-table :data="viewData" stripe border style="width: 100%">
                <el-table-column label="名称" prop="label" align="center"></el-table-column>
                <el-table-column label="字段" prop="column" align="center"></el-table-column>
                <el-table-column label="值" prop="value" align="center">
                    <template slot-scope="scope">{{
                        scope.row.formatter ? scope.row.formatter(scope.row, scope.column, scope.row.value, scope.$index) : scope.row.value
                    }}</template>
                </el-table-column>
            </el-table>
        </el-dialog>
    </el-container>
</template>

<script>
import Pagination from "@/components/Pagination";
import api from "@/api/app";

export default {
    name: "app",
    components: { Pagination },
    data() {
        return {
            listLoading: true,
            searchData: { page: 0, size: 20 },
            tableData: { data: [], total: 0 },
            formData: {},
            formRules: {},
            dialogVisible: false,
            dialogAction: "create",
            viewDialogVisible: false,
            viewData: [],
            // 元数据
            metadata: {
                id: {
                    label: "id",
                    column: "id",
                    showInTable: true //是否展示在list
                }
            }
        };
    },
    created() {
        this.list();
    },
    methods: {
        list(pagination) {
            this.listLoading = true;
            if (pagination) {
                this.searchData.page = pagination.page;
                this.searchData.size = pagination.limit;
            }

            api.list(this.searchData).then(response => {
                this.tableData.data = response.data.data;
                this.tableData.total = response.data.total || 0;
            });
            setTimeout(() => {
                this.listLoading = false;
            }, 1 * 1000);
        },
        create() {
            this.$refs["form"].validate(isValid => {
                if (isValid) {
                    const tempData = Object.assign({}, this.formData);
                    api.create(tempData).then(response => {
                        this.dialogVisible = false;
                        this.$notify({ title: "创建成功", type: "success" });
                        this.list();
                    });
                }
            });
        },
        update() {
            this.$refs["form"].validate(isValid => {
                if (isValid) {
                    const tempData = Object.assign({}, this.formData);
                    api.update(tempData).then(response => {
                        this.dialogVisible = false;
                        this.$notify({ title: "更新成功", type: "success" });
                        this.list();
                    });
                }
            });
        },
        deleteById(data) {
            api.deleteById(data.id).then(response => {
                this.$notify({ title: "删除成功", type: "success" });
                this.list();
            });
        },
        openDialog(action, data) {
            this.formData = data ? Object.assign({}, data) : {};
            this.dialogAction = action;
            this.dialogVisible = true;
        },
        submitDialog() {
            switch (this.dialogAction) {
                case "create":
                    this.create();
                    break;
                case "edit":
                    this.update();
                    break;
                default:
                    alter("错误类型");
            }
        },
        openViewDialog(data) {
            this.viewData = [];
            for (var col in data) {
                if (this.metadata[col]) {
                    var row = {};
                    row.label = this.metadata[col].label;
                    row.column = col;
                    row.value = data[col];
                    if (this.metadata[col].formatter) {
                        row.formatter = this.metadata[col].formatter;
                    }
                    this.viewData.push(row);
                }
            }
            this.viewDialogVisible = true;
        }
    }
};
</script>
<style lang="scss"></style>
