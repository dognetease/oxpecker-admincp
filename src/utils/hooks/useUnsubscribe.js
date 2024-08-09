import { onBeforeUnmount } from "vue";
export function useUnsubscribe() {
    const subs = [];
    onBeforeUnmount(() => {
        if (subs.length) {
            subs.forEach(sub => {
                if (sub && sub.unsubscribe) {
                    sub.unsubscribe();
                }
            });
        }
    });
    return (...sub) => {
        subs.push(...sub);
    };
}

export const useAutoUnSub = () => {
    const subs = [];
    onBeforeUnmount(() => {
        subs.forEach(s => s.unsubscribe && s.unsubscribe());
    });
    return {
        autoUnSubscribe: (ob, fn) => {
            ob && fn && subs.push(ob.subscribe(fn));
        },
    };
};
