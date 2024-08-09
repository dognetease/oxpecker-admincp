export default {
    // props: {
    //     option: {
    //         type: Object,
    //         require: true
    //     }
    // },
    data() {
        return {
            plot: null,
        };
    },
    watch: {
        option: {
            deep: true,
            handler(val) {
                if (this.plot && Object.keys(val).length > 0) {
                    this.plot.update({
                        ...val,
                    });
                }
            },
        },
    },
    beforeDestroy() {
        if (this.plot) {
            this.plot.destroy();
        }
    },
    methods: {
        initPlot(classConstructor) {
            this.plot = new classConstructor(this.$el, this.option);
            this.plot.render();
        },
    },
};
