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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztgevc from './../lib/index.js';

const N = 3;

// S: upper triangular (column-major):
const S = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.3, 0.1, 2.0, -1.0, 0.0, 0.0, 0.2, 0.0, 0.4, -0.2, 3.0, 0.0 ] );

// P: upper triangular with a real diagonal (column-major):
const P = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.0, 1.0, 0.0, 0.0, 0.0, 0.05, 0.1, 0.1, 0.0, 1.0, 0.0 ] );

const SELECT = new Uint8Array( N );
const M = new Int32Array( 1 );
const WORK = new Complex128Array( 2 * N );
const RWORK = new Float64Array( 2 * N );

// Using the standard interface:
let VL = new Complex128Array( N * N );
let VR = new Complex128Array( N * N );
let info = ztgevc( 'column-major', 'both', 'all', SELECT, 1, N, S, N, P, N, VL, N, VR, N, N, M, WORK, RWORK );
console.log( info ); // eslint-disable-line no-console
console.log( reinterpret( VR, 0 ) ); // eslint-disable-line no-console

// Using the ndarray interface:
VL = new Complex128Array( N * N );
VR = new Complex128Array( N * N );
info = ztgevc.ndarray( 'both', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, M, WORK, 1, 0, RWORK, 1, 0 );
console.log( info ); // eslint-disable-line no-console
console.log( reinterpret( VR, 0 ) ); // eslint-disable-line no-console
