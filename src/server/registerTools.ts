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
import { registerGetAllEvents } from './tools/registerGetAllEvents.js';
import { registerGetEventBusinesses } from './tools/registerGetEventBusinesses.js';
import { registerGetEventProducts } from './tools/registerGetEventProducts.js';
import { registerGetBusinessExpoDetail } from './tools/registerGetBusinessExpoDetail.js';
import { registerGetBusinessProducts } from './tools/registerGetBusinessProducts.js';
import { registerGetEventBusinessProductSummary } from './tools/registerGetEventBusinessProductSummary.js';
import { registerGetProductSummaryByEventAndBusiness } from './tools/registerGetProductSummaryByEventAndBusiness.js';
import { registerCountEventsComingSoon } from './tools/registerCountEventsComingSoon.js';
import { registerGetMeetingConfigurationActivable } from './tools/registerGetMeetingConfigurationActivable.js';
import { registerGetWorkspaceBusinessDetail } from './tools/registerGetWorkspaceBusinessDetail.js';
import { registerGetWorkspaceEventDetail } from './tools/registerGetWorkspaceEventDetail.js';
import { registerGetWorkspaceRegistrationDetail } from './tools/registerGetWorkspaceRegistrationDetail.js';
import { registerGetWorkspaceHistories } from './tools/registerGetWorkspaceHistories.js';
import { registerGetWorkspaceProductsOfBusiness } from './tools/registerGetWorkspaceProductsOfBusiness.js';
import { registerGetWorkspaceEvents } from './tools/registerGetWorkspaceEvents.js';
import { registerGetWorkspaceRegistrations } from './tools/registerGetWorkspaceRegistrations.js';
import { registerGetWorkspaceProducts } from './tools/registerGetWorkspaceProducts.js';
import { registerGetWorkspaceEventLimitBusiness } from './tools/registerGetWorkspaceEventLimitBusiness.js';
import { registerGetWorkspaceMainPackages } from './tools/registerGetWorkspaceMainPackages.js';
import { registerGetWorkspaceExtraPackages } from './tools/registerGetWorkspaceExtraPackages.js';
import { registerGetWorkspacePurchasedPackages } from './tools/registerGetWorkspacePurchasedPackages.js';
import { registerGetWorkspacePackageItems } from './tools/registerGetWorkspacePackageItems.js';
import { registerGetWorkspaceEventBanners } from './tools/registerGetWorkspaceEventBanners.js';

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
  registerGetAllEvents(server, client);
  registerGetEventBusinesses(server, client);
  registerGetEventProducts(server, client);
  registerGetBusinessExpoDetail(server, client);
  registerGetBusinessProducts(server, client);
  registerGetEventBusinessProductSummary(server, client);
  registerGetProductSummaryByEventAndBusiness(server, client);
  registerCountEventsComingSoon(server, client);
  registerGetMeetingConfigurationActivable(server, client);
  registerGetWorkspaceBusinessDetail(server, client);
  registerGetWorkspaceEventDetail(server, client);
  registerGetWorkspaceRegistrationDetail(server, client);
  registerGetWorkspaceHistories(server, client);
  registerGetWorkspaceProductsOfBusiness(server, client);
  registerGetWorkspaceEvents(server, client);
  registerGetWorkspaceRegistrations(server, client);
  registerGetWorkspaceProducts(server, client);
  registerGetWorkspaceEventLimitBusiness(server, client);
  registerGetWorkspaceMainPackages(server, client);
  registerGetWorkspaceExtraPackages(server, client);
  registerGetWorkspacePurchasedPackages(server, client);
  registerGetWorkspacePackageItems(server, client);
  registerGetWorkspaceEventBanners(server, client);
}
