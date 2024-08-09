import { nextTick, ref, onMounted } from "vue";

export function useScroll() {
    const scrollElem = ref(null);

    onMounted(() => {
        scrollElem.value = document.querySelector("#app .app-wrapper");
    });

    return {
        scrollToPosition(position) {
            nextTick(() => {
                scrollElem.value.scrollTo({
                    top: position,
                });
            });
        },
        getScrollPosition() {
            return scrollElem.value.scrollTop;
        }
    }

}
