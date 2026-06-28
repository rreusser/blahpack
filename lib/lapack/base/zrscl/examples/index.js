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
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zrscl from './../lib/index.js';

var view;
var x;
var a;

x = new Complex128Array( [ 6.0, 8.0, 12.0, 16.0 ] );
a = new Complex128( 2.0, 0.0 );

zrscl( 2, a, x, 1 );

view = reinterpret( x, 0 );
console.log( 'Result: [%s]', view.join( ', ' ) ); // eslint-disable-line no-console
// => Result: [3, 4, 6, 8]
