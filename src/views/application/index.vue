<template>
    <el-container>
        <!-- 功能操作区域 -->
        <el-header class="el-header-change">
            <el-form :inline="true" ref="form">
                <el-form-item :label="metadata.type.label">
                    <el-select v-model="searchData.type" clearable placeholder="请选择应用类型">
                        <el-option
                            v-for="(option, index) in metadata.type.options"
                            :key="option.label + index"
                            :label="option.label"
                            :value="option.value"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="metadata.name.label">
                    <el-input v-model="searchData.name" clearable placeholder="请输入应用名称"></el-input>
                </el-form-item>
                <el-button-group>
                    <el-button @click="list({ ...searchData, page: 0 })" type="primary">搜索</el-button>
                    <el-button @click="openDialog('create')" type="success">新建</el-button>
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
                <el-table-column fixed="right" label="埋点信息" align="center" width="240">
                    <template v-slot="scope">
                        <el-button @click="openViewDialog(scope.row)" type="info" size="mini">查看</el-button>
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
                <el-form-item :label="metadata.type.label" prop="type">
                    <el-select v-model="formData.type" clearable placeholder="请选择应用类型">
                        <el-option
                            v-for="(option, index) in metadata.type.options"
                            :key="option.label + index"
                            :label="option.label"
                            :value="option.value"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="metadata.name.label" prop="name">
                    <el-input v-model="formData.name" clearable placeholder="请输入应用名称"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitDialog">确定</el-button>
            </span>
        </el-dialog>
    </el-container>
</template>

<script>
import Pagination from "@/components/Pagination";
import api from "@/api/application";
import optionsApi from "@/api/options";
import config from "./config";
import { mapGetters } from "vuex";

export default {
    name: "application",
    components: {
        Pagination
    },
    data() {
        return {
            listLoading: true,
            searchData: { page: 0, size: 20 },
            tableData: { data: [], total: 0 },
            formData: {},
            formRules: {
                productCode: [{ required: true, message: "请选择产品线", trigger: "blur" }],
                type: [{ required: true, message: "请选择应用类型", trigger: "blur" }],
                name: [{ required: true, message: "请输入应用名称", trigger: "blur" }]
            },
            dialogVisible: false,
            dialogAction: "create",
            viewDialogVisible: false,
            submitFlag: true,
            metadata: {
                ...config
            }
        };
    },
    computed: {
        ...mapGetters(["globalState"]),
        productCode() {
            return this.globalState.productId;
        }
    },
    watch: {
        productCode(productCode, oldProductCode) {
            if (productCode && productCode.length && productCode !== oldProductCode) {
                this.reloadPage();
            }
        }
    },
    async mounted() {
        const typeOptions = await api.getAppTypes();
        this.metadata.type = {
            ...this.metadata.type,
            options: typeOptions,
            formatter: function (row, col, value, index) {
                return typeOptions.filter((option) => {
                    const { value: optionValue } = option;
                    return optionValue === value;
                })[0].label;
            }
        };
        const productCodeOptions = await optionsApi.getProductCodeOptions();
        this.metadata.productCode = {
            ...this.metadata.productCode,
            options: productCodeOptions,
            formatter: function (row, col, value, index) {
                return productCodeOptions.filter((option) => {
                    const { value: optionValue } = option;
                    return optionValue === value;
                })[0].label;
            }
        };

        this.reloadPage(false);
    },
    methods: {
        async reloadPage() {
            this.searchData = {
                ...this.searchData,
                productCode: this.productCode
            };
            this.list();
        },
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
            }, 1000);
        },
        create() {
            if (!this.submitFlag) {
                return;
            }

            this.$refs["form"].validate((isValid) => {
                if (isValid) {
                    this.submitFlag = false;
                    const tempData = Object.assign({}, this.formData);
                    api.create(tempData)
                        .then((response) => {
                            this.dialogVisible = false;
                            this.$notify({ title: "创建成功", type: "success" });
                            this.list();
                            this.submitFlag = true;
                        })
                        .catch(() => {
                            this.submitFlag = true;
                        });
                }
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
                default:
                    alert("错误类型");
            }
        },
        openViewDialog(data) {
            // 跳到埋点管理
            this.$router.push({
                path: "/buried/search",
                query: { searchData: encodeURIComponent(JSON.stringify(data)) }
            });
        }
    }
};
</script>
<style lang="scss"></style>
