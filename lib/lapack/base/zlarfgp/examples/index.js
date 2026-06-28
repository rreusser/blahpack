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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarfgp from './../lib/index.js';

var alpha = new Complex128Array( [ 2.0, 1.0 ] );
var x = new Complex128Array( [ 1.0, -1.0, 0.5, 0.5 ] );
var tau = new Complex128Array( 1 );

// Compute the Householder reflector with non-negative beta:
zlarfgp( 3, alpha, 0, x, 1, tau, 0 );

console.log( 'beta =', reinterpret( alpha, 0 ) ); // eslint-disable-line no-console
console.log( 'tau  =', reinterpret( tau, 0 ) ); // eslint-disable-line no-console
console.log( 'v    =', reinterpret( x, 0 ) ); // eslint-disable-line no-console
