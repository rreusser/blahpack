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
import dlahqr from './../lib/index.js';

const N = 3;

// Upper Hessenberg matrix H (column-major) and Z = I:
let H = new Float64Array( [ 1.0, 4.0, 0.0, 2.0, 5.0, 7.0, 3.0, 6.0, 8.0 ] );
let Z = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
const WR = new Float64Array( N );
const WI = new Float64Array( N );

// Using the standard interface (ILO, IHI, ILOZ and IHIZ are 1-based):
let info = dlahqr( 'column-major', true, true, N, 1, N, H, N, WR, 1, WI, 1, 1, N, Z, N );
console.log( 'info = %d', info );
console.log( WR, WI );

// Using the ndarray interface:
H = new Float64Array( [ 1.0, 4.0, 0.0, 2.0, 5.0, 7.0, 3.0, 6.0, 8.0 ] );
Z = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
info = dlahqr.ndarray( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0 );
console.log( 'info = %d', info );
console.log( WR, WI );
