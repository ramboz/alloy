/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import { responseStatus } from "../../helpers/assertions/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  configOverridesMain as overrides,
  configOverridesAlt as alternateOverrides,
  orgMainConfigMain,
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);

createFixture({
  title:
    "C7437530: sendEvent can receive config overrides in command options and in configure",
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.meta({
  ID: "C2592",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C7437530: `sendEvent` can receive config overrides in command options", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({
    edgeConfigOverrides: overrides,
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body,
  );

  await t
    .expect(request.events[0].xdm.implementationDetails.name)
    .eql("https://ns.adobe.com/experience/alloy");
  await t
    .expect(
      request.meta.configOverrides.com_adobe_experience_platform.datasets.event,
    )
    .eql(overrides.com_adobe_experience_platform.datasets.event);
  await t
    .expect(request.meta.configOverrides.com_adobe_analytics.reportSuites)
    .eql(overrides.com_adobe_analytics.reportSuites);
  await t
    .expect(request.meta.configOverrides.com_adobe_identity.idSyncContainerId)
    .eql(overrides.com_adobe_identity.idSyncContainerId);
  await t
    .expect(request.meta.configOverrides.com_adobe_target.propertyToken)
    .eql(overrides.com_adobe_target.propertyToken);
  await t.expect(request.meta.state.cookiesEnabled).eql(true);
  await t.expect(request.meta.state.domain).ok();
});

test("Test C7437530: `sendEvent` doesn't contain empty configOverrides if edgeConfigOverrides are not in options", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({});

  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body,
  );

  await t
    .expect(request.events[0].xdm.implementationDetails.name)
    .eql("https://ns.adobe.com/experience/alloy");
  await t.expect(request.meta.configOverrides).eql(undefined);
});

test("Test C7437530: `sendEvent` can receive config overrides from configure", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(
    compose(config, {
      edgeConfigOverrides: overrides,
    }),
  );
  await alloy.sendEvent({});

  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body,
  );

  await t
    .expect(request.events[0].xdm.implementationDetails.name)
    .eql("https://ns.adobe.com/experience/alloy");
  await t
    .expect(
      request.meta.configOverrides.com_adobe_experience_platform.datasets.event,
    )
    .eql(overrides.com_adobe_experience_platform.datasets.event);
  await t
    .expect(request.meta.configOverrides.com_adobe_analytics.reportSuites)
    .eql(overrides.com_adobe_analytics.reportSuites);
  await t
    .expect(request.meta.configOverrides.com_adobe_identity.idSyncContainerId)
    .eql(overrides.com_adobe_identity.idSyncContainerId);
  await t
    .expect(request.meta.configOverrides.com_adobe_target.propertyToken)
    .eql(overrides.com_adobe_target.propertyToken);
  await t.expect(request.meta.state.cookiesEnabled).eql(true);
  await t.expect(request.meta.state.domain).ok();
});

test("Test C7437530: overrides from `sendEvent` should take precedence over the ones from `configure`", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(
    compose(config, {
      edgeConfigOverrides: alternateOverrides,
    }),
  );
  await alloy.sendEvent({
    edgeConfigOverrides: overrides,
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body,
  );

  await t
    .expect(request.events[0].xdm.implementationDetails.name)
    .eql("https://ns.adobe.com/experience/alloy");
  await t
    .expect(
      request.meta.configOverrides.com_adobe_experience_platform.datasets.event,
    )
    .eql(overrides.com_adobe_experience_platform.datasets.event);
  await t
    .expect(request.meta.configOverrides.com_adobe_analytics.reportSuites)
    .eql(overrides.com_adobe_analytics.reportSuites);
  await t
    .expect(request.meta.configOverrides.com_adobe_identity.idSyncContainerId)
    .eql(overrides.com_adobe_identity.idSyncContainerId);
  await t
    .expect(request.meta.configOverrides.com_adobe_target.propertyToken)
    .eql(overrides.com_adobe_target.propertyToken);
  await t.expect(request.meta.state.cookiesEnabled).eql(true);
  await t.expect(request.meta.state.domain).ok();
});

test("Test C7437530: empty configuration overrides should not be sent to the Edge", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(
    compose(config, {
      edgeConfigOverrides: compose(alternateOverrides, {
        com_adobe_target: {
          propertyToken: "",
        },
      }),
    }),
  );
  await alloy.sendEvent({
    edgeConfigOverrides: compose(overrides, {
      com_adobe_target: {
        propertyToken: "",
      },
    }),
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body,
  );

  await t
    .expect(request.events[0].xdm.implementationDetails.name)
    .eql("https://ns.adobe.com/experience/alloy");
  await t
    .expect(
      request.meta.configOverrides.com_adobe_experience_platform.datasets.event,
    )
    .eql(overrides.com_adobe_experience_platform.datasets.event);
  await t
    .expect(request.meta.configOverrides.com_adobe_analytics.reportSuites)
    .eql(overrides.com_adobe_analytics.reportSuites);
  await t
    .expect(request.meta.configOverrides.com_adobe_identity.idSyncContainerId)
    .eql(overrides.com_adobe_identity.idSyncContainerId);
  await t.expect(request.meta.configOverrides.com_adobe_target).eql(undefined);
  await t.expect(request.meta.state.cookiesEnabled).eql(true);
  await t.expect(request.meta.state.domain).ok();
});

test("Test C7437530: `sendEvent` can override the datastreamId", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const { datastreamId: originalDatastreamId } = config;
  const alternateDatastreamId = `${originalDatastreamId}:dev`;
  await alloy.sendEvent({
    edgeConfigOverrides: {
      datastreamId: alternateDatastreamId,
    },
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  const [request] = networkLogger.edgeEndpointLogs.requests;
  await t.expect(request.request.url).contains(alternateDatastreamId);

  const body = JSON.parse(request.request.body);
  await t
    .expect(body.meta.sdkConfig.datastream.original)
    .eql(originalDatastreamId);
});
