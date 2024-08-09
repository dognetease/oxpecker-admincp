<template>
    <div class="log">
        <el-form
            ref="formRef"
            :rules="formRules"
            label-position="right"
            label-width="130px"
            :model="formData"
            class="form"
        >
            <div class="row group">
                <el-form-item label="产品线" v-if="type !== 'plain'">
                    <el-select disabled :value="data.productCode" class="input-item">
                        <el-option
                            v-for="item in data.productCodeOption"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="应用类型" prop="appKey">
                    <el-select
                        class="select input-item"
                        :disabled="type === 'edit-attr'"
                        v-model="formData.appKey"
                        multiple
                        collapse-tags
                        :clearable="type === 'plain'"
                    >
                        <el-option
                            v-for="item in appKeyList"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                            :disabled="item.disabled === true"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="EventId" prop="eventId">
                    <el-input
                        class="input-item"
                        :disabled="type !== 'plain'"
                        v-model="formData.eventId"
                    ></el-input>
                </el-form-item>
                <el-form-item label="事件类型" prop="eventType">
                    <template slot="label">
                        <div class="type">
                            <span class="label">事件类型</span>
                            <el-tooltip>
                                <div slot="content">
                                    业务打点：记录用户使用产品过程中的用户行为；
                                    <br />
                                    性能打点：记录客户端、web端、服务器端程序的性能，可使用更专业的grafana工具，分析P90,平均响应时间等指标，优化客户端或其他端上的性能。
                                </div>
                                <i class="icon el-icon-question"></i>
                            </el-tooltip>
                        </div>
                    </template>
                    <el-select v-model="formData.eventType" class="input-item">
                        <el-option label="性能打点" value="perf"></el-option>
                        <el-option label="业务打点" value="biz"></el-option>
                    </el-select>
                </el-form-item>
            </div>
            <div class="row">
                <el-form-item label="开发者" prop="developer">
                    <el-select
                        class="select input-item"
                        v-model="formData.developer"
                        filterable
                        clearable
                    >
                        <el-option
                            v-for="item in developerList"
                            :key="item.mail"
                            :value="item.mail"
                            :label="item.label"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="标签" prop="tags">
                    <el-input
                        placeholder="请输入标签，多个标签之间用英文逗号分隔"
                        v-model="formData.tags"
                        class="input-item"
                    ></el-input>
                </el-form-item>
            </div>
            <el-form-item label="版本号">
                <div class="version">
                    <div class="item" v-for="item in formData.versionList" :key="item.value">
                        <div class="label">{{ item.label }}</div>
                        <el-input class="value" v-model="item.version" size="small"></el-input>
                    </div>
                </div>
            </el-form-item>
            <el-form-item label="事件描述">
                <event-desc
                    v-model="formData.eventDesc"
                    :eventPicUrl="formData.pictureUrl"
                    @add-url="updatePicUrl"
                    @remove-url="removePicUrl"
                    v-if="type === 'plain'"
                ></event-desc>
                <div id="wang-editor" v-else></div>
            </el-form-item>
            <el-form-item label="属性">
                <div class="attr">
                    <div class="str">
                        <p class="header">
                            <span class="title">字符类型</span>
                            <el-button
                                type="primary"
                                size="small"
                                round
                                class="edit"
                                @click="editStrAttr"
                                @add-attribute="addAttr"
                                >编辑属性名</el-button
                            >
                        </p>
                        <str-table
                            :tableData="strAttributes"
                            @edit-attr="editStrAttr"
                            @edit-attr-detail="editStrDetail"
                        ></str-table>
                    </div>
                    <div class="num">
                        <p class="header">
                            <span class="title">数字类型</span>
                            <el-button type="primary" size="small" round class="edit" @click="editNumAttr"
                                >编辑属性名</el-button
                            >
                        </p>
                        <num-table :tableData="numAttributes"></num-table>
                    </div>
                </div>
            </el-form-item>

            <el-form-item>
                <template #label>
                    <div class="common-attr">
                        <span>已有公共属性</span>
                        <el-popover
                            placement="top-start"
                            trigger="hover"
                            content="sdk中已经包含的该产品线公共属性，会自动上传，无需产品再录入"
                        >
                            <i class="el-icon-question" slot="reference"></i>
                        </el-popover>
                    </div>
                </template>
                <el-table :data="commonAttr" border size="small">
                    <el-table-column property="name" label="字段名称"></el-table-column>
                    <el-table-column property="mapField" label="映射字段"></el-table-column>
                    <el-table-column property="type" label="字段类型"></el-table-column>
                    <el-table-column property="operator" label="操作者"></el-table-column>
                    <el-table-column property="desc" label="字段描述"></el-table-column>
                </el-table>
            </el-form-item>
            <div class="footer">
                <div class="plain" v-if="type === 'plain'">
                    <el-button type="primary" @click="submit">提交</el-button>
                    <el-button type="primary" @click="submitAndReset">提交并继续录入</el-button>
                </div>
                <div v-else class="edit">
                    <el-button type="primary" @click="updateAttr">确定</el-button>
                </div>
            </div>
        </el-form>
        <el-dialog
            :visible.sync="editVisible"
            :title="editTitle"
            :close-on-click-modal="false"
            append-to-body
        >
            <attr-edit
                :list="editAttrList"
                v-if="editType === 'str' || editType === 'str-detail'"
                @add-attribute="addAttr"
                @remove-attribute="removeAttr"
            ></attr-edit>
            <num-edit
                v-else-if="editType === 'num'"
                :list="editAttrList"
                :unitList="unitList"
                @add-attribute="addAttr"
                @remove-attribute="removeAttr"
            ></num-edit>
            <div class="enter-log-dialog-footer">
                <el-button @click="() => (editVisible = false)">取消</el-button>
                <el-button @click="updateTable" type="primary" plain>确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import StrTable from "./components/AttrTable/strTable.vue";
