/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { assign } from "../../utils";
import defer from "../../utils/defer";

const createEmptyViewPropositions = viewName => {
  return [{
    scope: viewName,
    scopeDetails: {
      characteristics: {
        scopeType: "view"
      }
    }
  }];
};

export default () => {
  let viewStorage;
  const viewStorageDeferred = defer();

  const storeViews = viewTypeHandlesPromise => {
    viewTypeHandlesPromise
      .then(viewTypeHandles => {
        if (viewStorage === undefined) {
          viewStorage = {};
        }
        const newViewStorage = viewTypeHandles.reduce((acc, handle) => {
          const { scope } = handle;
          acc[scope] = acc[scope] || [];
          acc[scope].push(handle);
          return acc;
        }, {});
        assign(viewStorage, newViewStorage);
        viewStorageDeferred.resolve();
      })
      .catch(() => {
        if (viewStorage === undefined) {
          viewStorage = {};
        }
        viewStorageDeferred.resolve();
      });
  };

  const getView = viewName => {
    return viewStorageDeferred.promise.then(() =>
      viewStorage[viewName] ||
      createEmptyViewPropositions(viewName)
    );
  };

  const isInitialized = () => {
    return !(viewStorage === undefined);
  };
  return {
    storeViews,
    getView,
    isInitialized
  };
};
