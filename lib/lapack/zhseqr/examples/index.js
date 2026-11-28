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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhseqr from './../lib/index.js';

const N = 3;

// 3x3 complex upper Hessenberg matrix H (column-major, interleaved real/imaginary parts):
const Hvals = [ 4.0, 1.0, 1.0, 0.0, 0.0, 0.0, 2.0, -1.0, 3.0, 0.5, 0.5, 0.0, -1.0, 0.0, 1.0, 1.0, 2.0, -1.0 ];

// Note: `ilo` and `ihi` are 1-based for this routine.

// Using the standard interface:
let H = new Complex128Array( Hvals );
let w = new Complex128Array( N );
let Z = new Complex128Array( N * N );
let info = zhseqr( 'column-major', 'schur', 'initialize', N, 1, N, H, N, w, 1, Z, N, null );
console.log( info );
console.log( reinterpret( w, 0 ) );

// Using the strided interface:
H = new Complex128Array( Hvals );
w = new Complex128Array( N );
Z = new Complex128Array( N * N );
const WORK = new Complex128Array( N );
info = zhseqr.strided( 'schur', 'initialize', N, 1, N, H, 1, N, 0, w, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
console.log( info );
console.log( reinterpret( w, 0 ) );
