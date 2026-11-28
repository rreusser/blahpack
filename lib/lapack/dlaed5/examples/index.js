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
import dlaed5 from './../lib/index.js';

// Original eigenvalues (D[0] < D[1]) and unit-norm updating vector:
const D = new Float64Array( [ 1.0, 3.0 ] );
const Z = new Float64Array( [ 0.6, 0.8 ] );
const DELTA = new Float64Array( 2 );
const dlam = new Float64Array( 1 );
const rho = 0.5;

// Using the standard interface (first updated eigenvalue):
dlaed5( 1, D, 1, Z, 1, DELTA, 1, rho, dlam );
console.log( 'lambda1 = %d', dlam[ 0 ] );
console.log( DELTA );

// Using the ndarray interface (second updated eigenvalue):
dlaed5.ndarray( 2, D, 1, 0, Z, 1, 0, DELTA, 1, 0, rho, dlam );
console.log( 'lambda2 = %d', dlam[ 0 ] );
console.log( DELTA );
