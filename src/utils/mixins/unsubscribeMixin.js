const unSubscribeStream = {
    data() {
        return {
            rxjsSubscriptions: [],
        };
    },
    beforeDestroy() {
        if (this.rxjsSubscriptions.length > 0) {
            this.rxjsSubscriptions.forEach(sub => {
                if (sub && sub.unsubscribe) {
                    sub.unsubscribe();
                }
            });
        }
    },
    methods: {
        pushSubscription(...sub) {
            this.rxjsSubscriptions = this.rxjsSubscriptions.concat(sub);
        },
    },
};

export { unSubscribeStream };
