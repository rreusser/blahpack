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
import dhseqr from './../lib/index.js';

const N = 3;

// 3x3 upper Hessenberg matrix H (column-major):
const Hvals = [ 4.0, 1.0, 0.0, 2.0, 3.0, 0.5, -1.0, 1.0, 2.0 ];

// Note: `ilo` and `ihi` are 1-based for this routine.

// Using the standard interface:
let H = new Float64Array( Hvals );
let WR = new Float64Array( N );
let WI = new Float64Array( N );
let Z = new Float64Array( N * N );
let info = dhseqr( 'column-major', 'schur', 'initialize', N, 1, N, H, N, WR, 1, WI, 1, Z, N, null );
console.log( info );
console.log( WR, WI );

// Using the strided interface:
H = new Float64Array( Hvals );
WR = new Float64Array( N );
WI = new Float64Array( N );
Z = new Float64Array( N * N );
const WORK = new Float64Array( N );
info = dhseqr.strided( 'schur', 'initialize', N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
console.log( info );
console.log( WR, WI );
