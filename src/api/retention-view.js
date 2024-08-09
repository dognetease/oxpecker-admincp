import request from "@/utils/request";

async function query(data) {
    let options = (
        await request({
            url: "/api/admin/analysis/retention",
            method: "POST",
            headType: "JSON",
            data
        }).catch(() => {
            return {
                data: {
                    data: {
                        title: "",
                        data: {}
                    }
                }
            };
        })
    ).data.data;
    return options;
}

export default { query };
