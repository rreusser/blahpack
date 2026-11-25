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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlanhe from './../../zlanhe/lib/index.js';
import zhetrf from './../../zhetrf/lib/index.js';
import zhecon from './../lib/index.js';

// 3x3 Hermitian matrix A (column-major):
const N = 3;
const A = new Complex128Array( [ 4.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 5.0, 0.0, 0.0, -2.0, 0.0, 0.0, 0.0, 2.0, 6.0, 0.0 ] ); // eslint-disable-line max-len
const IPIV = new Int32Array( N );

// Compute the 1-norm of A, then its Bunch-Kaufman factorization:
const anorm = zlanhe( 'column-major', 'one-norm', 'upper', N, A, N, new Float64Array( N ) );
zhetrf( 'column-major', 'upper', N, A, N, IPIV, 1, null );

const rcond = new Float64Array( 1 );
const WORK = new Complex128Array( 2 * N );

// Using the standard interface:
let info = zhecon( 'column-major', 'upper', N, A, N, IPIV, 1, anorm, rcond, WORK );
console.log( 'info:', info, 'rcond:', rcond[ 0 ] );

// Using the ndarray interface:
info = zhecon.ndarray( 'upper', N, A, 1, N, 0, IPIV, 1, 0, anorm, rcond, WORK, 1, 0 );
console.log( 'info:', info, 'rcond:', rcond[ 0 ] );
