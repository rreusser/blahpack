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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpptrf from '../../dpptrf/lib/index.js';
import dpptri from './../lib/index.js';

// 3x3 SPD matrix A = [25 5 -5; 5 10 2; -5 2 6] in upper packed format:
var AP = new Float64Array( [ 25.0, 5.0, 10.0, -5.0, 2.0, 6.0 ] );

// Compute Cholesky factorization:
var info = dpptrf( 'upper', 3, AP );
console.log( 'dpptrf info: %d', info ); // eslint-disable-line no-console
console.log( 'U (packed):', AP ); // eslint-disable-line no-console

// Compute the inverse:
info = dpptri( 'upper', 3, AP );
console.log( 'dpptri info: %d', info ); // eslint-disable-line no-console
console.log( 'inv(A) (packed):', AP ); // eslint-disable-line no-console
