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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlartg from './../lib/index.js';

// Generate a plane rotation such that [ c s; -conj(s) c ] * [ f; g ] = [ r; 0 ]:
const f = new Complex128Array( [ 3.0, 1.0 ] );
const g = new Complex128Array( [ 4.0, -2.0 ] );
const c = new Float64Array( 1 );
const s = new Complex128Array( 1 );
const r = new Complex128Array( 1 );

// Using the standard interface:
zlartg( f, g, c, s, r );
console.log( c[ 0 ], reinterpret( s, 0 ), reinterpret( r, 0 ) ); // eslint-disable-line no-console

// Using the strided interface:
zlartg.strided( f, 0, g, 0, c, 0, s, 0, r, 0 );
console.log( c[ 0 ], reinterpret( s, 0 ), reinterpret( r, 0 ) ); // eslint-disable-line no-console
