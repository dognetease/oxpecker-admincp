import {
    productCodeAndAppKeys$,
    developerList$,
    productCode$,
    unitList$,
    apiData$,
    tagList$,
} from "../global/index";
import {
    of,
    withLatestFrom,
    debounceTime,
    switchMap,
    mergeMap,
    from,
    map,
    tap,
    ReplaySubject,
    last,
    forkJoin,
    Subject,
} from "rxjs";
import { omitBy, isNil, isString } from "lodash";
import logSearchApi from "@/api/query-buried";
import remarkApi from "@/api/remark";
import optionApi from "@/api/options";
// import logInputApi from "@/api/entry-buried";

const selectText$ = new Subject();

const paramMapFn = ([{ eventId, appKey }, productCode]) => {
    return {
        eventId,
        appKey,
        productCode,
    };
};

const eventMapFn = data => {
    const { eventAttributeDTOList: list } = data;
    const numberAttrList = [];
    const stringAttrList = [];
    for (const each of list) {
        if (each.type === "number") {
            numberAttrList.push(each);
        } else if (each.type === "string") {
            stringAttrList.push(each);
        }
    }
    Reflect.deleteProperty(data, "eventAttributeDTOList");
    data.numberAttrList = numberAttrList;
    data.stringAttrList = stringAttrList;
    data.appKey = [data.appKey];
    return data;
};
const assembleOption = ([event, apiData]) => {
    const productCodeOption = apiData.map(each => {
        return {
            label: each.productName,
            value: each.productCode,
        };
    });
    event.productCodeOption = productCodeOption;

    const appKeyOption = apiData
        .find(each => each.productCode === event.productCode)
        ?.applications.map(each => {
            return {
                label: each.name,
                value: each.appKey,
            };
        });
    event.appKeyOption = appKeyOption;

    return event;
};

const requestTableDataSubject$ = new ReplaySubject(1);
const tableData$ = requestTableDataSubject$.pipe(
    debounceTime(200),
    withLatestFrom(productCodeAndAppKeys$),
    map(([query, [productCode, appKeys]]) => {
        return {
            ...query,
            productCode,
            appKey: appKeys.join(","),
        };
    }),
    switchMap(param => {
        return from(
            logSearchApi.list(param).then(({ data = {}, status }) => {
                if (status !== 200) {
                    throw new Error("http error: " + status);
                }
                if (data.code !== 0) {
                    throw new Error("api error: " + data.code);
                }
                return {
                    list: data.data,
                    total: data.total,
                };
            })
        );
    })
);

const productAndKeys$ = productCodeAndAppKeys$.pipe(debounceTime(200));

