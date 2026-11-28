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
import zlassq from './../lib/index.js';

const x = new Complex128Array( [ 3.0, 4.0, 1.0, -2.0, 0.0, 2.0 ] );
const N = x.length;

// Compute scl and sumsq such that scl^2 * sumsq = scale^2 * sumsq_in + sum( |x[i]|^2 ) = 34:
const scale = new Float64Array( 1 );
const sumsq = new Float64Array( 1 );

scale[ 0 ] = 1.0;
sumsq[ 0 ] = 0.0;

// Using the standard interface:
zlassq( N, x, 1, scale, sumsq );
let out = {
	'scl': scale[ 0 ],
	'sumsq': sumsq[ 0 ]
};
console.log( out );

// Using the strided interface:
scale[ 0 ] = 1.0;
sumsq[ 0 ] = 0.0;
zlassq.strided( N, x, 1, 0, scale, sumsq );
out = {
	'scl': scale[ 0 ],
	'sumsq': sumsq[ 0 ]
};
console.log( out );
