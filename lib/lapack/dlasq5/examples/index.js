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
import dlasq5 from './../lib/index.js';

// Apply one dqds (zero shift) transform to a qd array of order 4 (ping-pong layout, pp = 0):
const z = new Float64Array( [ 4.0, 4.0, 1.0, 1.0, 3.0, 3.0, 0.5, 0.5, 2.0, 2.0, 0.3, 0.3, 1.0, 1.0, 0.0, 0.0 ] );
const dmin = new Float64Array( 1 );
const dmin1 = new Float64Array( 1 );
const dmin2 = new Float64Array( 1 );
const dn = new Float64Array( 1 );
const dnm1 = new Float64Array( 1 );
const dnm2 = new Float64Array( 1 );

// Using the standard interface:
dlasq5( 1, 4, z, 1, 0, 0.0, 0.0, dmin, dmin1, dmin2, dn, dnm1, dnm2, true, 2.220446049250313e-16 );
let out = {
	'dmin': dmin[ 0 ],
	'dmin1': dmin1[ 0 ],
	'dmin2': dmin2[ 0 ],
	'dn': dn[ 0 ],
	'dnm1': dnm1[ 0 ],
	'dnm2': dnm2[ 0 ]
};
console.log( out );

// Using the ndarray interface:
dlasq5.ndarray( 1, 4, z, 1, 0, 0, 0.0, 0.0, dmin, dmin1, dmin2, dn, dnm1, dnm2, true, 2.220446049250313e-16 );
out = {
	'dmin': dmin[ 0 ],
	'dmin1': dmin1[ 0 ],
	'dmin2': dmin2[ 0 ],
	'dn': dn[ 0 ],
	'dnm1': dnm1[ 0 ],
	'dnm2': dnm2[ 0 ]
};
console.log( out );
