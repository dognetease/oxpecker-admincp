export function useIncrementId(init = 0) {
    let id = init;

    return {
        getId() {
            id++;
            return id;
        },
    };
}
