<template>
    <el-container class="debug">
        <!-- 功能操作区域 -->
        <el-header v-if="!scanning && !showTable" class="el-header-change">
            <el-form v-if="!showPrev" :inline="true" ref="form">
                <el-form-item :label="metadata.appKey.label">
                    <el-select
                        @change="handleSelected"
                        v-model="selectedApplication"
                        clearable
                        placeholder="请选择应用"
                    >
                        <el-option
                            v-for="(option, index) in metadata.appKey.options"
                            :key="option.label + index"
                            :label="option.label"
                            :value="option.value"
                        ></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div class="qrcode-box" v-show="token">
                <div id="qrcode-box-canvas" ref="qrcode" v-show="tokenType === 'ios' || tokenType === 'android'"></div>
                <div v-show="tokenType === 'mac' || tokenType === 'win'" class="token-str">
                    <div class="desktop" v-if="isLXOrWMDesktop">
                        复制<span class="token">*#logToken:{{ token }}*#</span>到邮件搜索框中回车，成功后会有设置token
                        成功的弹窗
                    </div>
                    <div v-else>{{ token }}</div>
                </div>
                <div v-show="tokenType === 'web'" class="token-link">
                    <div>输入需要实时调试的网站的域名然后点击link跳转</div>
                    <el-autocomplete
                        v-model="debugLink"
                        class="input"
                        :trigger-on-focus="false"
                        :fetch-suggestions="matchSuggestion"
                    >
                    </el-autocomplete>
                    <el-link
                        @click.native="checkLink"
                        type="primary"
                        target="_blank"
                        :href="debugWebLink"
                        v-if="debugLink"
                        >{{ debugWebLink }}</el-link
                    >
                </div>
            </div>
            <div>
                <el-button class="qrcode-box-btn" v-if="showNext" @click="showToken" type="primary">下一步</el-button>
                <el-button class="qrcode-box-btn" v-if="showPrev" @click="goPrePage" type="primary">上一步</el-button>
            </div>
        </el-header>
        <div v-if="scanning || showTable" class="debug-quit">
            <el-button @click="stopDebug" type="primary">退出调试</el-button>
        </div>
        <div class="debug-scan" v-if="scanning">正在扫描...</div>
        <!-- 数据表格区域 -->
        <el-main v-if="showTable">
            <el-tabs v-model="showContent" type="card" @tab-click="handleChange">
                <el-tab-pane label="埋点验证" name="verification"></el-tab-pane>
                <el-tab-pane label="实时调试" name="debug"></el-tab-pane>
            </el-tabs>

            <!-- 埋点验证 -->
            <div class="buried-verification" v-if="showContent === 'verification'">
                <!-- 功能操作区域 -->
                <el-form :inline="true" ref="form">
                    <div>
                        <el-form-item :label="metadata.eventId.label" class="query-buried-search-eventid">
                            <el-input v-model="searchData.eventId" clearable placeholder="请输入eventId"></el-input>
                        </el-form-item>
                        <el-form-item :label="metadata.version.label" class="query-buried-search-version">
                            <el-input v-model="searchData.version" clearable placeholder="请输入版本号"></el-input>
                        </el-form-item>
                        <el-form-item :label="metadata.tag.label" class="query-buried-search-tag">
                            <el-input v-model="searchData.tag" clearable placeholder="请输入标签"></el-input>
                        </el-form-item>
                        <el-form-item :label="metadata.developer.label" class="query-buried-search-developer">
                            <el-input v-model="searchData.developer" clearable placeholder="请输入开发者"></el-input>
                        </el-form-item>
                        <el-form-item :label="metadata.operator.label" class="query-buried-search-operator">
                            <el-input v-model="searchData.operator" clearable placeholder="请输入提交者"></el-input>
                        </el-form-item>
                        <el-button v-if="debugStatus === 'report'" @click="handDebugStatus('report')" type="primary"
                            >开始上报</el-button
                        >
                        <el-button v-if="debugStatus === 'verify'" @click="handDebugStatus('verify')" type="primary"
                            >开始验证</el-button
                        >
                    </div>
                </el-form>

                <!-- 数据表格区域 -->
                <el-table
                    max-height="666"
                    :data="tableData.verificationData"
                    stripe
                    border
                    style="width: 100%"
                    :header-cell-style="{ 'text-align': 'center' }"
                    key="verification"
                >
                    <el-table-column
                        label="埋点应用"
                        prop="appKey"
                        :formatter="parseAppKey"
                        align="center"
                    ></el-table-column>
                    <el-table-column label="事件ID" prop="eventId" align="center">
                        <template slot-scope="scope">
                            <el-popover placement="top-end" width="100%" trigger="click">
                                <el-table :data="viewData.data" stripe border style="width: 100%">
                                    <el-table-column label="名称" prop="label" align="center"></el-table-column>
                                    <el-table-column label="字段" prop="column" align="center"></el-table-column>
                                    <el-table-column label="值" prop="value" align="center">
                                        <template slot-scope="scope">{{
                                            scope.row.formatter
                                                ? scope.row.formatter(
                                                      scope.row,
                                                      scope.column,
                                                      scope.row.value,
                                                      scope.$index
                                                  )
                                                : scope.row.value
                                        }}</template>
                                    </el-table-column>
                                </el-table>

                                <el-table
                                    class="query-buried-attr-string"
                                    :data="attrString"
                                    :span-method="objectSpanMethod"
                                    stripe
                                    border
                                    style="width: 100%"
                                >
                                    <el-table-column
                                        label="属性名称"
                                        prop="attributeName"
                                        align="center"
                                    ></el-table-column>
                                    <el-table-column label="属性类型" prop="type" align="center">
                                        <template slot-scope="scope">
                                            <span v-if="scope.row.type === 'string'">字符</span>
                                            <span v-else-if="scope.row.type === 'number'">数值</span>
                                            <span v-else>未知</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                        label="属性描述"
                                        prop="description"
                                        align="center"
                                    ></el-table-column>
                                    <el-table-column label="属性值" prop="value" align="center"></el-table-column>
                                    <el-table-column label="属性值描述" prop="desc" align="center"></el-table-column>
                                </el-table>
                                <el-table
                                    class="query-buried-attr-num"
                                    :data="attrNumber"
                                    stripe
                                    border
                                    style="width: 100%"
                                >
                                    <el-table-column
                                        label="属性名称"
                                        prop="attributeName"
                                        align="center"
                                    ></el-table-column>
                                    <el-table-column label="属性类型" align="center">
                                        <template slot-scope="scope">
                                            <span v-if="scope.row.type === 'string'">字符</span>
                                            <span v-else-if="scope.row.type === 'number'">数值</span>
                                            <span v-else>未知</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                        label="属性描述"
                                        prop="description"
                                        align="center"
                                    ></el-table-column>
                                    <el-table-column label="最小值" prop="minValue" align="center"></el-table-column>
                                    <el-table-column label="最大值" prop="maxValue" align="center"></el-table-column>
                                    <el-table-column label="单位" prop="unit" align="center">
                                        <template slot-scope="scope">
                                            <span v-html="getUnitLabel(scope.row.unit)"></span>
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <el-button slot="reference" @click="openViewDialog(scope.row)">{{
                                    scope.row.eventId
                                }}</el-button>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column label="基础参数">
                        <template slot-scope="scope">
                            <json-viewer
                                :value="scope.row.commonParams"
                                :expand-depth="5"
                                copyable
                                boxed
                                sort
                            ></json-viewer>
                        </template>
                    </el-table-column>
                    <el-table-column label="自定义属性">
                        <template slot-scope="scope">
                            <json-viewer
                                :value="scope.row.commonEvent"
                                :expand-depth="5"
                                copyable
                                boxed
                                sort
                            ></json-viewer>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="240">
                        <template v-slot="scope">
                            <el-button
                                v-if="scope.row.status === 0"
                                @click="handlePublish(scope.row)"
                                type="primary"
                                size="mini"
                                >发布</el-button
                            >
                            <el-button v-if="scope.row.status === 1" type="info" size="mini" disabled>已发布</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 实时调试 -->
            <div class="live-debug" v-if="showContent === 'debug'">
                <div>
                    <el-form :inline="true" ref="form">
                        <el-form-item :label="metadata.type.label">
                            <el-select v-model="searchData.type" clearable placeholder="请选择事件名">
                                <el-option
                                    v-for="(option, index) in metadata.type.options"
                                    :key="option.label + index"
                                    :label="option.label"
                                    :value="option.value"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-input v-model="searchData.value" clearable></el-input>
                        </el-form-item>
                        <el-button @click="handleSearch(tableData.originalData)" type="primary">搜索</el-button>
                    </el-form>
                </div>

                <div class="debug-num">当前结果 ({{ tableData.data.length }}个)</div>
                <el-table
                    max-height="666"
                    :data="tableData.data"
                    stripe
                    border
                    style="width: 100%"
                    :header-cell-style="{ 'text-align': 'center' }"
                    key="debug"
                >
                    <el-table-column label="事件ID" prop="eventId" align="center"></el-table-column>
                    <el-table-column label="基础参数" prop="commonParams">
                        <template slot-scope="scope">
                            <json-viewer
                                :value="scope.row.commonParams"
                                :expand-depth="5"
                                copyable
                                boxed
                                sort
                            ></json-viewer>
                        </template>
                    </el-table-column>
                    <el-table-column label="自定义属性" prop="commonEvent">
                        <template slot-scope="scope">
                            <json-viewer
                                :value="scope.row.commonEvent"
                                :expand-depth="5"
                                copyable
                                boxed
                                sort
                            ></json-viewer>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-main>
    </el-container>
