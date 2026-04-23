/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as clubs from "../clubs.js";
import type * as events from "../events.js";
import type * as scraping_clubCatalog from "../scraping/clubCatalog.js";
import type * as scraping_vdsc from "../scraping/vdsc.js";
import type * as scraping_vdscParser from "../scraping/vdscParser.js";
import type * as scraping_vdscTypes from "../scraping/vdscTypes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  clubs: typeof clubs;
  events: typeof events;
  "scraping/clubCatalog": typeof scraping_clubCatalog;
  "scraping/vdsc": typeof scraping_vdsc;
  "scraping/vdscParser": typeof scraping_vdscParser;
  "scraping/vdscTypes": typeof scraping_vdscTypes;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
