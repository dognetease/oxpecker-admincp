<template>
    <div class="self">
        <h3 class="header">欢迎使用我们的SQL查询平台。为了更好地使用该平台，请注意以下事项：</h3>
        <div class="database">
            <div class="title">
                数据库连接信息：数据查询平台使用的是Tabix，平台需要自己输入账号信息登录，请使用下面信息
            </div>
            <el-descriptions border size="mini" class="desc">
                <el-descriptions-item label="账号">tabix_read_user</el-descriptions-item>
                <el-descriptions-item label="密码">Gxxxtcpzeo</el-descriptions-item>
                <el-descriptions-item label="地址">http://10.196.176.52:8849</el-descriptions-item>
            </el-descriptions>
        </div>
        <div class="search">
            <div class="title">查询信息：数据查询使用的是ClickHouse数据库，查询语法兼容标准SQL语法。</div>
            <div class="title danger">
                注意！！！查询where条件中必须包含索引，即分区字段、主键字段！！！否则查询可能超时失败并拖慢整个线上数据库
            </div>
            <el-descriptions border size="mini" class="desc">
                <el-descriptions-item label="埋点数据表名">oxpecker_track_event</el-descriptions-item>
                <el-descriptions-item label="分区字段">day</el-descriptions-item>
                <el-descriptions-item label="主键字段">eventId</el-descriptions-item>
            </el-descriptions>
        </div>

        <div class="example">
            <div class="title">示例查询语句：</div>
            <pre class="desc">
SELECT day, COUNT()
FROM oxpecker_track_event
WHERE day >= today() - 7
    AND day <= yesterday()
    AND eventId = 'pc_dailyActiveUser'
GROUP BY day
</pre
            >
        </div>
        <div class="help">
            <div class="title">帮助信息：</div>
            <el-descriptions border size="mini" class="desc">
                <el-descriptions-item label="ClickHouse官方文档" target="_blank">
                    <a href="https://clickhouse.com/docs/en/intro" target="_blank"
                        >https://clickhouse.com/docs/en/intro</a
                    >
                </el-descriptions-item>
                <el-descriptions-item label="Tabix帮助文档" target="_blank">
                    <a href="https://tabix.io/doc/Tips/" target="_blank">https://tabix.io/doc/Tips/</a>
                </el-descriptions-item>
            </el-descriptions>
        </div>
        <div class="op">
            <el-button :disabled="!canVisit" class="tabix-btn" type="primary" @click="visitTabix">{{
                canVisit ? text : text + " s"
            }}</el-button>
        </div>
    </div>
</template>

<script setup>
import useVisitPage from "@/utils/hooks/useIsVisitPage.js";
import { ref, onMounted, onUnmounted, computed } from "vue";

const pageName = "self-analysis";
const isVisit = useVisitPage(pageName, 10 * 1000);
const text = ref(isVisit ? "前往" : 10);
let timeoutId = -1;

const countDown = () => {
    const setTimeoutCb = () => {
        const count = text.value;
        if (count > 1) {
            text.value = count - 1;
            timeoutId = setTimeout(setTimeoutCb, 1000);
        } else {
            text.value = "前往";
        }
    };
    timeoutId = setTimeout(setTimeoutCb, 1000);
};

const canVisit = computed(() => {
    return text.value === "前往";
});

onMounted(() => {
    if (!isVisit) {
        countDown();
    }
});

onUnmounted(() => {
    if (timeoutId !== -1) {
        window.clearTimeout(timeoutId);
    }
});

const visitTabix = () => {
    window.open("http://infra-tabix.lx-i.netease.com/", "_blank");
};
</script>

<style lang="scss" scoped>
.self {
    padding: 20px 20% 0 20%;
    .header {
    }

    .database,
    .search,
    .help,
    .example {
        margin-top: 30px;
        .title {
            font-weight: bold;
        }
    }

    .search {
        .danger {
            color: red;
            font-size: 18px;
            margin-top: 8px;
        }
    }

    .desc {
        margin-top: 10px;
        width: 60%;
    }

    .help {
        a {
            color: #409eff;
        }

        a:hover {
            text-decoration: underline;
        }
    }

    .op {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 30px;
        .tabix-btn {
            width: 100px;
            position: absolute;
        }
    }
}
</style>
