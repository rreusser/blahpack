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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zpbequ from './../lib/index.js';

// Hermitian positive definite tridiagonal matrix A = [ 400, 1-i, 0; 1+i, 5, 0.2i; 0, -0.2i, 0.06 ]
// stored in upper band format (kd = 1, LDAB = 2, column-major):
const N = 3;
const kd = 1;
const LDAB = kd + 1;
const AB = new Complex128Array( [ 0.0, 0.0, 400.0, 0.0, 1.0, -1.0, 5.0, 0.0, 0.0, 0.2, 0.06, 0.0 ] );

const s = new Float64Array( N );
const scond = new Float64Array( 1 );
const amax = new Float64Array( 1 );

// Using the standard interface (compute scale factors s[i] = 1/sqrt(A[i,i])):
let out = {
	'info': zpbequ( 'column-major', 'upper', N, kd, AB, LDAB, s, 1, scond, amax ),
	's': Array.prototype.slice.call( s ),
	'scond': scond[ 0 ],
	'amax': amax[ 0 ]
};
console.log( out );

// Using the ndarray interface:
out = {
	'info': zpbequ.ndarray( 'upper', N, kd, AB, 1, LDAB, 0, s, 1, 0, scond, amax ),
	's': Array.prototype.slice.call( s ),
	'scond': scond[ 0 ],
	'amax': amax[ 0 ]
};
console.log( out );
