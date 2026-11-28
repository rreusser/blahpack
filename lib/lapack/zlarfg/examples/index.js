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
import zlarfg from './../lib/index.js';

// Generate an elementary reflector H such that H^H * [alpha; x] = [beta; 0]:
const N = 3;
let alpha = new Complex128Array( [ 3.0, 1.0 ] );
let x = new Complex128Array( [ 1.0, -2.0, 4.0, 0.5 ] );
let tau = new Complex128Array( 1 );

// Using the standard interface:
zlarfg( N, alpha, x, 1, tau );
console.log( reinterpret( alpha, 0 ), reinterpret( x, 0 ), reinterpret( tau, 0 ) ); // eslint-disable-line no-console

// Using the strided interface:
alpha = new Complex128Array( [ 3.0, 1.0 ] );
x = new Complex128Array( [ 1.0, -2.0, 4.0, 0.5 ] );
tau = new Complex128Array( 1 );
zlarfg.strided( N, alpha, 0, x, 1, 0, tau, 0 );
console.log( reinterpret( alpha, 0 ), reinterpret( x, 0 ), reinterpret( tau, 0 ) ); // eslint-disable-line no-console
