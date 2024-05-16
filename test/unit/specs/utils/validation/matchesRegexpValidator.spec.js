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

import { string } from "../../../../../src/utils/validation";
import describeValidation from "../../../helpers/describeValidation";

const regexp = new RegExp("^[A-z]+$");

describe("validation::matchesRegexp", () => {
  describeValidation("optional matchesRegexp", string().matches(regexp), [
    { value: "abc" },
    { value: "ABCD" },
    { value: "*", error: true },
    { value: "123", error: true },
    { value: null },
    { value: undefined }
  ]);

  describeValidation(
    "required regexp",
    string()
      .regexp(regexp)
      .required(),
    [
      { value: null, error: true },
      { value: undefined, error: true },
      { value: "" }
    ]
  );

  describeValidation(
    "default regexp",
    string()
      .regexp(regexp)
      .default("abc"),
    [
      { value: null, expected: "abc" },
      { value: undefined, expected: "abc" },
      { value: "a" }
    ]
  );
});