const logSearchMethod = {
    // 查询
    search(query = {}) {
        if (!query.sort) {
            query.sort = "id,desc";
        }
        requestTableDataSubject$.next(query);
    },

    // 查看
    viewLog(id) {
        const data$ = this._getEventInfoById(id);

        const unit$ = this._getAttrUnit();
        return forkJoin(data$, unit$).pipe(
            map(([data, unit]) => {
                const { eventAttributeDTOList: list } = data;
                return list.reduce(
                    (acc, cur) => {
                        if (cur.type === "number") {
                            acc.attrNumber.push({
                                ...cur,
                                unit: unit.find(each => each.value === cur.unit)?.label,
                            });
                        } else if (cur.type === "string") {
                            acc.attrString.push(cur);
                        }
                        return acc;
                    },
                    {
                        attrString: [],
                        attrNumber: [],
                    }
                );
            }),
            map(data => {
                const { attrString } = data;
                data.attrString = attrString.reduce((accumulator, item) => {
                    const attributeValue = JSON.parse(JSON.stringify(item.attributeValue));
                    const itemToSpanRows = attributeValue.map(attributeItem => ({
                        ...item,
                        value: attributeItem.value,
                        desc: attributeItem.desc,
                    }));
                    if (itemToSpanRows.length) {
                        itemToSpanRows[0].isSpanStart = true;
                        itemToSpanRows[0].spanRowsCount = itemToSpanRows.length;
                    }

                    return [...accumulator, ...itemToSpanRows];
                }, []);
                return data;
            })
        );
    },

    // 获取单位列表
    _getAttrUnit() {
        return unitList$;
    },

    _getEventInfoById(id) {
        return of(id).pipe(
            switchMap(id => {
                return from(logSearchApi.getEventById({ id }));
            })
        );
    },

    // 编辑
    editLog(id) {
        return this._getEventInfoById(id).pipe(
            map(eventMapFn),
            withLatestFrom(apiData$),
            map(assembleOption)
        );
    },
    updateEditLog(data) {
        return from(logSearchApi.update(data));
    },

    // 编辑同组
    editLogGroup(data) {
        const { id, status, productCode, eventId } = data;
        return forkJoin([
            this.editLog(id),
            from(
                optionApi.getAppKeyOptions4EditGroup({
                    productCode,
                    eventId,
                })
            ),
        ]).pipe(
            map(([resp, appKeyOption]) => {
                // 初始同组appkey，不可删除
                const initAppKeys = [];
                const nextMap = {};
                appKeyOption
                    .filter(item =>
                        //当前event的状态是已发布的话，选中所以的待开发、待发布、已发布，当前event不是已发布的话，只能选中待开发、待发布
                        status === 1
                            ? item.status && item.status !== 2
                            : item.status === 0 || item.status === 3
                    )
                    .forEach(item => {
                        initAppKeys.push(item.value);
                        nextMap[item.value] = item.version;
                    });
                resp.appKey = initAppKeys;
                resp.version = omitBy(nextMap, isNil);
                resp.appKeyOption.forEach(each => {
                    const { value } = each;
                    if (initAppKeys.includes(value)) {
                        each.disabled = true;
                    } else {
                        each.disabled = false;
                    }
                });
                return resp;
            })
        );
    },
    updateGroupEditLog(data) {
        return from(logSearchApi.update(data));
    },

    // 禁用属性
    getAllAttr(eventId, appKey) {
        return of([eventId, appKey]).pipe(
            withLatestFrom(productCode$),
            map(paramMapFn),
            switchMap(param => {
                return from(logSearchApi.getDisabledAttr(param));
            }),
            map(attrList => {
                return attrList.map(each => {
                    return {
                        checked: false,
                        ...each,
                    };
                });
            })
        );
    },
    disableAttr(param) {
        return of(param).pipe(
            withLatestFrom(productCode$),
            map(([param, productCode]) => {
                return {
                    ...param,
                    productCode,
                };
            }),
            switchMap(param => {
                return from(logSearchApi.updateDisabledAttr(param));
            })
        );
    },

    // 备注
    getRemark(eventId, appKey) {
        return of([eventId, appKey]).pipe(
            withLatestFrom(productCode$),
            map(paramMapFn),
            switchMap(param => {
                return from(remarkApi.getEventRemark(param));
            })
        );
    },
    updateRemark(data) {
        const { text, imgs, appKey, eventId } = data;
        let remark = [];
        if (text.length > 0) {
            remark.push(`<p>${text}</p>`);
        }
        if (imgs.length > 0) {
            remark = remark.concat(
                imgs.map(each => {
                    return `<p><img src=${each} /></p>`;
                })
            );
        }
        remark = remark.join("<br />");
        return of([eventId, appKey, remark]).pipe(
            withLatestFrom(productCode$),
            map(([[eventId, appKey, remark], productCode]) => {
                return {
                    eventId,
                    appKey,
                    remark,
                    productCode,
                };
            }),
            switchMap(param => {
                return from(remarkApi.create(param));
            }),
            withLatestFrom(requestTableDataSubject$),
            tap(val => {
                const [_, query] = val;
                requestTableDataSubject$.next(query);
            })
        );
    },

    // 发布
    publish(eventId, appKey) {
        return of({ eventId, appKey }).pipe(
            withLatestFrom(productCode$),
            map(paramMapFn),
            switchMap(param => {
                return from(logSearchApi.publishEventId(param));
            }),
            withLatestFrom(requestTableDataSubject$),
            tap(val => {
                const [_, query] = val;
                requestTableDataSubject$.next(query);
            })
        );
    },

    // 开发完成
    devComplete(eventId, appKey) {
        return of({ eventId, appKey }).pipe(
            withLatestFrom(productCode$),
            map(paramMapFn),
            switchMap(param => {
                return from(logSearchApi.developCompletedEventId(param));
            }),
            withLatestFrom(requestTableDataSubject$),
            tap(val => {
                const [_, query] = val;
                requestTableDataSubject$.next(query);
            })
        );
    },

    // 删除
    delete(eventId, appKey) {
        return of([eventId, appKey]).pipe(
            withLatestFrom(productCode$),
            map(paramMapFn),
            switchMap(param => {
                return from(logSearchApi.deleteEventById(param));
            }),
            withLatestFrom(requestTableDataSubject$),
            tap(val => {
                const [_, query] = val;
                requestTableDataSubject$.next(query);
            })
        );
    },

    // eventId search
    searchEventId(match = "") {
        selectText$.next(match);
    },

    batchDevComplete(data = []) {
        data = data
            .filter(each => each.status === 3)
            .map(each => {
                return {
                    eventId: each.eventId,
                    appKey: each.appKey,
                };
            });
        if (data.length === 0) {
            return null;
        }
        return of(...data).pipe(
            withLatestFrom(productCode$),
            map(paramMapFn),
            mergeMap(param => from(logSearchApi.developCompletedEventId(param))),
            last(),
            withLatestFrom(requestTableDataSubject$),
            tap(val => {
                const [_, query] = val;
                requestTableDataSubject$.next(query);
            })
        );
    },
    batchPublish(data = []) {
        data = data
            .filter(each => each.status === 0 || each.status === 2 || each.status === 1)
            .map(each => {
                return {
                    eventId: each.eventId,
                    appKey: each.appKey,
                };
            });
        if (data.length === 0) {
            return null;
        }
        return of(...data).pipe(
            withLatestFrom(productCode$),
            map(val => {
                return paramMapFn(val);
            }),
            mergeMap(param => from(logSearchApi.publishEventId(param))),
            last(),
            withLatestFrom(requestTableDataSubject$),
            tap(val => {
                const [_, query] = val;
                requestTableDataSubject$.next(query);
            })
        );
    },
};

const remoteEventIds$ = selectText$.pipe(
    withLatestFrom(productCodeAndAppKeys$),
    switchMap(([match, [productCode, appKeys]]) => {
        return from(
            optionApi.getEventIdOptions({
                match,
                productCode,
                eventType: "biz,perf,unknown",
                appKey: appKeys.join(","),
            })
        );
    })
);

export { developerList$, tagList$, tableData$, logSearchMethod, productAndKeys$, remoteEventIds$, unitList$ };
