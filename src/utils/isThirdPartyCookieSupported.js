/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import getBrowser, { CHROME, IE, UNKNOWN } from "./getBrowser";
import includes from "./includes";

// Users could have also disabled third-party cookies in Chrome or IE, but we
// don't know. We also assume "unknown" browsers support third-party cookies,
// though we don't really know that either. We're making best guesses.
const browsersSupportingThirdPartyCookie = [CHROME, IE, UNKNOWN];

export default window =>
  includes(browsersSupportingThirdPartyCookie, getBrowser(window));
