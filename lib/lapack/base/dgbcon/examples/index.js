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
import dgbtrf from './../../dgbtrf/lib/index.js';
import dgbcon from './../lib/index.js';

// 4x4 tridiagonal matrix (kl=ku=1) in column-major band storage with LDAB = 2*kl+ku+1 = 4:
const N = 4;
const kl = 1;
const ku = 1;
const LDAB = 4;
const anorm = 6.0; // 1-norm of the original matrix

// Using the standard interface:
let AB = new Float64Array( [
	0.0, 0.0, 4.0, -1.0,
	0.0, -1.0, 4.0, -1.0,
	0.0, -1.0, 4.0, -1.0,
	0.0, -1.0, 4.0, 0.0
] );
let IPIV = new Int32Array( N );
const rcond = new Float64Array( 1 );
dgbtrf( 'column-major', N, N, kl, ku, AB, LDAB, IPIV, 1 );
let info = dgbcon( 'column-major', 'one-norm', N, kl, ku, AB, LDAB, IPIV, 1, anorm, rcond, null, null );
console.log( info, rcond[ 0 ] ); // eslint-disable-line no-console

// Using the ndarray interface:
AB = new Float64Array( [
	0.0, 0.0, 4.0, -1.0,
	0.0, -1.0, 4.0, -1.0,
	0.0, -1.0, 4.0, -1.0,
	0.0, -1.0, 4.0, 0.0
] );
IPIV = new Int32Array( N );
const WORK = new Float64Array( 3 * N );
const IWORK = new Int32Array( N );
dgbtrf.ndarray( N, N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0 );
info = dgbcon.ndarray( 'one-norm', N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0, anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );
console.log( info, rcond[ 0 ] ); // eslint-disable-line no-console
