<template>
    <el-container>
        <!-- 功能操作区域 -->
        <el-header class="el-header-change">
            <el-form :inline="true" ref="form">
                <el-form-item :label="metadata.productCode.label">
                    <el-input
                        placeholder="请输入产品线"
                        v-model="searchData.productCode"
                        clearable
                        style="width: 200px"
                        class="bottom-distance"
                    ></el-input>
                </el-form-item>
                <el-form-item :label="metadata.userId.label">
                    <el-input
                        placeholder="请输入userId"
                        v-model="searchData.userId"
                        clearable
                        style="width: 200px"
                        class="bottom-distance"
                    ></el-input>
                </el-form-item>
                <el-button-group>
                    <el-button @click="list({ ...searchData, page: 0 })" type="primary">搜索</el-button>
                    <el-button @click="openDialog('create', {})" type="success">新建</el-button>
                </el-button-group>
            </el-form>
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
                    ></el-table-column>
                </template>
                <el-table-column fixed="right" label="操作" align="center" width="240">
                    <template v-slot="scope">
                        <el-button @click="openViewDialog(scope.row)" type="info" size="mini">查看</el-button>
                        <el-button @click="openDialog('edit', scope.row)" type="primary" size="mini">编辑</el-button>
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
                    <el-input v-model="formData.id" clearable type="Number" disabled></el-input>
                </el-form-item>
                <el-form-item :label="metadata.productCode.label" prop="productCode">
                    <el-select v-model="formData.productCode" clearable placeholder="请选择产品线">
                        <el-option
                            v-for="(option, index) in metadata.productCode.options"
                            :key="option.label + index"
                            :label="option.label"
                            :value="option.value"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="metadata.userId.label" prop="userId">
                    <el-input v-model="formData.userId" clearable></el-input>
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
import api from "@/api/product-user-permission";
import optionsApi from "@/api/options";
import config from "./config";

export default {
    name: "product-user-permission",
    components: {
        Pagination
    },
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
            metadata: { ...config }
        };
    },
    async mounted() {
        const productCodeOptions = await optionsApi.getAllProductCodeOptions();
        this.metadata.productCode = {
            ...this.metadata.productCode,
            options: productCodeOptions
        };
        this.list();
    },
    methods: {
        list(pagination) {
            this.listLoading = true;
            if (pagination) {
                this.searchData.page = pagination.page;
                this.searchData.size = pagination.limit;
            }

            api.list(this.searchData).then((response) => {
                this.tableData.data = response.data.data;
                this.tableData.total = response.data.total;
            });
            setTimeout(() => {
                this.listLoading = false;
            }, 1 * 1000);
        },
        create() {
            this.$refs["form"].validate((isValid) => {
                if (isValid) {
                    const tempData = Object.assign({}, this.formData);
                    tempData.productName = this.metadata.productCode.options.filter((item) => item.value === tempData.productCode)[0]?.label;
                    api.create(tempData).then((response) => {
                        this.dialogVisible = false;
                        this.$notify({ title: "创建成功", type: "success" });
                        this.list();
                    });
                }
            });
        },
        update() {
            this.$refs["form"].validate((isValid) => {
                if (isValid) {
                    const { id, userId, productCode } = Object.assign({}, this.formData);
                    const productName = this.metadata.productCode.options.filter((item) => item.value === productCode)[0]?.label;

                    api.update({ id, userId, productCode, productName }).then((response) => {
                        this.dialogVisible = false;
                        this.$notify({ title: "更新成功", type: "success" });
                        this.list();
                    });
                }
            });
        },
        deleteById(data) {
            api.deleteById(data.id).then((response) => {
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
                    alert("错误类型");
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
