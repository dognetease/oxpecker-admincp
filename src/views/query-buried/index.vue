<template>
    <div class="wrapper">
        <div class="table-query">
            <div class="query">
                <el-form :inline="true" :model="query" label-width="80px">
                    <el-form-item label="EventId">
                        <el-select
                            v-model="query.eventId"
                            clearable
                            filterable
                            remote
                            :remote-method="logSearchMethod.searchEventId"
                            @clear="() => logSearchMethod.searchEventId()"
                        >
                            <el-option
                                v-for="item in eventOption"
                                :label="item.label"
                                :value="item.value"
                                :key="item.value"
                            >
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="标签">
                        <el-select v-model="query.tag" clearable filterable>
                            <el-option
                                v-for="item in tagOption"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            ></el-option
                        ></el-select>
                    </el-form-item>
                    <el-form-item label="开发者">
                        <el-select v-model="query.developer" clearable filterable>
                            <el-option
                                v-for="item in developerOption"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            ></el-option></el-select
                    ></el-form-item>
                    <el-form-item label="提交者">
                        <el-select v-model="query.submitter" clearable filterable>
                            <el-option
                                v-for="item in developerOption"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            ></el-option></el-select
                    ></el-form-item>
                    <el-form-item label="版本号">
                        <el-input :style="{ width: '217px' }" v-model="query.version"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <div class="operate">
                <el-button type="primary" :disabled="disableBatchOp" @click="batchDevComplete"
                    >开发完成</el-button
                >
                <el-button type="warning" :disabled="disableBatchOp" @click="batchPublish">发布</el-button>
                <el-button type="primary" class="search" @click="() => search()">搜索</el-button>
            </div>
            <div class="table">
                <LogTable
                    :list="tableData"
                    @view-attr="viewAttr"
                    @edit-attr="editAttr"
                    @edit-group-attr="editGroupAttr"
                    @disable-attr="disableAttr"
                    @remark-attr="remarkAttr"
                    @dev-complete="devComplete"
                    @publish-attr="publishAttr"
                    @delete-attr="deleteAttr"
                    @multi-select="multiSelect"
                ></LogTable>
                <TablePagination
                    :total="pageConf.total"
                    :pagesize="pageConf.pagesize"
                    :page="pageConf.page"
                    @size-change="onPageSizeChange"
                    @current-change="onPageChange"
                ></TablePagination>
            </div>
            <RemarkDialog
                :visible="remarkVisible"
                :data="remarkList"
                @close-modal="closeRemark"
                @submit-edit="submitRemark"
            ></RemarkDialog>

            <DisableAttr
                :visible="disableVisible"
                :checkedList="checkedDisabledAttr"
                @close-modal="() => (disableVisible = false)"
                @update-edit="submitDisableAttr"
                @change-checked="changeCheckedStatus"
                @clear-checked="clearAllCheckedStatus"
                @check-all="checkAllDisableAttr"
                @reset-status="() => (checkedDisabledAttr = [])"
            ></DisableAttr>
        </div>
        <el-drawer
            :visible.sync="showDrawer"
            destroy-on-close
            :wrapperClosable="viewType === 'view-attr'"
            :size="850"
            custom-class="log-drawer"
        >
            <div class="title" slot="title">
                {{ drawerTitle }}
            </div>
            <div class="content">
                <div class="view-attr" v-if="viewType === 'view-attr'">
                    <ViewAttr :attrString="viewLogData.attrString" :attrNumber="viewLogData.attrNumber">
                    </ViewAttr>
                </div>
                <div v-else-if="viewType === 'edit-attr'">
                    <EditAttr
                        style="padding: 0 20px 20px 10px"
                        :data="editLogData"
                        type="edit-attr"
                        @update-attr="updateAttr"
                    ></EditAttr>
                </div>
                <div v-else-if="viewType === 'edit-group-attr'">
                    <EditAttr
                        style="padding: 0 20px 20px 10px"
                        :data="editGroupLogData"
                        type="edit-group-attr"
                        @update-attr="updateGroupAttr"
                    ></EditAttr>
                </div>
            </div>
        </el-drawer>
    </div>
</template>

<script setup>
import {
    productAndKeys$,
    developerList$,
    tagList$,
    remoteEventIds$,
    logSearchMethod,
    tableData$,
} from "@/serviceStore/log-search/index.js";
import { onMounted, ref, reactive, computed, nextTick } from "vue";
import { useUnsubscribe } from "@/utils/hooks/useUnsubscribe";
import LogTable from "./log-table.vue";
import track from "@/utils/dataTracker";
import { Message, MessageBox } from "element-ui";
import RemarkDialog from "./remark-dialog.vue";
import DisableAttr from "./disable-attr.vue";
import ViewAttr from "./view-attr.vue";
import EditAttr from "../entry-buried/index.vue";
import TablePagination from "@/components/table-pagination.vue";

