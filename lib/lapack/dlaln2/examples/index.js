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
import dlaln2 from './../lib/index.js';

const scale = new Float64Array( 1 );
const xnorm = new Float64Array( 1 );

// Solve ( ca*A - w*D ) * X = scale*B for a 2x2 system with real w (column-major):
const A = new Float64Array( [ 4.0, 1.0, 2.0, 3.0 ] );
const B = new Float64Array( [ 1.0, 2.0 ] );
const X = new Float64Array( 2 );
const smin = 1.0e-8;
const ca = 1.0;
const d1 = 1.0;
const d2 = 1.0;
const wr = 0.5;
const wi = 0.0;

// Using the standard interface:
let out = {
	'info': dlaln2( 'column-major', false, 2, 1, smin, ca, A, 2, d1, d2, B, 2, wr, wi, X, 2, scale, xnorm ),
	'scale': scale[ 0 ],
	'xnorm': xnorm[ 0 ]
};
console.log( out );
console.log( X );

// Using the strided interface:
out = {
	'info': dlaln2.strided( false, 2, 1, smin, ca, A, 1, 2, 0, d1, d2, B, 1, 2, 0, wr, wi, X, 1, 2, 0, scale, xnorm ),
	'scale': scale[ 0 ],
	'xnorm': xnorm[ 0 ]
};
console.log( out );
console.log( X );
