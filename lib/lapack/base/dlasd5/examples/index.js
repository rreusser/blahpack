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
import dlasd5 from './../lib/index.js';

// Compute the square root of the first eigenvalue of diag( D )^2 + rho * Z * Z^T, with 0 <= D[0] < D[1]:
const D = new Float64Array( [ 1.0, 2.0 ] );
const Z = new Float64Array( [ 0.6, 0.8 ] );
const DELTA = new Float64Array( 2 );
const WORK = new Float64Array( 2 );
const dsigma = new Float64Array( 1 );

// Using the standard interface:
dlasd5( 1, D, 1, Z, 1, DELTA, 1, 1.0, dsigma, WORK );
console.log( dsigma[ 0 ], DELTA, WORK ); // eslint-disable-line no-console

// Using the ndarray interface (second eigenvalue):
dlasd5.ndarray( 2, D, 1, 0, Z, 1, 0, DELTA, 1, 0, 1.0, dsigma, WORK, 1, 0 );
console.log( dsigma[ 0 ], DELTA, WORK ); // eslint-disable-line no-console
