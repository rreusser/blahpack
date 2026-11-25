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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhetrf from './../../zhetrf/lib/index.js';
import zhetrs from './../../zhetrs/lib/index.js';
import zherfs from './../lib/index.js';

// 3x3 Hermitian matrix A (column-major) and right-hand side b = A*[1,1,1]:
const N = 3;
const nrhs = 1;
const A = new Complex128Array( [ 4.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 5.0, 0.0, 0.0, -2.0, 0.0, 0.0, 0.0, 2.0, 6.0, 0.0 ] ); // eslint-disable-line max-len
const B = new Complex128Array( [ 5.0, -1.0, 6.0, 3.0, 6.0, -2.0 ] );

// Factor A and solve A*X = B:
const AF = new Complex128Array( reinterpret( A, 0 ) );
const IPIV = new Int32Array( N );
zhetrf( 'column-major', 'upper', N, AF, N, IPIV, 1, null );
const X = new Complex128Array( reinterpret( B, 0 ) );
zhetrs( 'column-major', 'upper', N, nrhs, AF, N, IPIV, 1, X, N );

const FERR = new Float64Array( nrhs );
const BERR = new Float64Array( nrhs );
const WORK = new Complex128Array( 2 * N );
const RWORK = new Float64Array( N );

// Using the standard interface:
let info = zherfs( 'column-major', 'upper', N, nrhs, A, N, AF, N, IPIV, 1, B, N, X, N, FERR, 1, BERR, 1, WORK, RWORK );
console.log( 'info:', info, 'X:', reinterpret( X, 0 ), 'FERR:', FERR, 'BERR:', BERR );

// Using the ndarray interface:
info = zherfs.ndarray( 'upper', N, nrhs, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
console.log( 'info:', info, 'X:', reinterpret( X, 0 ), 'FERR:', FERR, 'BERR:', BERR );
