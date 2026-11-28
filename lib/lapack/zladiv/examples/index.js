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
import zladiv from './../lib/index.js';

// Compute (1+2i) / (3-4i):
const x = new Complex128Array( [ 1.0, 2.0 ] );
const y = new Complex128Array( [ 3.0, -4.0 ] );
const out = new Complex128Array( 1 );

// Using the standard interface:
zladiv( x, y, out );
console.log( reinterpret( out, 0 ) ); // eslint-disable-line no-console

// Using the strided interface (operands stored at complex offsets):
const xs = new Complex128Array( [ 0.0, 0.0, 1.0, 2.0 ] );
const ys = new Complex128Array( [ 3.0, -4.0 ] );
const outs = new Complex128Array( 2 );
zladiv.strided( xs, 1, ys, 0, outs, 1 );
console.log( reinterpret( outs, 0 ) ); // eslint-disable-line no-console
