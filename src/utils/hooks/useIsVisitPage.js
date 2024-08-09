import { computed, onMounted, isRef, onUnmounted } from "vue";
export default function (pageKey, stayDuration = 0) {
    const localKey = computed(() => {
        const key = isRef(pageKey) ? pageKey.value : pageKey;
        return key + "_is_visit";
    });
    let timeoutId = -1;

    onMounted(() => {
        const key = localKey.value;
        timeoutId = setTimeout(() => {
            window.localStorage.setItem(key, "true");
        }, stayDuration);
    });

    onUnmounted(() => {
        if (timeoutId !== -1) {
            window.clearTimeout(timeoutId);
        }
    });

    const isVisit = JSON.parse(window.localStorage.getItem(localKey.value));
    if (isVisit === null) {
        return false;
    }
    return isVisit;
}
