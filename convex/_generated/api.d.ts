/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as clubs from "../clubs.js";
import type * as crons from "../crons.js";
import type * as dvb from "../dvb.js";
import type * as events from "../events.js";
import type * as favorites from "../favorites.js";
import type * as geocoding from "../geocoding.js";
import type * as ingestion from "../ingestion.js";
import type * as scraping_clubCatalog from "../scraping/clubCatalog.js";
import type * as scraping_eventImages from "../scraping/eventImages.js";
import type * as scraping_geocoding from "../scraping/geocoding.js";
import type * as scraping_vdsc from "../scraping/vdsc.js";
import type * as scraping_vdscParser from "../scraping/vdscParser.js";
import type * as scraping_vdscTypes from "../scraping/vdscTypes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  clubs: typeof clubs;
  crons: typeof crons;
  dvb: typeof dvb;
  events: typeof events;
  favorites: typeof favorites;
  geocoding: typeof geocoding;
  ingestion: typeof ingestion;
  "scraping/clubCatalog": typeof scraping_clubCatalog;
  "scraping/eventImages": typeof scraping_eventImages;
  "scraping/geocoding": typeof scraping_geocoding;
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
