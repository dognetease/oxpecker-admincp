<template>
    <div class="virtual">
        <div>
            <div class="flex items-center mt-3 gap-x-5">
                <div class="flex items-center">
                    <div class="mr-2">标签</div>
                    <el-select
                        clearable
                        filterable
                        class="w-44"
                        placeholder="请选择标签"
                        v-model="tag"
                        @change="search"
                    >
                        <el-option
                            v-for="item in tagList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                </div>
                <div class="flex items-center">
                    <div class="mr-2">事件名</div>
                    <el-input
                        class="w-60"
                        v-model="eventSearchName"
                        @input="search"
                        placeholder="搜索事件名，显示名"
                    ></el-input>
                </div>
                <div class="flex items-center">
                    <div class="mr-2">
                        <el-checkbox v-model="crateByMe" @change="search">我创建的</el-checkbox>
                    </div>

                </div>
                <div class="flex items-center ml-auto mr-0">
                    <el-button type="primary" icon="el-icon-plus" size="small" @click="createVirtualEvent"
                        >创建虚拟事件</el-button
                    >
                </div>

            </div>
        </div>
        <div class="table w-full">
            <el-table row-key="id" :data="tableData.list" style="width: 100%" stripe border>
                <el-table-column prop="name" label="虚拟事件名">
                    <template slot-scope="scope">
                        <el-button type="text" @click="() => viewDetail(scope.row)">{{
                            scope.row.name
                        }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="displayName" label="虚拟事件显示名"></el-table-column>
                <el-table-column label="标签">
                    <template slot-scope="scope">
                        <div v-if="scope.row.tagList && scope.row.tagList.length > 0" class="tag-wrapper">
                            <el-tag
                                v-for="(tag, idx) in scope.row.tagList"
                                :key="idx"
                                type="info"
                                size="small"
                            >
                                {{ tag }}</el-tag
                            >
                        </div>
                        <div v-else>-</div>
                    </template>
                </el-table-column>
                <el-table-column label="事件截图" width="100">
                    <template slot-scope="scope">
                        <div v-if="scope.row.pictureList && scope.row.pictureList.length > 0" class="img">
                            <el-image
                                style="width: 20px; height: 20px"
                                :src="previewUrl"
                                :preview-src-list="scope.row.pictureList"
                            >
                            </el-image>
                        </div>
                        <div v-else>-</div>
                    </template>
                </el-table-column>
                <el-table-column prop="includeEvents" label="包含事件" :min-width="150"></el-table-column>
                <el-table-column prop="remark" label="备注" :min-width="200"></el-table-column>
                <el-table-column label="操作" width="110">
                    <template slot-scope="scope">
                        <div class="operator">
                            <el-tooltip placement="top" content="复制虚拟事件">
                                <i
                                    class="icon el-icon-copy-document"
                                    @click="() => copyVirtualEvent(scope.row)"
                                ></i>
                            </el-tooltip>
                            <i
                                class="icon el-icon-edit"
                                v-if="scope.row.canEdit"
                                @click="() => editVirtualEvent(scope.row)"
                            ></i>
                            <el-popconfirm
                                v-if="scope.row.canDelete"
                                title="确定要删除吗?"
                                @confirm="deleteVirtualEvent(scope.row)"
                            >
                                <i slot="reference" class="icon el-icon-delete delete"></i>
                            </el-popconfirm>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
            <TablePagination
                style="margin-top: 20px"
                :total="tableData.total"
                :pagesize="pagesize"
                :page="page"
                @size-change="onPageSizeChange"
                @current-change="onPageChange"
            ></TablePagination>
        </div>
        <div class="drawer">
            <el-drawer
                :visible.sync="drawerVisible"
                :title="drawerTitle"
                direction="rtl"
                destroy-on-close
                :size="850"
                :wrapperClosable="eventType === 'view'"
            >
                <h4 class="title" slot="title">{{ drawerTitle }}</h4>
                <CreateVirtualEvent
                    ref="drawerEditRef"
                    v-if="eventType === 'create'"
                    :type="createType"
                    :data="editData"
                    :loading="drawerBtnLoading"
                    @submit="submitEditEvent"
                    @cancel="() => (drawerVisible = false)"
                ></CreateVirtualEvent>
                <ViewVirtualEvent
                    v-else-if="eventType === 'view'"
                    :data="editData"
                    @cancel="() => (drawerVisible = false)"
                ></ViewVirtualEvent>
            </el-drawer>
        </div>
    </div>
</template>

<script setup>
import { VirtualEvent, productCode$ } from "@/serviceStore/virtual-event/index.js";
import { ref, onMounted, reactive } from "vue";
import { useUnsubscribe } from "@/utils/hooks/useUnsubscribe";
import TablePagination from "@/components/table-pagination.vue";
import previewUrl from "@/icons/svg/preview.svg";
import CreateVirtualEvent from "./create-virtual-event.vue";
import ViewVirtualEvent from "./view-virtual-event.vue";
import { omit } from "lodash";
import { map, find } from "lodash";

const virtualEvent = new VirtualEvent();
const addSubScription = useUnsubscribe();

// tag相关
const tag = ref("");
const tagList = ref([]);

const tableData = reactive({
    list: [],
    total: 0,
});

// search 相关
const crateByMe = ref(false);
const eventSearchName = ref("");
const page = ref(1);
const pagesize = ref(20);
const productCode = ref("");
const search = () => {
    const query = {
        page: page.value - 1,
        pagesize: pagesize.value,
        match: eventSearchName.value,
        createdBySelf: crateByMe.value,
        productCode: productCode.value,
        tag: tag.value,
        eventType: "virtual",
        sort: "id,desc",
    };

    virtualEvent.search(query);
};
const onPageChange = curPage => {
    page.value = curPage;
    search();
};
const onPageSizeChange = size => {
    pagesize.value = size;
    search();
};

// drawer
const drawerVisible = ref(false);
const drawerTitle = ref("");

// 新建虚拟事件相关
const eventType = ref("");
const createType = ref("");
const editData = ref({});
const drawerBtnLoading = ref(false);
const drawerEditRef = ref(null);
const getDataFromRow = data => {
    return omit(data, ["canEdit", "canDelete"]);
};
// 新建虚拟事件
const createVirtualEvent = () => {
    eventType.value = "create";
    drawerVisible.value = true;
    drawerTitle.value = "创建虚拟事件";

    createType.value = "create";
    editData.value = {
        conditions: [],
    };
};
// 复制虚拟事件
const copyVirtualEvent = data => {
    eventType.value = "create";
    drawerVisible.value = true;
    drawerTitle.value = "复制虚拟事件";

    createType.value = "copy";
    editData.value = getDataFromRow(data);
    editData.value.name = editData.value.name + "_copy";
    editData.value.displayName = editData.value.displayName + "_copy";
    virtualEvent
        .getEventList$({
            productCode: productCode.value,
            eventId: data.name,
        })
        .subscribe(list => {
            drawerEditRef.value.initList(list);
        });
};

// 编辑虚拟事件
const editVirtualEvent = data => {
    eventType.value = "create";
    drawerVisible.value = true;
    drawerTitle.value = "修改虚拟事件";

    createType.value = "edit";
    editData.value = getDataFromRow(data);
    virtualEvent
        .getEventList$({
            productCode: productCode.value,
            eventId: data.name,
        })
        .subscribe(list => {
            drawerEditRef.value.initList(list);
        });
};

// 新建和更新虚拟事件获取body
const getRequestBody = data => {
    const body = {
        eventId: data.eventName,
        eventName: data.displayName,
        descriptionUrl: data.pictureList,
        description: data.remark,
        tag: data.tags,
    };
    const filters = map(data.eventFilters, each => {
        return {
            eventId: each.name,
            conditionRelationType: each.cond,
            conditions: map(each.filters, filter => {
                return {
                    attributeName: filter.name,
                    filterType: filter.cond,
                    valueSet: filter.value,
                    attributeType: find(each.option || [], op => {
                        return op.value === filter.name;
                    })?.type,
                };
            }),
        };
    });
    body.eventCondition = filters;
    return body;
};
// 新建和更新虚拟事件
const submitEditEvent = data => {
    drawerBtnLoading.value = true;
    const body = getRequestBody(data);
    const error = () => {
        drawerBtnLoading.value = false;
    };
    const next = () => {
        drawerBtnLoading.value = false;
        drawerVisible.value = false;
    };
    switch (createType.value) {
        case "create":
        case "copy":
            virtualEvent.create(body).subscribe({
                next,
                error,
            });
            break;
        case "edit":
            body.id = data.id;
            virtualEvent.update(body).subscribe({
                next,
                error,
            });
            break;
        default:
            break;
    }
};

// 查看虚拟事件
const viewDetail = data => {
    eventType.value = "view";
    drawerVisible.value = true;
    drawerTitle.value = "查看虚拟事件";
    editData.value = getDataFromRow(data);
    // getEventList(data);
    virtualEvent
        .getViewEventList$({
            productCode: productCode.value,
            eventId: data.name,
        })
        .subscribe(list => {
            editData.value = {
                ...editData.value,
                conditions: list,
            };
        });
};
// 删除虚拟事件
const deleteVirtualEvent = data => {
    virtualEvent.delete({
        id: data.id,
    });
    // virtualEvent.delete(data.id);
};

onMounted(() => {
    const tableData$ = virtualEvent.getTableData$();
    const tableDataSub = tableData$.subscribe(data => {
        const { list = [], total = 0 } = data;
        tableData.list = list;
        tableData.total = total;
    });
    addSubScription(tableDataSub);

    const productCodeSub = productCode$.subscribe(code => {
        productCode.value = code;
        search();
    });
    addSubScription(productCodeSub);

    const tagList$ = virtualEvent.getTagList$();
    const tagSub = tagList$.subscribe(list => {
        tagList.value = list;
    });
    addSubScription(tagSub);
});
</script>

<style lang="scss" scoped>
.virtual {
    padding: 20px;
    font-size: 14px;
    .table {
        margin-top: 20px;
        .tag-wrapper {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .img {
            display: flex;
            align-items: center;
            column-gap: 5px;
            cursor: pointer;
            user-select: none;

            &:hover {
                color: #409eff;
            }
        }

        .operator {
            display: flex;
            align-items: center;
            column-gap: 15px;

            .icon {
                font-size: 14px;
                cursor: pointer;
                user-select: none;
                &:hover {
                    color: #409eff;
                }
            }

            .delete {
                &:hover {
                    color: #f04943;
                }
            }
        }
    }

    .drawer {
        .title {
            margin: 0;
        }
        ::v-deep #el-drawer__title {
            padding: 20px !important;
            margin-bottom: 0;
        }
    }
}
</style>
