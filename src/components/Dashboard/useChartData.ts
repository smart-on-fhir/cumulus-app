import { useCallback, useEffect, useState } from "react"
import type { ViewAction }                  from "."
import { getFilterParams, validateData }    from "./chartData"
import { SurvivalData }                     from "./Charts/kaplanMeier"
import { CUMULUS__NONE }                    from "./config"
import { fetchChartData }                   from "../../backend"
import { DataPackage }                      from "../../Aggregator"
import { app }                              from "../../types"


/**
 * Loads the data of a chart into the Dashboard state, and loads it again when
 * the columns, the filters or the survival settings change. Also loads the
 * values of the survival status column, so that the user can pick the one
 * that means "event".
 */
export function useChartData({
    subscription,
    dataPackage,
    viewColumnName,
    stratifierName,
    secColumnName,
    statusColumnName,
    statusLabel,
    eventValue,
    filters,
    dispatch
}: {
    subscription    ?: app.Subscription
    dataPackage     ?: DataPackage
    viewColumnName   : string
    stratifierName  ?: string
    secColumnName    : string
    statusColumnName : string
    statusLabel      : string
    eventValue       : string
    filters          : app.Filter[]
    dispatch         : (action: ViewAction) => void
}): { statusValues: string[] | null }
{
    const requestId = subscription?.id || dataPackage?.id

    // Convert filters to search parameters
    const filterParams = getFilterParams(filters)

    // Variables that control if new data needs to be fetched
    const filter = filterParams.map(encodeURIComponent).join("&filter=")

    const loadData = useCallback((signal?: AbortSignal) => {
        dispatch({ type: "UPDATE", payload: {
            loadingData: true,
            loadingDataError: null,
            data : null,
            data2: null,
            survivalData: null,
        }})

        return fetchViewData({
            subscription,
            dataPackage,
            viewColumnName,
            stratifierName,
            secColumnName,
            statusColumnName,
            statusLabel,
            eventValue,
            filterParams,
            signal
        }).then(({
            primaryData,
            secondaryData,
            survivalData
        }) => {
            if (signal?.aborted) return
            try {
                validateData(primaryData, { column: viewColumnName, stratifier: stratifierName, filters: filterParams })
                if (secColumnName) {
                    validateData(secondaryData, { column: viewColumnName, stratifier: secColumnName, filters: filterParams })
                }
            } catch (ex) {
                dispatch({ type: "UPDATE", payload: { loadingDataError: ex }})
            }

            dispatch({ type: "UPDATE", payload: {
                data : primaryData,
                data2: secondaryData,
                survivalData,
                loadingData: false
            }})
        }).catch(error => {
            if (signal?.aborted) return
            dispatch({ type: "UPDATE", payload: {
                loadingDataError: error,
                loadingData: false
            }})
        })

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestId, stratifierName, viewColumnName, filter, secColumnName, statusColumnName, eventValue]);

    useEffect(() => {
        const controller = new AbortController()
        loadData(controller.signal)
        return () => controller.abort()
    }, [loadData])

    // Survival charts: load the values of the status column, so that the user
    // can pick the one that means "event"
    const [statusValues, setStatusValues] = useState<string[] | null>(null)
    useEffect(() => {
        setStatusValues(null)
        if (!statusColumnName) return
        const controller = new AbortController()
        fetchChartData({
            subscription,
            dataPackage,
            column: statusColumnName,
            label : "Survival Status Values",
            signal: controller.signal
        }).then((data: app.ServerResponses.DataResponse) => {
            setStatusValues((data.data[0]?.rows || []).map(row => String(row[0])).filter(v => v !== CUMULUS__NONE))
        }).catch(() => {
            if (!controller.signal.aborted) setStatusValues([])
        })
        return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestId, statusColumnName])

    return { statusValues }
}


/**
 * Fetches the data of a chart: the primary data, the secondary data if there
 * is a secondary column, and the survival events and censored records if this
 * is a survival chart
 */
export async function fetchViewData({
    subscription,
    dataPackage,
    viewColumnName,
    stratifierName,
    secColumnName,
    statusColumnName,
    statusLabel,
    eventValue,
    filterParams,
    signal
}: {
    subscription    ?: app.Subscription
    dataPackage     ?: DataPackage
    viewColumnName   : string
    stratifierName  ?: string
    secColumnName    : string
    statusColumnName : string
    statusLabel      : string
    eventValue       : string
    filterParams     : string[]
    signal          ?: AbortSignal
}): Promise<{
    primaryData  : app.ServerResponses.DataResponse
    secondaryData: app.ServerResponses.StratifiedDataResponse | null
    survivalData : SurvivalData | null
}>
{
    const fetchPrimaryData = async () => fetchChartData({
        subscription,
        dataPackage,
        column    : viewColumnName,
        stratifier: stratifierName,
        filters   : filterParams,
        label     : "Chart Primary Data",
        signal
    })

    const fetchSecondaryData = async () => {
        if (!secColumnName) return null
        return fetchChartData({
            subscription,
            dataPackage,
            column    : viewColumnName,
            stratifier: secColumnName,
            filters   : filterParams,
            label     : "Chart Secondary Data",
            signal
        })
    }

    // Survival charts: the primary query split into events and censored records
    const fetchSurvivalData = async (): Promise<SurvivalData | null> => {
        if (!statusColumnName || !eventValue) return null
        const [events, censored] = await Promise.all([
            fetchChartData({
                subscription,
                dataPackage,
                column    : viewColumnName,
                stratifier: stratifierName,
                filters   : [...filterParams, `${statusColumnName}:strEq:${eventValue}`],
                label     : "Chart Survival Events",
                signal
            }),
            fetchChartData({
                subscription,
                dataPackage,
                column    : viewColumnName,
                stratifier: stratifierName,
                filters   : [
                    ...filterParams,
                    `${statusColumnName}:strNotEq:${eventValue}`,
                    `${statusColumnName}:strNotEq:${CUMULUS__NONE}`
                ],
                label     : "Chart Survival Censored",
                signal
            })
        ])
        return {
            events,
            censored,
            status: { label: statusLabel, eventValue }
        }
    }

    const [primaryData, secondaryData, survivalData] = await Promise.all([
        fetchPrimaryData(),
        fetchSecondaryData(),
        fetchSurvivalData()
    ])
    return { primaryData, secondaryData, survivalData }
}
