/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultService {

    /**
     * @param study
     * @param site
     * @param subscription
     * @throws ApiError
     */
    public static getMetadata(
        study: string,
        site: string,
        subscription: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/metadata/{site}/{study}/{subscription}',
            path: {
                'study': study,
                'site': site,
                'subscription': subscription,
            },
        });
    }

    /**
     * @param study
     * @param site
     * @param subscription
     * @returns string 200 response
     * @throws ApiError
     */
    public static optionsMetadata(
        study: string,
        site: string,
        subscription: string,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'OPTIONS',
            url: '/metadata/{site}/{study}/{subscription}',
            path: {
                'study': study,
                'site': site,
                'subscription': subscription,
            },
            responseHeader: 'Access-Control-Allow-Origin',
        });
    }

    /**
     * @throws ApiError
     */
    public static getMetadata1(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/metadata',
        });
    }

    /**
     * @returns string 200 response
     * @throws ApiError
     */
    public static optionsMetadata1(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'OPTIONS',
            url: '/metadata',
            responseHeader: 'Access-Control-Allow-Origin',
        });
    }

    /**
     * @param subscriptionName
     * @throws ApiError
     */
    public static getChartData(
        subscriptionName: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/chart-data/{subscription_name}',
            path: {
                'subscription_name': subscriptionName,
            },
        });
    }

    /**
     * @param subscriptionName
     * @returns string 200 response
     * @throws ApiError
     */
    public static optionsChartData(
        subscriptionName: string,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'OPTIONS',
            url: '/chart-data/{subscription_name}',
            path: {
                'subscription_name': subscriptionName,
            },
            responseHeader: 'Access-Control-Allow-Origin',
        });
    }

    /**
     * @param site
     * @throws ApiError
     */
    public static getStudyPeriods(
        site: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/study-periods/{site}',
            path: {
                'site': site,
            },
        });
    }

    /**
     * @param site
     * @returns string 200 response
     * @throws ApiError
     */
    public static optionsStudyPeriods(
        site: string,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'OPTIONS',
            url: '/study-periods/{site}',
            path: {
                'site': site,
            },
            responseHeader: 'Access-Control-Allow-Origin',
        });
    }

    /**
     * @throws ApiError
     */
    public static getSubscriptions(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/subscriptions',
        });
    }

    /**
     * @returns string 200 response
     * @throws ApiError
     */
    public static optionsSubscriptions(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'OPTIONS',
            url: '/subscriptions',
            responseHeader: 'Access-Control-Allow-Origin',
        });
    }

    /**
     * @param study
     * @param site
     * @throws ApiError
     */
    public static getMetadata2(
        study: string,
        site: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/metadata/{site}/{study}',
            path: {
                'study': study,
                'site': site,
            },
        });
    }

    /**
     * @param study
     * @param site
     * @returns string 200 response
     * @throws ApiError
     */
    public static optionsMetadata2(
        study: string,
        site: string,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'OPTIONS',
            url: '/metadata/{site}/{study}',
            path: {
                'study': study,
                'site': site,
            },
            responseHeader: 'Access-Control-Allow-Origin',
        });
    }

    /**
     * @param site
     * @throws ApiError
     */
    public static getMetadata3(
        site: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/metadata/{site}',
            path: {
                'site': site,
            },
        });
    }

    /**
     * @param site
     * @returns string 200 response
     * @throws ApiError
     */
    public static optionsMetadata3(
        site: string,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'OPTIONS',
            url: '/metadata/{site}',
            path: {
                'site': site,
            },
            responseHeader: 'Access-Control-Allow-Origin',
        });
    }

    /**
     * @param study
     * @param site
     * @throws ApiError
     */
    public static getStudyPeriods1(
        study: string,
        site: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/study-periods/{site}/{study}',
            path: {
                'study': study,
                'site': site,
            },
        });
    }

    /**
     * @param study
     * @param site
     * @returns string 200 response
     * @throws ApiError
     */
    public static optionsStudyPeriods1(
        study: string,
        site: string,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'OPTIONS',
            url: '/study-periods/{site}/{study}',
            path: {
                'study': study,
                'site': site,
            },
            responseHeader: 'Access-Control-Allow-Origin',
        });
    }

    /**
     * @throws ApiError
     */
    public static getStudyPeriods2(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/study-periods',
        });
    }

    /**
     * @returns string 200 response
     * @throws ApiError
     */
    public static optionsStudyPeriods2(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'OPTIONS',
            url: '/study-periods',
            responseHeader: 'Access-Control-Allow-Origin',
        });
    }

}
