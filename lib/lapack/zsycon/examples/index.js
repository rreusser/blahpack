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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zsycon from './../lib/index.js';

// Estimate the reciprocal condition number of a 3x3 complex symmetric matrix
// already factorized in place by zsytrf (upper, 1x1 pivots, identity permutation):
const N = 3;
const A = new Complex128Array( [ 2.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 3.0, -1.0, 0.0, 0.0, 0.0, 0.0, 0.25, 0.5, 4.0, 0.0 ] );
const IPIV = new Int32Array( [ 0, 1, 2 ] );
const WORK = new Complex128Array( 2 * N );
const rcond = new Float64Array( 1 );
const anorm = 6.0;

// Using the standard interface:
let info = zsycon( 'column-major', 'upper', N, A, N, IPIV, 1, anorm, rcond, WORK );
console.log( info, rcond[ 0 ] );

// Using the strided interface:
info = zsycon.strided( 'upper', N, A, 1, N, 0, IPIV, 1, 0, anorm, rcond, WORK, 1, 0 );
console.log( info, rcond[ 0 ] );
