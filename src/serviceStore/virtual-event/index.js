import { productCode$, productCodeAndAppKeys$ } from "../global/index";
import {
    ReplaySubject,
    switchMap,
    from,
    map,
    of,
    withLatestFrom,
    debounceTime,
    tap,
    mergeMap,
    concatMap,
    toArray,
    merge,
} from "rxjs";
import { virtualEventApi } from "@/api/virtual-event";
import liveViewApi from "@/api/live-view.js";
import logSearchApi from "@/api/query-buried";
import { map as lodashMap, findIndex, sortBy, uniqBy, forEach } from "lodash";
import { getCondOption } from "@/conf/common";
import { split2Array } from "@/utils/index";

class VirtualEvent {
    constructor() {
        this._querySubject$ = new ReplaySubject(1);
    }

    getTableData$() {
        return this._querySubject$.pipe(
            debounceTime(300),
            switchMap(query => {
                return from(virtualEventApi.getTable(query));
            }),
            map(resp => {
                const { total = 0, data = [] } = resp;
                return {
                    total,
                    list: lodashMap(data, each => {
                        const permission = each.permissionControl || {};
                        return {
                            id: each.id,
                            name: each.eventId,
                            displayName: each.eventName,
                            tagList: split2Array(each.tag),
                            pictureList: split2Array(each.descriptionUrl, " "),
                            remark: each.description,
                            includeEvents: each.eventIds,
                            operator: each.operator,
                            createTime: each.createTime,
                            updateTime: each.updateTime,
                            canEdit: permission.canEdit || false,
                            canDelete: permission.canDelete || false,
                        };
                    }),
                };
            })
        );
    }

    search(query) {
        this._querySubject$.next(query);
    }

    _operate(data, asyncFunc) {
        return of(data).pipe(
            withLatestFrom(productCode$),
            switchMap(([query, productCode]) => {
                query.productCode = productCode;
                return from(asyncFunc(query));
            }),
            withLatestFrom(this._querySubject$),
            tap(([_, query]) => {
                this._querySubject$.next(query);
            })
        );
    }

    create(data) {
        return this._operate(data, virtualEventApi.create);
    }

    update(data) {
        return this._operate(data, virtualEventApi.update);
    }

    delete(data) {
        of(data)
            .pipe(
                switchMap(data => {
                    return from(virtualEventApi.delete(data));
                }),
                withLatestFrom(this._querySubject$),
                tap(([_, query]) => {
                    this._querySubject$.next(query);
                })
            )
            .subscribe();
    }

    _getEventList$(query) {
        const filterTypeOption = getCondOption();
        return of(query).pipe(
            switchMap(query => from(virtualEventApi.getEventList(query))),
            concatMap(list => from(list)),
            map((each, index) => {
                return {
                    id: index,
                    name: each.eventId,
                    cName: "",
                    option: [],
                    cond: each.conditionRelationType,
                    filters: lodashMap(each.conditions ?? [], el => {
                        const { attributeName, attributeType, valueSet, filterType } = el;
                        let condCName = "";
                        const index = findIndex(filterTypeOption, obj => obj.value === filterType);
                        if (index !== -1) {
                            condCName = filterTypeOption[index].label;
                        }
                        return {
                            name: attributeName,
                            type: attributeType,
                            value: valueSet,
                            cond: filterType,
                            condCName,
                            hasValue: filterType !== "N_MTY" && filterType !== "MTY",
                        };
                    }),
                };
            }),
            withLatestFrom(productCode$),
            mergeMap(
                ([obj, productCode]) => {
                    return from(
                        liveViewApi.getEventAttributes({
                            productCode,
                            eventId: obj.eventId,
                        })
                    );
                },
                ([obj], option) => {
                    return {
                        ...obj,
                        option,
                    };
                }
            )
        );
    }

    getEventList$(query) {
        return this._getEventList$(query).pipe(
            toArray(),
            map(list => {
                return sortBy(list, each => each.id);
            })
        );
    }

    getViewEventList$(id) {
        return this._getEventList$(id).pipe(
            // withLatestFrom(productCode$),
            // mergeMap(
            //     ([each, productCode]) => {
            //         return from(
            //             virtualEventApi.getCNameById({
            //                 productCode,
            //                 eventId: each.name,
            //             })
            //         );
            //     },
            //     ([each], data) => {
            //         return {
            //             ...each,
            //             cName: data.eventName,
            //         };
            //     }
            // ),
            map(obj => {
                const { option = [] } = obj;
                obj.cName = obj.name;
                const mp = new Map();
                forEach(option, each => {
                    mp.set(each.value, each.label);
                });
                forEach(obj.filters, filter => {
                    filter.cName = mp.get(filter.name) ?? filter.name;
                });
                return obj;
            }),
            toArray(),
            map(list => {
                return sortBy(list, each => each.id);
            })
        );
    }

    getTagList$() {
        return merge(productCode$, this._querySubject$).pipe(
            withLatestFrom(productCode$),
            debounceTime(200),
            switchMap(([_, productCode]) => {
                return from(
                    logSearchApi.getTagsOptions({
                        productCode,
                    })
                );
            }),
            map(tagList => {
                return uniqBy(tagList, "value");
            })
        );
    }
}

export { VirtualEvent, productCode$ };
