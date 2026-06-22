/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import dlarmm from './../lib/index.js';

// For modest infinity norms, no down-scaling is required:
var s1 = dlarmm( 1.0, 1.0, 1.0 );
console.log( s1 );

// When the product would overflow, dlarmm returns a smaller scaling factor:
var s2 = dlarmm( 1e308, 1.0, 1e307 );
console.log( s2 );

// When `bnorm > 1` and the product would overflow, the factor scales by 1 / bnorm:
var s3 = dlarmm( 1e308, 10.0, 1e307 );
console.log( s3 );
