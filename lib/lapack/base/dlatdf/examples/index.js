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
import dlatdf from './../lib/index.js';

const N = 3;

// LU-factor a nonsingular 3-by-3 matrix (column-major) with complete pivoting:
const Z = new Float64Array( [ 4.0, 1.0, 2.0, 1.0, 5.0, 1.0, 2.0, 1.0, 6.0 ] );
const IPIV = new Int32Array( N );
const JPIV = new Int32Array( N );
dgetc2( 'column-major', N, Z, N, IPIV, 1, JPIV, 1 );

const rdsum = new Float64Array( 1 );
const rdscal = new Float64Array( 1 );

// Using the standard interface:
let RHS = new Float64Array( [ 1.0, 2.0, 3.0 ] );
rdsum[ 0 ] = 1.0;
rdscal[ 0 ] = 1.0;
dlatdf( 'column-major', 1, N, Z, N, RHS, 1, rdsum, rdscal, IPIV, 1, JPIV, 1 );
let out = {
	'RHS': RHS,
	'rdsum': rdsum[ 0 ],
	'rdscal': rdscal[ 0 ]
};
console.log( out );

// Using the ndarray interface:
RHS = new Float64Array( [ 1.0, 2.0, 3.0 ] );
rdsum[ 0 ] = 1.0;
rdscal[ 0 ] = 1.0;
dlatdf.ndarray( 1, N, Z, 1, N, 0, RHS, 1, 0, rdsum, rdscal, IPIV, 1, 0, JPIV, 1, 0 );
out = {
	'RHS': RHS,
	'rdsum': rdsum[ 0 ],
	'rdscal': rdscal[ 0 ]
};
console.log( out );
