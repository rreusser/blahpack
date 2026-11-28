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
import dstein from './../lib/index.js';

// Symmetric tridiagonal matrix with diagonal `d` and subdiagonal `e`:
const N = 4;
const d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0 ] );
const e = new Float64Array( [ -1.0, -1.0, -1.0 ] );

// Eigenvalues (e.g., as computed by dstebz with order 'block'), all in a single block:
const M = 4;
const w = new Float64Array( [ 0.38196601125010476, 1.381966011250105, 2.6180339887498945, 3.6180339887498945 ] );
const IBLOCK = new Int32Array( [ 1, 1, 1, 1 ] );
const ISPLIT = new Int32Array( [ 4, 0, 0, 0 ] );
const WORK = new Float64Array( 5 * N );
const IWORK = new Int32Array( N );
const IFAIL = new Int32Array( M );
let Z = new Float64Array( N * M );

// Using the standard interface:
let info = dstein( 'column-major', N, d, 1, e, 1, M, w, 1, IBLOCK, 1, ISPLIT, 1, Z, N, WORK, IWORK, IFAIL, 1 );
console.log( info, Z );

// Using the ndarray interface:
Z = new Float64Array( N * M );
info = dstein.ndarray( N, d, 1, 0, e, 1, 0, M, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
console.log( info, Z );
