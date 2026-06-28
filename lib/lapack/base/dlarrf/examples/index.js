/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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
import dlarrf from './../lib/index.js';

// Build a simple 4x4 well-separated symmetric tridiagonal cluster (LDL^T form):
var N = 4;
var d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0 ] );
var l = new Float64Array( [ 0.1, 0.1, 0.1, 0.0 ] );
var ld = new Float64Array( [ 0.4, 0.3, 0.2, 0.0 ] );
var w = new Float64Array( [ 0.95, 1.95, 2.95, 4.05 ] );
var wgap = new Float64Array( [ 0.9, 0.9, 1.0, 0.0 ] );
var werr = new Float64Array( [ 1e-3, 1e-3, 1e-3, 1e-3 ] );

// Allocate outputs (sigma is length 1, dplus/lplus hold the new RRR):
var sigma = new Float64Array( 1 );
var dplus = new Float64Array( N );
var lplus = new Float64Array( N );
var work = new Float64Array( 2 * N );

// eslint-disable-next-line max-len
var info = dlarrf( N, d, 1, l, 1, ld, 1, 1, 4, w, 1, wgap, 1, werr, 1, 4.0, 1.0, 1.0, 2.2250738585072014e-308, sigma, dplus, 1, lplus, 1, work, 1 );
console.log( 'info: ' + info ); // eslint-disable-line no-console
console.log( 'sigma: ' + sigma[ 0 ] ); // eslint-disable-line no-console
console.log( 'dplus: ' + dplus ); // eslint-disable-line no-console
console.log( 'lplus: ' + lplus ); // eslint-disable-line no-console
