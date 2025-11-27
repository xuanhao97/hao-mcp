/**
 * Shared module for registering MCP tools
 * This allows the same tool registration logic to be reused between
 * stdio transport (src/index.ts) and HTTP transport (api/mcp/route.ts)
 *
 * This module acts as a central registry that imports and calls
 * individual tool registration functions from the tools/ directory.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ArobidClient } from '../client/arobidClient.js';
import { registerCreatePersonalAccount } from './tools/registerCreatePersonalAccount.js';
import { registerVerifyUser } from './tools/registerVerifyUser.js';
import { registerUserLogin } from './tools/registerUserLogin.js';
import { registerResendOtp } from './tools/registerResendOtp.js';
import { registerCheckResetPassword } from './tools/registerCheckResetPassword.js';
import { registerConfirmResetPassword } from './tools/registerConfirmResetPassword.js';
import { registerSearchEvents } from './tools/registerSearchEvents.js';
import { registerSearchBusinessesInEvent } from './tools/registerSearchBusinessesInEvent.js';
import { registerSearchBusinessesInMultipleEvents } from './tools/registerSearchBusinessesInMultipleEvents.js';
import { registerGetEventDetail } from './tools/registerGetEventDetail.js';
import { registerGetEventBanners } from './tools/registerGetEventBanners.js';
import { registerGetCategories } from './tools/registerGetCategories.js';
import { registerGetAllEvents } from './tools/registerGetAllEvents.js';
import { registerGetEventBusinesses } from './tools/registerGetEventBusinesses.js';
import { registerGetEventProducts } from './tools/registerGetEventProducts.js';
import { registerGetBusinessExpoDetail } from './tools/registerGetBusinessExpoDetail.js';
import { registerGetBusinessProducts } from './tools/registerGetBusinessProducts.js';
import { registerGetEventBusinessProductSummary } from './tools/registerGetEventBusinessProductSummary.js';
import { registerGetProductSummaryByEventAndBusiness } from './tools/registerGetProductSummaryByEventAndBusiness.js';
import { registerCountEventsComingSoon } from './tools/registerCountEventsComingSoon.js';
import { registerGetMeetingConfigurationActivable } from './tools/registerGetMeetingConfigurationActivable.js';
import { registerPreviewEventOrder } from './tools/registerPreviewEventOrder.js';
import { registerSubmitEventForm } from './tools/registerSubmitEventForm.js';
import { registerGetCategoriesByBusiness } from './tools/registerGetCategoriesByBusiness.js';
import { registerGetCategoriesByEvent } from './tools/registerGetCategoriesByEvent.js';
import { registerGetCategoriesV2 } from './tools/registerGetCategoriesV2.js';
import { registerGetBusinessByUser } from './tools/registerGetBusinessByUser.js';

/**
 * Registers all MCP tools on the given server instance
 * @param server - The MCP server instance to register tools on
 * @param client - The Arobid client instance to use for API calls
 */
export function registerTools(server: McpServer, client: ArobidClient): void {
  // Register all available tools
  registerCreatePersonalAccount(server, client);
  registerVerifyUser(server, client);
  registerUserLogin(server, client);
  registerResendOtp(server, client);
  registerCheckResetPassword(server, client);
  registerConfirmResetPassword(server, client);
  registerSearchEvents(server, client);
  registerSearchBusinessesInEvent(server, client);
  registerSearchBusinessesInMultipleEvents(server, client);
  registerGetEventDetail(server, client);
  registerGetEventBanners(server, client);
  registerGetCategories(server, client);
  registerGetCategoriesByBusiness(server, client);
  registerGetCategoriesByEvent(server, client);
  registerGetCategoriesV2(server, client);
  registerGetBusinessByUser(server, client);
  registerGetAllEvents(server, client);
  registerGetEventBusinesses(server, client);
  registerGetEventProducts(server, client);
  registerGetBusinessExpoDetail(server, client);
  registerGetBusinessProducts(server, client);
  registerGetEventBusinessProductSummary(server, client);
  registerGetProductSummaryByEventAndBusiness(server, client);
  registerCountEventsComingSoon(server, client);
  registerGetMeetingConfigurationActivable(server, client);
  registerPreviewEventOrder(server, client);
  registerSubmitEventForm(server, client);
}
