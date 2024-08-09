<template>
    <el-container>
        <!-- 功能操作区域 -->
        <el-header class="product-header">
            <el-button-group>
                <el-button @click="openDialog('create', {})" type="success">添加产品线</el-button>
            </el-button-group>
            <el-button-group>
                <el-button @click="goBack" type="primary">返回</el-button>
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
                    ></el-table-column>
                </template>
                <el-table-column fixed="right" label="操作" align="center" width="240">
                    <template v-slot="scope">
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
                <el-form-item :label="metadata.productName.label" prop="productName">
                    <el-input v-model="formData.productName" clearable :disabled="dialogAction === 'edit'"></el-input>
                </el-form-item>
                <el-form-item :label="metadata.description.label" prop="description">
                    <el-input v-model="formData.description" clearable :disabled="dialogAction === 'edit'"></el-input>
                </el-form-item>
                <el-form-item :label="metadata.operator.label" prop="operator">
                    <el-input v-model="formData.operator" clearable></el-input>
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
import api from "@/api/product";
import config from "./config";

export default {
    name: "product",
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
                description: [{ required: true, message: "请输入描述", trigger: "blur" }],
                productName: [{ required: true, message: "请输入产品线名称", trigger: "blur" }],
                operator: [{ required: true, message: "请输入产品线管理员", trigger: "blur" }]
            },
            dialogVisible: false,
            dialogAction: "create",
            submitFlag: true,
            metadata: {
                ...config
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
                this.searchData.size = pagination.limit || this.searchData.size;
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
                            this.$notify({ title: "添加产品线成功", type: "success" });
                            this.list();
                            this.submitFlag = true;
                        })
                        .catch(() => {
                            this.submitFlag = true;
                        });
                }
            });
        },
        update() {
            this.$refs["form"].validate((isValid) => {
                if (isValid) {
                    const tempData = Object.assign({}, this.formData);
                    const { id, productCode, productName, description, operator } = tempData;
                    api.update({ id, productCode, productName, description, operator }).then((response) => {
                        this.dialogVisible = false;
                        this.$notify({ title: "更新成功", type: "success" });
                        this.list();
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
                case "edit":
                    this.update();
                    break;
                default:
                    alert("错误类型");
            }
        },
        goBack() {
            this.$router.go(-1);
        }
    }
};
</script>
<style lang="scss">
.product-header {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
}
</style>
