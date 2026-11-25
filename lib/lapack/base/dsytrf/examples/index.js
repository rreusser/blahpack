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
import dsytrf from './../lib/index.js';

const N = 3;

// Symmetric indefinite matrix:
let A = new Float64Array( [ 1.0, 2.0, 3.0, 2.0, -4.0, 5.0, 3.0, 5.0, 6.0 ] );
let IPIV = new Int32Array( N );

// Using the standard interface:
let info = dsytrf( 'row-major', 'upper', N, A, N, IPIV, 1, null );
console.log( info ); // eslint-disable-line no-console
console.log( A ); // eslint-disable-line no-console
console.log( IPIV ); // eslint-disable-line no-console

// Using the ndarray interface:
A = new Float64Array( [ 1.0, 2.0, 3.0, 2.0, -4.0, 5.0, 3.0, 5.0, 6.0 ] );
IPIV = new Int32Array( N );
info = dsytrf.ndarray( 'upper', N, A, N, 1, 0, IPIV, 1, 0, new Float64Array( Math.max( 1, N * 32 ) ), 1, 0 );
console.log( info ); // eslint-disable-line no-console
console.log( A ); // eslint-disable-line no-console
console.log( IPIV ); // eslint-disable-line no-console
