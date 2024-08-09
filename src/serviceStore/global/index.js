import {
    of,
    from,
    ReplaySubject,
    map,
    combineLatest,
    debounceTime,
    defer,
    tap,
    switchMap,
    withLatestFrom,
    Subject,
    mergeMap,
    shareReplay,
} from "rxjs";
import applicationApi from "@/api/application";
import optionApi from "@/api/options";
import productUserApi from "@/api/product-user-permission";
import logSearchApi from "@/api/query-buried";
import { handleResponse } from "@/utils/request";
import { uniqBy } from "lodash";

const productCode$ = new ReplaySubject(1);
const appKeys$ = new ReplaySubject(1);

let optionData = null;

const apiData$ = defer(() => {
    if (optionData) {
        return of(optionData);
    }
    return from(applicationApi.getProductAndAppKeys());
}).pipe(
    tap(data => {
        if (!optionData) {
            optionData = data;
        }
    })
);

const productCodeOption$ = apiData$.pipe(
    map(list => {
        return list.map(each => {
            return {
                label: each.productName,
                value: each.productCode,
            };
        });
    })
);
const appKeyOption$ = productCode$.pipe(
    map(productCode => {
        const optionList = optionData;
        const found = optionList.find(each => each.productCode === productCode);
        if (found) {
            return found.applications.map(each => {
                return {
                    label: each.name,
                    value: each.appKey,
                };
            });
        }
        return [];
    })
);

const setProductCode = val => {
    if (val) {
        productCode$.next(val);
    }
};

const setAppKeys = appKeyList => {
    if (appKeyList && appKeyList.length) {
        appKeys$.next(appKeyList);
    }
};

const productCodeAndAppKeys$ = combineLatest(productCode$, appKeys$);

const developerList$ = of(1).pipe(
    mergeMap(() => {
        return from(productUserApi.getEmailList().then(handleResponse));
    }),
    map(mail => {
        return mail.map(each => {
            const [label, _] = each.split("@");
            return {
                label,
                value: each,
            };
        });
    })
);

const unitList$ = of("").pipe(
    switchMap(() => {
        return optionApi.getAttrUnit();
    }),
    shareReplay(1)
);

const tagList$ = of(1).pipe(
    withLatestFrom(productCodeAndAppKeys$),
    map(([_, [productCode, appKeys]]) => {
        return {
            productCode,
            appKey: appKeys.join(","),
        };
    }),
    mergeMap(param => {
        return from(logSearchApi.getTagsOptions(param));
    }),
    map(tagList => {
        return uniqBy(tagList, "value");
    })
);

export {
    setProductCode,
    setAppKeys,
    appKeyOption$,
    productCodeOption$,
    productCode$,
    appKeys$,
    productCodeAndAppKeys$,
    developerList$,
    unitList$,
    apiData$,
    tagList$,
};
