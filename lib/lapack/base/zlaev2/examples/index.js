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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zlaev2 from './../lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';

const rt1 = new Float64Array( 1 );
const rt2 = new Float64Array( 1 );
const cs1 = new Float64Array( 1 );
const sn1 = new Complex128Array( 1 );
const sn1v = reinterpret( sn1, 0 );

const a = new Complex128( 5.0, 0.0 );
const b = new Complex128( 1.0, 2.0 );
const c = new Complex128( 3.0, 0.0 );

zlaev2( a, b, c, rt1, rt2, cs1, sn1 );
console.log( 'rt1:', rt1[ 0 ] );
console.log( 'rt2:', rt2[ 0 ] );
console.log( 'cs1:', cs1[ 0 ] );
console.log( 'sn1:', sn1v[ 0 ], '+', sn1v[ 1 ], 'i' );
