import { fetchRequest } from "@/api/http.js";
import _ from "lodash";

export const getData = body => {
    return fetchRequest
        .post({
            body,
            url: "/api/admin/analysis/proportion",
        })
        .then(data => {
            const displays = data.displays;
            const [first, last] = displays;
            const { numeratorEventName, denominatorEventName } = data;
            data.displays = [
                {
                    nameString: `${numeratorEventName}的${first.nameString} / ${denominatorEventName}的${last.nameString}`,
                },
            ];
            return data;
        });
};
