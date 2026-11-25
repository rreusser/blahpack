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
import dgetc2 from './../../dgetc2/lib/index.js';
import dgesc2 from './../lib/index.js';

const N = 3;

// Column-major, nonsingular 3-by-3 matrix:
const A0 = [ 4.0, 1.0, 2.0, 1.0, 5.0, 1.0, 2.0, 1.0, 6.0 ];

// Factor A with complete pivoting:
const A = new Float64Array( A0 );
const IPIV = new Int32Array( N );
const JPIV = new Int32Array( N );
dgetc2( 'column-major', N, A, N, IPIV, 1, JPIV, 1 );
const scale = new Float64Array( 1 );

// Using the standard interface (solve A*x = scale*b):
let RHS = new Float64Array( [ 7.0, 7.0, 9.0 ] );
dgesc2( 'column-major', N, A, N, RHS, 1, IPIV, 1, JPIV, 1, scale );
console.log( RHS, scale ); // eslint-disable-line no-console

// Using the ndarray interface:
RHS = new Float64Array( [ 7.0, 7.0, 9.0 ] );
dgesc2.ndarray( N, A, 1, N, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, scale );
console.log( RHS, scale ); // eslint-disable-line no-console