import NumTable from "./components/AttrTable/numTable.vue";
import NumEdit from "./components/AttrEdit/numEdit.vue";
import AttrEdit from "./components/AttrEdit/index.vue";
import EventDesc from "@/components/eventDesc/index.vue";
import { useRouter } from "@/utils/hooks/useVuePlugin.js";
import { ref, onMounted, watch, nextTick } from "vue";
import permissionApi from "@/api/product-user-permission";
import optionsApi from "@/api/options";
import api, { getCommonAttributes } from "@/api/entry-buried";
import { appKeyOption$, productCode$ } from "@/serviceStore/global/index";
import { useUnsubscribe } from "@/utils/hooks/useUnsubscribe";
import track from "@/utils/dataTracker";
import { Message } from "element-ui";
import E from "wangeditor";
import { uploadFile } from "@/api/common";
import { forEach } from "lodash";

const props = defineProps({
    type: {
        type: String,
        default: "plain",
    },
    data: {
        type: Object,
        default: () => ({}),
    },
});
const emits = defineEmits(["back-up", "update-attr"]);

const router = useRouter();
const formRef = ref(null);
const formData = ref({
    appKey: [],
    eventId: "",
    developer: "",
    tags: "",
    eventDesc: "",
    pictureUrl: [],
    eventType: "biz",

    versionList: [],
});

const addSubscription = useUnsubscribe();
const productCode = ref("");
const appKeyList = ref([]);
if (props.type === "plain") {
    const productCodeSub = productCode$.subscribe(val => {
        productCode.value = val;
        getAllOptions(val);
        formData.value.appKey = [];
    });
    addSubscription(productCodeSub);
    const appKeyOptionSub = appKeyOption$.subscribe(val => {
        appKeyList.value = val;
    });
    addSubscription(appKeyOptionSub);
}

watch(
    () => formData.value.eventType,
    val => {
        if (val === "perf") {
            const isExits = numAttributes.value.some(e => e.name === "value");
            if (!isExits) {
                const item = getNumDefaultItem();
                item.name = "value";
                numAttributes.value.push(item);
            }
        } else if (val === "biz") {
            numAttributes.value = numAttributes.value.filter(each => each.name !== "value");
        }
    }
);

