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
import dlarrc from './../lib/index.js';

const eigcnt = new Int32Array( 1 );
const lcnt = new Int32Array( 1 );
const rcnt = new Int32Array( 1 );

// Symmetric tridiagonal matrix T = tridiag( 1, 2, 1 ), with eigenvalues 2 - sqrt(2), 2, 2 + sqrt(2):
const N = 3;
const D = new Float64Array( [ 2.0, 2.0, 2.0 ] );
const E = new Float64Array( [ 1.0, 1.0 ] );

// Using the standard interface:
let out = {
	'info': dlarrc( 'tridiagonal', N, 0.0, 2.5, D, 1, E, 1, 1.0e-300, eigcnt, lcnt, rcnt ),
	'eigcnt': eigcnt[ 0 ],
	'lcnt': lcnt[ 0 ],
	'rcnt': rcnt[ 0 ]
};
console.log( out );

// Using the strided interface:
out = {
	'info': dlarrc.strided( 'tridiagonal', N, 0.0, 2.5, D, 1, 0, E, 1, 0, 1.0e-300, eigcnt, lcnt, rcnt ),
	'eigcnt': eigcnt[ 0 ],
	'lcnt': lcnt[ 0 ],
	'rcnt': rcnt[ 0 ]
};
console.log( out );
