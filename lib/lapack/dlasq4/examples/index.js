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
import dlasq4 from './../lib/index.js';

// Compute a shift for the next dqds step on a qd array of order 4 (pp = 0):
const z = new Float64Array( [ 4.0, 4.0, 1.0, 1.0, 3.0, 3.0, 0.5, 0.5, 2.0, 2.0, 0.3, 0.3, 1.0, 1.0, 0.0, 0.0 ] );
const tau = new Float64Array( 1 );
const ttype = new Int32Array( 1 );
const g = new Float64Array( 1 );

tau[ 0 ] = 0.0;
ttype[ 0 ] = 0;
g[ 0 ] = 0.0;

// Using the standard interface:
dlasq4( 1, 4, z, 1, 0, 4, 1.0, 2.0, 3.0, 1.0, 2.0, 3.0, tau, ttype, g );
let out = {
	'tau': tau[ 0 ],
	'ttype': ttype[ 0 ],
	'g': g[ 0 ]
};
console.log( out );

// Using the ndarray interface:
tau[ 0 ] = 0.0;
ttype[ 0 ] = 0;
g[ 0 ] = 0.0;
dlasq4.ndarray( 1, 4, z, 1, 0, 0, 4, 1.0, 2.0, 3.0, 1.0, 2.0, 3.0, tau, ttype, g );
out = {
	'tau': tau[ 0 ],
	'ttype': ttype[ 0 ],
	'g': g[ 0 ]
};
console.log( out );