const editAttrList = ref([]);
const editVisible = ref(false);
const editType = ref("");
const editTitle = ref("");
function editStrAttr() {
    editVisible.value = true;
    editType.value = "str";
    editTitle.value = "编辑字符串属性名";
    const list = strAttributes.value.map(each => {
        return {
            id: each.id,
            list: [
                {
                    label: "属性名",
                    value: each.name,
                },
                {
                    label: "属性名描述",
                    value: each.nameDesc,
                },
            ],
            edit: each.edit,
        };
    });
    if (list.length === 0) {
        list.push(getStrDefaultItem());
    }
    editAttrList.value = list;
}
function editStrDetail(id) {
    editDetailParentId = id;

    editVisible.value = true;
    editType.value = "str-detail";
    editTitle.value = "编辑字符串属性值";

    const found = strAttributes.value.find(each => each.id === editDetailParentId);
    if (found) {
        const list = (found.valueList || []).map(each => {
            idxDetail++;
            const id = idxDetail;
            return {
                id,
                list: [
                    {
                        label: "属性值",
                        value: each.value,
                    },
                    {
                        label: "属性值描述",
                        value: each.valueDesc,
                    },
                ],
                edit: each.edit,
            };
        });
        if (list.length === 0) {
            list.push(getStrDetailDefaultItem());
        }
        editAttrList.value = list;
    }
}
function editNumAttr() {
    editVisible.value = true;
    editType.value = "num";
    editTitle.value = "编辑数值属性名";

    const list = numAttributes.value.map(each => {
        idxNum++;
        const id = idxNum;
        return {
            id,
            ...each,
        };
    });
    if (list.length === 0) {
        list.push(getNumDefaultItem());
    }
    editAttrList.value = list;
}

watch(
    () => formData.value.appKey,
    val => {
        const keyList = val;
        const oldVersionList = formData.value.versionList.slice();
        const versionList = keyList
            .map(val => {
                return appKeyList.value.find(each => each.value === val);
            })
            .map(({ value, label }) => {
                const found = oldVersionList.find(old => old.value === value);
                return {
                    label,
                    value,
                    version: found ? found.version : "",
                };
            });
        formData.value.versionList = versionList;
    }
);

function resetForm() {
    formData.value = {
        appKey: [],
        eventId: "",
        developer: "",
        tags: "",
        versionList: [],
        pictureUrl: [],
        eventType: "biz",
    };
}
function updatePicUrl(url) {
    formData.value.pictureUrl.push(url);
}

function removePicUrl(idx) {
    formData.value.pictureUrl = formData.value.pictureUrl.filter((u, index) => index !== idx);
}

const formRules = {
    eventId: [
        {
            required: true,
            validator: (rule, value, callback) => {
                const reg = /^\w+$/;

                if (!value) {
                    callback(new Error("请输入eventId"));
                } else if (!reg.test(value)) {
                    callback(new Error("eventId只能由数字、字母、下划线组成"));
                } else {
                    callback();
                }
            },
            trigger: "blur",
        },
    ],
    appKey: [{ required: true, message: "请选择appKey", trigger: "blur" }],
};

const strAttributes = ref([]);
const numAttributes = ref([]);
let idxStr = 0;
let idxNum = 0;
let idxDetail = 0;
let editDetailParentId = null;

function getStrDefaultItem() {
    idxStr++;
    const id = idxStr;
    return {
        id,
        list: [
            {
                label: "属性名",
                value: "",
            },
            {
                label: "属性名描述",
                value: "",
            },
        ],
    };
}
function getStrDetailDefaultItem() {
    idxDetail++;
    const id = idxDetail;
    return {
        id,
        list: [
            {
                label: "属性值",
                value: "",
            },
            {
                label: "属性值描述",
                value: "",
            },
        ],
    };
}
function getNumDefaultItem() {
    idxNum++;
    const id = idxNum;
    return {
        id,
        name: "",
        nameDesc: "",
        min: -Infinity,
        max: Infinity,
        unit: "",
    };
}

