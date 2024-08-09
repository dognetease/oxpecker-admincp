import { ref, watch, onMounted, onUnmounted } from "vue";

export default function useChart(plotCtorName, option, events = []) {
    const plot = ref(null);
    const plotElmRef = ref(null);

    onUnmounted(() => {
        if (plot.value) {
            plot.value.off();
            plot.value.destroy();
        }
    });

    onMounted(async () => {
        if (plotElmRef.value) {
            const ctor = (await import("@antv/g2plot"))[plotCtorName];
            plot.value = new ctor(plotElmRef.value, option);
            if (option.data && option.data.length > 0) {
                plot.value.render();
            }
            for (const each of events) {
                const { name, listener } = each;
                plot.value.on(name, listener);
            }
        } else {
            console.error("please set DOM refs!");
        }
    });

    const render = conf => {
        if (plot && plot.value) {
            plot.value.update(conf);
            plot.value.render();
        }
    };

    return {
        plot,
        plotElmRef,
        render,
    };
}
