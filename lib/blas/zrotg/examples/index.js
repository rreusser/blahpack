/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zrotg from './../lib/index.js';

// Generate a complex Givens rotation which zeros `b` in [ a; b ] = [ 3; 4 ]:

// Using the standard interface:
let a = new Complex128Array( [ 3.0, 0.0 ] );
let b = new Complex128Array( [ 4.0, 0.0 ] );
let c = new Float64Array( 1 );
let s = new Complex128Array( 1 );
zrotg( a, b, c, s );
console.log( reinterpret( a, 0 ), c, reinterpret( s, 0 ) ); // eslint-disable-line no-console
// => r = 5, c = 0.6, s = 0.8

// Using the ndarray interface:
a = new Complex128Array( [ 3.0, 0.0 ] );
b = new Complex128Array( [ 4.0, 0.0 ] );
c = new Float64Array( 1 );
s = new Complex128Array( 1 );
zrotg.ndarray( a, 0, b, 0, c, 0, s, 0 );
console.log( reinterpret( a, 0 ), c, reinterpret( s, 0 ) ); // eslint-disable-line no-console
