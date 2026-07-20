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
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import zhsein from './../lib/index.js';

// Upper-triangular complex Hessenberg H (2-by-2, column-major) with eigenvalues 1 and 2:
const N = 2;
const H = new Complex128Array([ 1.0, 0.0, 0.0, 0.0, 0.5, 0.0, 2.0, 0.0 ]);

// Known eigenvalues (the diagonal of H):
const w = new Complex128Array([ 1.0, 0.0, 2.0, 0.0 ]);

// Compute the right eigenvector for every eigenvalue:
const SELECT = new Uint8Array([ 1, 1 ]);
const VL = new Complex128Array( N * N );
const VR = new Complex128Array( N * N );
const WORK = new Complex128Array( N * N );
const RWORK = new Float64Array( N );
const IFAILL = new Int32Array( N );
const IFAILR = new Int32Array( N );
const M = new Int32Array([ 0 ]);

const out = zhsein( 'column-major', 'right', 'no', 'no', SELECT, 1, N, H, N, w, 1, VL, N, VR, N, N, M, WORK, 1, RWORK, 1, IFAILL, 1, 0, IFAILR, 1, 0 );

console.log( 'info: %d, m: %d', out.info, out.m ); // eslint-disable-line no-console