const commonAttr = ref([]);
function getAllOptions(code) {
    if (code && code.length > 0) {
        getCommonAttr(code);
    }
}
function getCommonAttr(code) {
    getCommonAttributes(code).then(resp => {
        commonAttr.value = resp
            .filter(each => each.disabled === 0)
            .map(each => {
                return {
                    name: each.commonAttributeName,
                    mapField: each.attributeMappingName,
                    type: each.type,
                    operator: each.operator,
                    desc: each.description,
                };
            });
    });
}

const unitList = ref([]);
function getUnitList() {
    optionsApi.getAttrUnit().then(list => {
        unitList.value = list || [];
    });
}

const developerList = ref([]);
function getDeveloperList() {
    permissionApi.getEmailList().then(data => {
        const { status, data: dataObj } = data;
        if (status === 200) {
            const { code, data: dataList = [] } = dataObj;
            if (code === 0) {
                developerList.value = dataList.map(email => {
                    return {
                        label: email,
                        mail: email,
                    };
                });
            }
        }
    });
}

function addAttr() {
    const type = editType.value;

    switch (type) {
        case "str": {
            editAttrList.value.push(getStrDefaultItem());
            break;
        }
        case "str-detail": {
            editAttrList.value.push(getStrDetailDefaultItem());
            break;
        }
        case "num": {
            editAttrList.value.push(getNumDefaultItem());
            break;
        }
        default: {
            throw new Error("wrong edit type! check it");
        }
    }
}
function removeAttr(id) {
    editAttrList.value = editAttrList.value.filter(each => each.id !== id);
}
function updateTable() {
    const type = editType.value;
    switch (type) {
        case "str": {
            updateStrTable();
            editVisible.value = false;
            break;
        }
        case "str-detail": {
            updateStrDetailTable();
            editVisible.value = false;
            break;
        }
        case "num": {
            updateNumTable();

            break;
        }
        default: {
            throw new Error("wrong edit type! check it");
        }
    }
}

function updateNumTable() {
    const list = editAttrList.value
        .map(each => {
            const item = {
                ...each,
            };
            Reflect.deleteProperty(item, "id");
            return item;
        })
        .filter(each => each.name && each.name.length);
    for (const each of list) {
        const { min, max } = each;
        if (min > max) {
            Message({
                message: "最小值不能大于最大值",
                type: "error",
            });
            return;
        }
    }
    numAttributes.value = list;
    editVisible.value = false;
}

function updateStrTable() {
    const idSet = new Set(editAttrList.value.map(each => each.id));
    strAttributes.value = strAttributes.value.filter(each => idSet.has(each.id));
    for (const each of editAttrList.value) {
        const { id, list } = each;
        const [nameItem, descItem] = list;
        const name = nameItem.value;
        if (name && name.length > 0) {
            const found = strAttributes.value.find(el => el.id === id);
            if (found) {
                found.name = nameItem.value;
                found.nameDesc = descItem.value;
            } else {
                strAttributes.value.push({
                    id,
                    name: nameItem.value,
                    nameDesc: descItem.value,
                    valueList: [
                        {
                            value: "",
                            valueDesc: "",
                        },
                    ],
                });
            }
        }
    }
}

function updateStrDetailTable() {
    const list = editAttrList.value
        .filter(each => {
            const list = each.list;
            const [nameItem] = list;
            const name = nameItem.value;
            return name && name.length;
        })
        .map(each => {
            const list = each.list;
            const [nameItem, descItem] = list;
            return {
                value: nameItem.value,
                valueDesc: descItem.value,
            };
        });
    const found = strAttributes.value.find(each => each.id === editDetailParentId);
    if (found) {
        found.valueList = list;
    }
}

