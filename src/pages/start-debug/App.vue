<template>
    <div id="app">
        <div class="container">
            <div class="open-btn" @click="openApp">打开APP</div>
        </div>
    </div>
</template>

<script>
import startDebugApi from "@/api/start-debug";
import { getParameterByName } from "@/utils";

export default {
    name: "start-debug",
    async created() {
        const appKey = getParameterByName("appKey");
        const token = getParameterByName("token");
        const _r = getParameterByName("_r");
        await startDebugApi.informScanQrCode({
            appKey,
            token,
            _r
        });
    },
    methods: {
        openApp() {
            const type = getParameterByName("type");
            const appKey = getParameterByName("appKey");
            const token = getParameterByName("token");

            let url = "";
            switch (type) {
                case "ios":
                    url = `oxpecker.${appKey}://oxpecker?token=${token}`;
                    break;
                case "android":
                    url = `oxpecker://${appKey}?token=${token}`;
                    break;
                default:
                    break;
            }

            window.location.href = url;
        }
    }
};
</script>

<style lang="scss">
.container {
    display: flex;
    padding-top: 2rem;

    .open-btn {
        background: #409eff;
        border-radius: 0.08rem;
        padding: 0.1rem;
        font-size: 0.4rem;
        margin-top: 1rem;
        margin: 0 auto;
        color: #fff;
    }
}
</style>
