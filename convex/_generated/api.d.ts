/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as authHelpers from "../authHelpers.js";
import type * as companies from "../companies.js";
import type * as crews from "../crews.js";
import type * as customers from "../customers.js";
import type * as debug from "../debug.js";
import type * as employees from "../employees.js";
import type * as equipment from "../equipment.js";
import type * as equipmentCategories from "../equipmentCategories.js";
import type * as equipmentTypes from "../equipmentTypes.js";
import type * as jobLineItems from "../jobLineItems.js";
import type * as jobs from "../jobs.js";
import type * as loadouts from "../loadouts.js";
import type * as productionRates from "../productionRates.js";
import type * as projectReports from "../projectReports.js";
import type * as seedEquipmentCategories from "../seedEquipmentCategories.js";
import type * as timeLogs from "../timeLogs.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  auth: typeof auth;
  authHelpers: typeof authHelpers;
  companies: typeof companies;
  crews: typeof crews;
  customers: typeof customers;
  debug: typeof debug;
  employees: typeof employees;
  equipment: typeof equipment;
  equipmentCategories: typeof equipmentCategories;
  equipmentTypes: typeof equipmentTypes;
  jobLineItems: typeof jobLineItems;
  jobs: typeof jobs;
  loadouts: typeof loadouts;
  productionRates: typeof productionRates;
  projectReports: typeof projectReports;
  seedEquipmentCategories: typeof seedEquipmentCategories;
  timeLogs: typeof timeLogs;
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