const trackLogSearch = action => {
    track("event_dig_management_search", {
        action,
    });
};

const eventOption = ref([]);
const tagOption = ref([]);
const developerOption = ref([]);

const getEventList = (match= '') => {

}

// table 相关
const tableData = ref([]);
const selectedRowIds = ref([]);
const disableBatchOp = computed(() => {
    return selectedRowIds.value.length === 0;
});
const viewAttr = data => {
    const { id } = data;
    logSearchMethod.viewLog(id).subscribe(data => {
        viewLogData.value = data;
        trackLogSearch("view");
        if (data.attrNumber.length === 0 && data.attrString.length === 0) {
            Message.error("该埋点事件暂无属性");
            return;
        }
        viewType.value = "view-attr";
        showDrawer.value = true;
        drawerTitle.value = "查看属性";
    });
};

const showDrawer = ref(false);
const drawerTitle = ref("");
const editAttr = data => {
    logSearchMethod.editLog(data.id).subscribe(data => {
        editLogData.value = data;
        viewType.value = "edit-attr";
        showDrawer.value = true;

        drawerTitle.value = "编辑埋点";
    });
};
const editGroupAttr = data => {
    logSearchMethod.editLogGroup(data).subscribe(data => {
        editGroupLogData.value = data;
        viewType.value = "edit-group-attr";
        showDrawer.value = true;
        drawerTitle.value = "编辑同组埋点";
    });
};
const disableAttr = ({ eventId, appKey }) => {
    disableAttrParam.eventId = eventId;
    disableAttrParam.appKey = appKey;
    logSearchMethod.getAllAttr(eventId, appKey).subscribe(data => {
        if (data.length === 0) {
            Message.error("该埋点事件没有属性");
            return;
        }
        disableVisible.value = true;
        checkedDisabledAttr.value = data;
    });
};
const remarkAttr = ({ eventId, appKey }) => {
    remarkParam.appKey = appKey;
    remarkParam.eventId = eventId;
    const observable$ = logSearchMethod.getRemark(eventId, appKey);
    observable$.subscribe(list => {
        remarkList.value = list;
        remarkVisible.value = true;
    });
};
const devComplete = ({ eventId, appKey }) => {
    trackLogSearch("develop_complete");
    logSearchMethod.devComplete(eventId, appKey).subscribe(() => {
        Message.success("开发完成");
    });
};
const publishAttr = ({ eventId, appKey }) => {
    trackLogSearch("publish");
    logSearchMethod.publish(eventId, appKey).subscribe(() => {
        Message.success("发布成功");
    });
};
const deleteAttr = ({ eventId, appKey }) => {
    trackLogSearch("delete");
    logSearchMethod.delete(eventId, appKey).subscribe(() => {
        Message.success("删除成功");
    });
};
const multiSelect = ids => {
    selectedRowIds.value = ids;
};

const getValidData = () => {
    const idSet = new Set(Array.from(selectedRowIds.value));
    const data = tableData.value.filter(item => idSet.has(item.id));
    return data;
};
// 批量 目前是轮询调用，后期替换接口
const batchDevComplete = () => {
    // trackLogSearch("batch_develop_complete");
    const data = getValidData();
    const ret = logSearchMethod.batchDevComplete(data);
    if (ret) {
        ret.subscribe(() => {
            Message.success("批量开发完成");
        });
    } else {
        Message.error("所选数据无可开发的数据");
    }
};
const batchPublish = () => {
    // trackLogSearch("batch_publish");
    const data = getValidData();
    const ret = logSearchMethod.batchPublish(data);
    if (ret) {
        ret.subscribe(() => {
            Message.success("批量发布完成");
        });
    } else {
        Message.error("所选数据无可发布的数据");
    }
};

// 查询列表相关
const query = ref({});
const resetQuery = () => {
    query.value = {
        eventId: "",
        version: "",
        tag: "",
        developer: "",
        submitter: "",
    };
};

// page 相关
const pageConf = reactive({
    page: 1,
    pagesize: 20,
    total: 1000,
});
const onPageChange = page => {
    pageConf.page = page;
    search();
};

const onPageSizeChange = pagesize => {
    pageConf.pagesize = pagesize;
    search();
};

