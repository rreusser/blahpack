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

import zlaesy from './../lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';

// Using the standard interface:
const rt1 = new Complex128Array( 1 );
const rt1v = reinterpret( rt1, 0 );
const rt2 = new Complex128Array( 1 );
const rt2v = reinterpret( rt2, 0 );
const evscal = new Complex128Array( 1 );
const evscalv = reinterpret( evscal, 0 );
const cs1 = new Complex128Array( 1 );
const cs1v = reinterpret( cs1, 0 );
const sn1 = new Complex128Array( 1 );
const sn1v = reinterpret( sn1, 0 );

zlaesy( 1, 1, 1.0, rt1, rt2, evscal, cs1, sn1 );
let out = {
	'rt1r': rt1v[ 0 ],
	'rt1i': rt1v[ 1 ],
	'rt2r': rt2v[ 0 ],
	'rt2i': rt2v[ 1 ],
	'evscalr': evscalv[ 0 ],
	'evscali': evscalv[ 1 ],
	'cs1r': cs1v[ 0 ],
	'cs1i': cs1v[ 1 ],
	'sn1r': sn1v[ 0 ],
	'sn1i': sn1v[ 1 ]
};
console.log( out );

// Using the ndarray interface:
zlaesy.ndarray( 1, 1, 1.0, rt1, 0, rt2, 0, evscal, 0, cs1, 0, sn1, 0 );
out = {
	'rt1r': rt1v[ 0 ],
	'rt1i': rt1v[ 1 ],
	'rt2r': rt2v[ 0 ],
	'rt2i': rt2v[ 1 ],
	'evscalr': evscalv[ 0 ],
	'evscali': evscalv[ 1 ],
	'cs1r': cs1v[ 0 ],
	'cs1i': cs1v[ 1 ],
	'sn1r': sn1v[ 0 ],
	'sn1i': sn1v[ 1 ]
};
console.log( out );