</template>

<script>
import api from "@/api/debug";
import eventApi from "@/api/query-buried";
import optionsApi from "@/api/options";
import { sign } from "@/utils";
import { reconnect, disconnect } from "@/utils/websocket";
import QRCode from "qrcodejs2";
import config from "./config";
import app from "@/api/app";
import { mapGetters } from "vuex";

const LOCAL_SUGGESTION_KEY = "__oxpecker_suggestions";

export default {
    name: "debug",
    async mounted() {
        this.reloadAppKeys();

        this.getLocalSuggestions();
    },
    destroyed() {
        disconnect();
    },
    data() {
        return {
            searchData: {},
            tableData: {
                // 实时调试
                data: [],
                originalData: [],
                // 埋点验证
                verificationData: [],
                verificationOriginalData: []
            },
            selectedApplication: "",
            metadata: {
                ...config
            },
            // 扫码成功正常推送数据状态，表格显隐
            showTable: false,
            // 表格内容：verification-埋点验证，debug-实时调试
            showContent: "debug",
            // 验证状态：report-上报，verify-验证
            debugStatus: "report",
            // 下一步按钮显隐
            showNext: true,
            // 上一步按钮显隐
            showPrev: false,
            // 扫描中状态
            scanning: false,
            // token
            token: "",
            tokenType: "",
            debugLink: "",
            linkSuggestions: [],

            link: `${process.env.VUE_APP_DEBUG_WEB_HOST}/start-debug.html`,
            viewData: { data: [], attr: [] }
        };
    },
    computed: {
        ...mapGetters(["globalState"]),
        productCode() {
            return this.globalState.productId;
        },
        attrString() {
            return this.viewData.attr
                .filter((item) => item.type === "string")
                .reduce((accumulator, item) => {
                    const attributeValue = JSON.parse(JSON.stringify(item.attributeValue));
                    const itemToSpanRows = attributeValue.map((attributeItem) => ({
                        ...item,
                        value: attributeItem.value,
                        desc: attributeItem.desc
                    }));
                    if (itemToSpanRows.length) {
                        itemToSpanRows[0].isSpanStart = true;
                        itemToSpanRows[0].spanRowsCount = itemToSpanRows.length;
                    }

                    return [...accumulator, ...itemToSpanRows];
                }, []);
        },
        attrNumber() {
            return this.viewData.attr.filter((item) => item.type === "number");
        },
        debugWebLink() {
            if (this.debugLink.length > 0) {
                const url = `${this.debugLink}?oxpecker_js_token=${this.token}`.trim();
                return encodeURI(url);
            }
            return "";
        },
        // 灵犀或者外贸的桌面端
        isLXOrWMDesktop() {
            return this.productCode === "c704379c" || this.productCode === "97a1222d";
        }
    },
    watch: {
        productCode(productCode, oldProductCode) {
            if (productCode && productCode.length && productCode !== oldProductCode) {
                this.initSelectPage();
                this.reloadAppKeys();
            }
        }
    },
    methods: {
        initSelectPage() {
            this.token = "";
            this.tokenType = "";
            this.showTable = false;
            this.scanning = false;
            this.showNext = true;
            this.showPrev = false;
        },
        async reloadAppKeys() {
            if (!this.productCode) return;
            const appKeyOptions = await optionsApi.getAppKeyOptions({ productCode: this.productCode });
            this.metadata.appKey = {
                ...this.metadata.appKey,
                options: appKeyOptions.filter((each) => {
                    return each && each.type !== "server";
                }),
                formatter: function (row, col, value, index) {
                    return appKeyOptions.filter((option) => {
                        const { value: optionValue } = option;
                        return optionValue === value;
                    })[0].label;
                }
            };
            // 默认选择第一项appKey
            this.selectedApplication = this.metadata.appKey.options[0].value;
        },
        handlewsMessage(data) {
            const res = JSON.parse(data.body);
            // 表示扫码成功,展示正在扫描
            if (res.type === "SCANF") {
                this.scanning = true;
            } else if (res.type === "debug") {
                // 隐藏正在扫描
                this.scanning = false;
                // 正常调试状态传输数据
                this.showTable = true;

                // 处理数据
                this.handData(res);
            } else if (res.type === "verification") {
                // 隐藏正在扫描
                this.scanning = false;
                // 正常调试状态传输数据
                this.showTable = true;

                // 处理数据
                this.handData(res);
            }
        },
        handData(data) {
            switch (this.showContent) {
                case "verification":
                    // 埋点验证
                    data.message.forEach((message) => {
                        const json = JSON.parse(message);

                        this.tableData.verificationOriginalData = this.tableData.verificationOriginalData.filter(
                            (item) => {
                                if (
                                    !(
                                        item.productCode === json.productCode &&
                                        item.appKey === json.appKey &&
                                        item.eventId === json.eventId &&
                                        item.commonParams.length === 0
                                    )
                                ) {
                                    return true;
                                }
                            }
                        );

                        this.tableData.verificationOriginalData.unshift({
                            eventId: json.eventId,
                            productCode: json.productCode,
                            appKey: json.appKey,
                            commonParams: json.commonParams,
                            commonEvent: json.commonEvent,
                            // 0-未发布，1-已发布
                            status: 0
                        });
                    });

                    this.tableData.verificationData = this.tableData.verificationOriginalData;
                    break;
                case "debug":
                    // 实时调试
                    this.tableData.originalData.unshift({
                        eventId: data.message.eventId,
                        commonParams: data.message.commonParams,
                        commonEvent: data.message.commonEvent
                    });
                    this.handleSearch(this.tableData.originalData);
                    break;
                default:
                    alert("错误类型");
            }
        },
        handleSearch(originalData) {
            if (this.searchData.type && this.searchData.value) {
                this.tableData.data = originalData.filter((item) => item.eventId === this.searchData.value);
            } else {
                this.tableData.data = originalData;
            }
        },
        goPrePage() {
            if (this.tokenType === "ios" || this.tokenType === "android") {
                this.$refs.qrcode.innerHTML = "";
            }
            disconnect();
            this.initSelectPage();
        },
        /**
         * @description 生成二维码
         * @param  {number} qWidth  宽度
         * @param  {number} qHeight  高度
         * @param  {string} qText  二维码内容（跳转连接）
         * @param  {string} qRender 渲染方式（有两种方式 table和canvas，默认是canvas）
         */
        qrcode(qWidth, qHeight, qText, qRender) {
            new QRCode("qrcode-box-canvas", {
                width: qWidth,
                height: qHeight,
                text: qText,
                render: qRender
            });
        },

        // 轮询检查token是否过期
        checkToken(token) {
            api.checkToken(token).then((response) => {
                const code = response.data.code;
                const data = response.data.data;
                if (code === 0 && data) {
                    setTimeout(() => {
                        this.checkToken(token);
                    }, 60 * 1000);
                } else {
                    // 重置页面，进行重新连接
                    this.reconnectDebug();
                }
            });
        },
        handleSelected(val) {
            if (!val) {
                return;
            }
        },

        showToken() {
            const selectedApp = this.selectedApplication;
            const options = this.metadata.appKey.options.slice();
            const found = options.find((each) => {
                return each && each.value === selectedApp;
            });
            const type = found.type || "";
            this.tokenType = type;
            this.$track("debug_click_next");
            switch (type) {
                case "ios":
                case "android": {
                    this.showQRcode();
                    return;
                }
                // 目前一致，后续可方便修改
                case "mac":
                case "win": {
                    this.getTokenStr();
                    return;
                }
                case "web": {
                    this.getTokenStr();
                    return;
                }

                default: {
                    throw new Error("unknown appKey in token debug");
                }
            }
        },

        matchSuggestion(query, cb) {
            if (query.length === 0) {
                return;
            }
            const suggestions = this.linkSuggestions.slice();
            const matched = suggestions
                .filter((each) => {
                    return each && each.includes(query);
                })
                .map((str) => {
                    return {
                        value: str
                    };
                });
            cb(matched);
        },

        checkLink() {
            if (!this.linkSuggestions.includes(this.debugLink.trim())) {
                this.linkSuggestions.push(this.debugLink);
                window.localStorage.setItem(LOCAL_SUGGESTION_KEY, JSON.stringify(this.linkSuggestions));
            }
        },

        getLocalSuggestions() {
            const local = window.localStorage.getItem(LOCAL_SUGGESTION_KEY);
            if (local) {
                const suggestions = JSON.parse(local);
                if (Array.isArray(suggestions)) {
                    this.linkSuggestions = suggestions;
                }
            }
        },

        getTokenStr() {
            api.getToken(this.selectedApplication).then((resp) => {
                const token = resp.data;
                this.token = token;
                this.showNext = false;
                this.showPrev = true;
                this.checkToken(token);
                // 建立ws连接
                reconnect(`${process.env.VUE_APP_DEBUG_HOST}/websocket?token=${token}`, this.handlewsMessage);
            });
        },
        /**
         * @description 点击显示二维码
         *
         */
        showQRcode() {
            api.getToken(this.selectedApplication).then((response) => {
                const token = response.data;
                this.token = token;
                // 轮询检查token是否过期;
                this.checkToken(token);

                // 建立ws连接
                reconnect(`${process.env.VUE_APP_DEBUG_HOST}/websocket?token=${token}`, this.handlewsMessage);
                this.$refs.qrcode.innerHTML = "";
                this.showNext = false;
                this.showPrev = true;
                this.$nextTick(function () {
                    const type = this.metadata.appKey.options.filter(
                        (item) => item.value === this.selectedApplication
                    )[0].type;
                    this.qrcode(
                        124,
                        124,
                        this.link + `?token=${token}&_r=${sign()}&appKey=${this.selectedApplication}&type=${type}`,
                        "canvas"
                    );
                });
            });
        },
        stopDebug() {
            this.$confirm("确定退出调试吗?", "提示", {
                confirmButtonText: "确定",
                type: "warning",
                center: true
            }).then(() => {
                this.handlewsError();
                this.$message({
                    type: "success",
                    message: "停止调试成功!"
                });
            });
        },
        reconnectDebug() {
            this.$confirm("连接失败", "提示", {
                confirmButtonText: "重新连接",
                showClose: false,
                type: "warning",
                showCancelButton: false,
                center: true,
                closeOnClickModal: false,
                customClass: "reconnect-debug"
            }).then(() => {
                this.handlewsError();
            });
        },
        handleChange() {
            switch (this.showContent) {
                case "verification":
                    // 埋点验证
                    api.swapDebug(0, this.token);
                    break;
                case "debug":
                    // 实时调试
                    api.swapDebug(1, this.token);
                    break;
                default:
                    alert("错误类型");
            }
        },
        handDebugStatus(status) {
            switch (status) {
                case "report":
                    // 开始上报
                    this.startDebugTrackEvent();
                    this.debugStatus = "verify";
                    break;
                case "verify":
                    // 开始验证
                    this.startDebugValidate();
                    this.debugStatus = "report";
                    break;
                default:
                    alert("错误类型");
            }
        },
        // 开始上报
        async startDebugTrackEvent() {
            // 清空上次验证信息
            this.tableData.verificationData = [];
            this.tableData.verificationOriginalData = [];

            const { eventId, version, tag, developer, operator } = this.searchData;
            const data = await api.startDebugTrackEvent(this.token, eventId, version, tag, developer, operator);

            data.data.data.forEach((message) => {
                // 添加埋点数据
                this.tableData.verificationOriginalData.unshift({
                    eventId: message.eventId,
                    productCode: message.productCode,
                    appKey: message.appKey,
                    commonParams: "",
                    commonEvent: "",
                    // 0-未发布，1-已发布
                    status: 0
                });
            });
            this.tableData.verificationData = this.tableData.verificationOriginalData;
        },
        // 开始验证
        startDebugValidate() {
            api.startDebugValidate(this.token);
        },
        // 发布
        handlePublish(data) {
            const { productCode, appKey, eventId, commonParams, commonEvent } = data;
            if (commonParams.length === 0 || commonEvent.length === 0) {
                this.$notify({ title: "发布失败", type: "error" });
                return;
            }

            eventApi.publishEventId({ appKey, productCode, eventId }).then(() => {
                this.$notify({ title: "发布成功", type: "success" });

                // 更新相同eventId status
                this.tableData.verificationData.forEach((item) => {
                    if (item.appKey === appKey && item.eventId === eventId && item.status === 0) {
                        item.status = 1;
                    }
                });
            });
        },
        parseAppKey(row) {
            const temp = this.metadata.appKey.options.find((option) => option.value === row.appKey);
            return temp ? temp.label : null;
        },
        // 查看
        async openViewDialog(data) {
            this.handleUnitFocus();
            this.viewData.data = [];
            this.viewData.attr = [];

            // 查询埋点信息
            const { productCode, appKey, eventId } = data;
            const res = await eventApi.getEventInfo({ productCode, appKey, eventId });
            this.viewData.attr = res.eventAttributeDTOList;
            Reflect.deleteProperty(res, "eventAttributeDTOList");

            for (var col in res) {
                if (this.metadata[col]) {
                    var row = {};
                    row.label = this.metadata[col].label;
                    row.column = col;
                    row.value = res[col];
                    if (this.metadata[col].formatter) {
                        row.formatter = this.metadata[col].formatter;
                    }
                    this.viewData.data.push(row);
                }
            }
        },
        async handleUnitFocus() {
            const unitOptions = await optionsApi.getAttrUnit();
            this.metadata.eventAttributeDTOList = {
                ...this.metadata.eventAttributeDTOList,
                unitOptions
            };
        },
        getUnitLabel(data) {
            if (data) {
                const unit = this.metadata.eventAttributeDTOList.unitOptions.filter((item) => item.value === data);
                if (unit && unit.length > 0) {
                    return unit[0].label;
                }
            }
        },
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 0 || columnIndex === 1 || columnIndex === 2) {
                if (row.isSpanStart && row.spanRowsCount) {
                    return {
                        rowspan: row.spanRowsCount,
                        colspan: 1
                    };
                } else {
                    return {
                        rowspan: 0,
                        colspan: 0
                    };
                }
            }
        }
    }
};
</script>
<style lang="scss">
.debug {
    display: block;
    padding: 30px;

    .token {
        &-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            row-gap: 20px;
            .input {
                width: 650px;
            }
        }
    }

    .token-str {
        .desktop {
            .token {
                color: #66b1ff;
            }
        }
    }

    &-quit {
        display: flex;
        justify-content: flex-end;
    }

    &-num {
        color: #626262;
        margin-bottom: 5px;
    }

    &-scan {
        margin-top: 100px;
        text-align: center;
        font-size: 24px;
        color: #999999;
    }

    .el-header-change {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .qrcode-box {
        display: flex;
        margin: 40px 0;
        position: relative;
    }
}

.reconnect-debug {
    margin-top: -400px;
}

.el-popover {
    height: 500px;
    overflow: auto;
}
</style>