// 发起查询
const getSearchQuery = () => {
    return {
        page: pageConf.page - 1,
        size: pageConf.pagesize,
        match: query.value.eventId,
        version: query.value.version,
        tag: query.value.tag,
        developer: query.value.developer,
        operator: query.value.submitter,
        eventType: 'biz,perf,unknown',
        createdBySelf: false
    };
};
const search = (sort = "id,desc") => {
    const param = getSearchQuery();
    if (sort) {
        param.sort = sort;
    }
    logSearchMethod.search(param);
};

// 备注
const remarkVisible = ref(false);
const remarkList = ref([]);
const remarkParam = {
    appKey: "",
    eventId: "",
    text: "",
    imgs: [],
};
const closeRemark = () => {
    remarkVisible.value = false;
};
const submitRemark = ({ text = "", imgs = [] }) => {
    remarkParam.imgs = imgs;
    remarkParam.text = text;
    logSearchMethod.updateRemark(remarkParam).subscribe(() => {
        Message.success("备注成功");
        closeRemark();
        trackLogSearch("remark");
    });
};

// 禁用属性
const disableVisible = ref(false);
const disableAttrParam = {
    eventId: "",
    appKey: "",
};
const checkedDisabledAttr = ref([]);
const changeCheckedStatus = (name, checked) => {
    checkedDisabledAttr.value = checkedDisabledAttr.value.map(item => {
        if (item.name === name) {
            return {
                ...item,
                checked,
            };
        }
        return item;
    });
};
const checkAllDisableAttr = () => {
    checkedDisabledAttr.value = checkedDisabledAttr.value.map(each => {
        return {
            ...each,
            checked: true,
        };
    });
};
const clearAllCheckedStatus = () => {
    checkedDisabledAttr.value = checkedDisabledAttr.value.map(each => {
        return {
            ...each,
            checked: false,
        };
    });
};
const submitDisableAttr = () => {
    const checkedList = checkedDisabledAttr.value.filter(each => each.checked);
    const disableListStr = checkedList.map(each => each.name).join(",");
    logSearchMethod
        .disableAttr({
            ...disableAttrParam,
            attributeNames: disableListStr,
        })
        .subscribe(() => {
            Message.success("禁用成功");
            disableVisible.value = false;
            trackLogSearch("disable");
        });
};

// 查看相关
const viewType = ref("");
const viewLogData = ref({});
// 编辑埋点
const editLogData = ref({});
const updateAttr = body => {
    body.id = editLogData.value.id;
    body.productCode = editLogData.value.productCode;
    logSearchMethod.updateEditLog(body).subscribe(() => {
        Message.success("编辑成功");
        viewType.value = "";
        showDrawer.value = false;
        search();
    });
};

// 编辑埋点组
const editGroupLogData = ref({});
const updateGroupAttr = body => {
    body.id = editGroupLogData.value.id;
    body.productCode = editGroupLogData.value.productCode;
    MessageBox.confirm("当前事件对应的属性及属性值，将覆盖同组其他应用的对应值，是否确认修改？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
    })
        .then(() => {
            logSearchMethod.updateGroupEditLog(body).subscribe(() => {
                Message.success("编辑成功");
                viewType.value = "";
                showDrawer.value = true;
                search();
            });
        })
        .catch(() => {
            Message({
                type: "info",
                message: "已取消",
            });
        });
};

const addSubscription = useUnsubscribe();
onMounted(() => {
    // 事件列表
    const remoteEventSub = remoteEventIds$.subscribe(option => {
        eventOption.value = option;
    });
    addSubscription(remoteEventSub);

    // 全局productCode和appKeys
    const globalSub = productAndKeys$.subscribe(() => {
        resetQuery();
        tagList$.subscribe(option => {
            tagOption.value = option;
        });
        logSearchMethod.searchEventId();
        search();
    });
    addSubscription(globalSub);

    // 用户列表
    developerList$.subscribe(option => {
        developerOption.value = option;
    });

    // table数据
    const tableSub = tableData$.subscribe(({ list, total }) => {
        tableData.value = list;
        pageConf.total = total;
    });
    addSubscription(tableSub);

});
</script>

<style lang="scss" scoped>
.wrapper {
    padding: 20px;
    .table-query {
        .operate {
            display: flex;
            align-items: center;

            .search {
                margin-left: auto;
                margin-right: 0;
            }
        }

        .table {
            padding-top: 20px;
            width: 100%;
            .page {
                margin-top: 12px;
                display: flex;
                justify-content: flex-end;
            }
        }
    }

    .log-drawer {
        .title {
            font-size: 20px;
        }
        .content {
            .attr {
                padding-top: 20px;
            }

            .view-attr {
                padding: 0 20px;
            }
        }
    }
}
</style>