function submit() {
    postRequest()
        .then(() => {
            track("event_dig_management_insert", {
                action: "submit",
            });
            setTimeout(() => {
                router.push({
                    path: "/buried/search",
                });
            }, 500);
        })
        .catch(err => console.error(err));
}
function submitAndReset() {
    postRequest()
        .then(() => {
            track("event_dig_management_insert", {
                action: "submit_and_insert",
            });
            formData.value.eventId = "";
            formData.value.eventType = "biz";
            numAttributes.value = [];
            strAttributes.value = [];
            formData.value.eventDesc = "";
            formData.value.pictureUrl = [];
        })
        .catch(err => console.error(err));
}
function getSubmitBody() {
    const body = {
        appKeys: formData.value.appKey,
        productCode: productCode.value,
        eventId: formData.value.eventId,
        eventType: formData.value.eventType,
        tag: formData.value.tags,
        developer: formData.value.developer,
        versions: formData.value.versionList
            .filter(each => each.version && each.version.length)
            .reduce((acc, cur) => {
                const { value, version } = cur;
                acc[value] = version;
                return acc;
            }, {}),
    };
    let description = "";
    if (props.type === "plain") {
        if (formData.value.eventDesc) {
            description += `<p>${formData.value.eventDesc}</p>`;
        }
        if (formData.value.pictureUrl && formData.value.pictureUrl.length > 0) {
            if (description.length > 0) {
                description += "<br>";
            }
            const pictures = formData.value.pictureUrl;
            description += pictures
                .map(url => {
                    return `<p><img src=${url}/></p>`;
                })
                .join("<br>");
        }
    } else {
        description = editorRef.value.txt.html();
    }

    body.description = description;

    if (numAttributes.value.length > 0 || strAttributes.value.length > 0) {
        const numType = numAttributes.value.map(each => {
            const { max, min, name, nameDesc, unit } = each;
            const item = {
                type: "number",
                status: 0,
                attributeValue: null,
                attributeName: name,
                description: nameDesc,
                minValue: min,
                maxValue: max,
                unit,
            };
            if (item.minValue === -Infinity) {
                Reflect.deleteProperty(item, "minValue");
            }
            if (item.maxValue === Infinity) {
                Reflect.deleteProperty(item, "maxValue");
            }
            return item;
        });

        const strType = strAttributes.value.map(each => {
            const { name, nameDesc, valueList = [] } = each;
            const item = {
                type: "string",
                status: 0,
                attributeName: name,
                description: nameDesc,
                attributeValue: JSON.stringify(
                    valueList
                        .filter(el => el.value && el.value.length > 0)
                        .map(el => {
                            return {
                                value: el.value,
                                desc: el.valueDesc,
                            };
                        })
                ),
            };
            return item;
        });

        const attributes = numType.concat(strType);
        body.eventAttributeDTOList = attributes;
    }
    if (!body.eventAttributeDTOList) {
        body.eventAttributeDTOList = [];
    }

    return body;
}
function postRequest() {
    return new Promise((resolve, reject) => {
        formRef.value.validate(valid => {
            if (valid) {
                const body = getSubmitBody();
                api.create(body)
                    .then(({ data }) => {
                        if (data.code === 0) {
                            Message({
                                message: "提交成功",
                                type: "success",
                            });
                            resolve();
                        } else {
                            Message({
                                message: data.message,
                                type: "error",
                            });
                            reject(data.message);
                        }
                    })
                    .catch(err => {
                        reject(err);
                    });
            } else {
                reject("表单校验失败！");
            }
        });
    });
}

// 更新属性通过编辑、编辑同组
const updateAttr = () => {
    const body = getSubmitBody();
    emits("update-attr", body);
};

function init() {
    resetForm();

    getDeveloperList();
    getUnitList();

    getAllOptions(productCode);
}

