---
title: Aggregator API Integration
# audience: Engineers contributing to the dashboard, highly technical
# type: how-to
---

# Aggregator API Integration

This document describes how to work with the aggregator's OpenAPI specification

## Setup

There are two packages we're leveraging to generate code from specs:
    - `openapi-typescript`
    - `openapi-typescript-codegen`

This will provide an `openapi` cli, which you can use to generate code if the API spec
updates. You can run this from the ./app/ directory with the following command:
```bash
openapi -i app/src/services/aggregator.yaml -o app/src/services/aggregator/
```
This will generate three folders: `core`, which handles the basics of calling the
API, `models`, which provides typing for object payloads (this is currently empty),
and `services`, which provides the interface to the api endpoints.

Whenever you regenerate the model, you will need to modify `core/OpenAPI.ts`  in the
following ways:
    - In `export type OpenAPIConfig`, change `BASE` to `BASE?`
    - In `const OpenAPI: OpenAPIConfig`, change the value of `BASE` to
        `process.env.REACT_APP_AGGREGATOR_URL`

This will allow us to optionally define aggregators to use per environment.

<!-- (When ready, add note about API keys here) -->

## Usage

The base openAPI component provides exports for the various sub modules. Using two
should get you access to the functionality you're interested in:
```js
import { OpenAPI, DefaultService } from "rel/path/to/openapi/aggregator"
```
The OpenAPI component allows you to override any of the core HTTP infrastructure. It
is useful for doing things like adding headers to specific calls.

The DefaultService component provides method access for each of the individual calls
defined in the openAPI definition, which return a promise-like object called a
CancellablePromise. You can invoke these with `DefaultService.HttpVerbMethod()`.