const editorRef = ref(null);
const initEditor = () => {
    const editor = new E("#wang-editor");
    editor.height = 300;
    editor.config.menus = ["bold", "head", "link", "italic", "underline", "strikeThrough", "image"];
    editor.config.customUploadImg = function (resultFiles, insertImgFn) {
        uploadFile(resultFiles).then(resp => {
            forEach(resp, item => {
                if (item.url && item.url.length > 0) {
                    insertImgFn(item.url);
                }
            });
        });
    };
    editor.create();
    editorRef.value = editor;
};
const initStatus = () => {
    const {
        appKey,
        appKeyOption,
        eventId,
        developer,
        tag,
        version,
        eventType,
        numberAttrList,
        stringAttrList,
        status,
        productCode,
        description,
    } = props.data;
    formData.value = {
        appKey: appKey,
        eventId,
        developer,
        tags: tag,
        versionList: [],
        eventType,
    };
    appKeyList.value = appKeyOption;

    nextTick(() => {
        if (props.type === "edit-attr") {
            formData.value.versionList = [
                {
                    ...formData.value.versionList[0],
                    version,
                },
            ];
        } else if (props.type === "edit-group-attr") {
            formData.value.versionList = formData.value.versionList.map(each => {
                const { value } = each;
                each.version = version[value];
                return each;
            });
        }

        // 初始化字符串类型的属性
        const strList = [];
        stringAttrList.forEach(each => {
            const { attributeValue } = each;
            strList.push({
                id: idxStr++,
                edit: +status !== 1,
                name: each.attributeName,
                nameDesc: each.description,
                valueList: attributeValue.map(el => {
                    return {
                        value: el.value,
                        valueDesc: el.desc,
                        edit: +status !== 1,
                    };
                }),
            });
        });
        strAttributes.value = strList;

        // 初始化数字类型的属性
        const numList = [];
        numberAttrList.forEach(each => {
            const { description, attributeName, unit, minValue, maxValue } = each;
            numList.push({
                id: idxNum++,
                name: attributeName,
                nameDesc: description,
                min: minValue ?? -Infinity,
                max: maxValue ?? Infinity,
                unit,
                edit: +status !== 1,
            });
        });
        numAttributes.value = numList;

        // 设置富文本
        if (description && description.length > 0) {
            editorRef.value.txt.html(description);
        }

        // 获取公共属性
        getAllOptions(productCode);
    });
};

onMounted(() => {
    init();
    // initSummernote("#summernote");
    if (props.type !== "plain") {
        initEditor();
        initStatus();
    }
});
</script>

<style lang="scss" scoped>
.log {
    padding: 20px;

    .footer {
        .plain {
            display: flex;
            justify-content: center;
            column-gap: 70px;
            margin: 70px;
        }

        .edit {
            display: flex;
            align-items: center;
            justify-content: flex-end;
        }
    }

    .form {
        .common-attr {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            i {
                cursor: pointer;
                width: 16px;
            }
        }

        .type {
            .label {
                color: #606266;
                font-size: 14px;
            }

            .icon {
                font-size: 14px;
                &:hover {
                    cursor: pointer;
                }
            }
        }

        .row {
            display: flex;
            align-items: center;
            margin: 0;
            // ::v-deep(.el-form-item__content) {
            //     display: flex;
            //     align-items: center;
            // }

            .input-item {
                width: 217px;
            }
        }

        .group {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
        }
        // .select {
        //     width: 300px;
        // }
        // .input {
        //     width: 300px;
        // }

        .version {
            display: flex;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
            .item {
                display: flex;
                align-items: center;
                column-gap: 10px;
                .label {
                    color: #909399;
                    margin-right: 0;
                    margin-left: auto;
                    padding: 0;
                }

                .value {
                    width: 130px;
                    margin-left: auto;
                    margin-right: 0;
                }
            }
        }

        .attr {
            .edit {
                transform: scale(0.8);
                margin-left: 20px;
            }

            .header {
                margin-bottom: 0;
                margin-top: 0;
                .title {
                    font-weight: bold;
                }
            }
            .str {
            }

            .num {
                margin-top: 30px;
            }
        }
    }
}
</style>

<style lang="scss">
.enter-log-dialog-footer {
    margin-top: 50px;
    margin-left: auto;
    margin-right: 50px;
    display: flex;
    align-items: center;
    column-gap: 30px;
    justify-content: center;
}
</style>
