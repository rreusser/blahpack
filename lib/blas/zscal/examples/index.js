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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zscal from './../lib/index.js';

// Scale a complex vector by a complex constant:
const alpha = new Complex128( 2.0, 0.0 );

// Using the standard interface:
let x = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
zscal( 2, alpha, x, 1 );
console.log( reinterpret( x, 0 ) ); // eslint-disable-line no-console
// => <Float64Array>[ 2.0, 4.0, 6.0, 8.0 ]

// Using the ndarray interface:
x = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
zscal.ndarray( 2, alpha, x, 1, 0 );
console.log( reinterpret( x, 0 ) ); // eslint-disable-line no-console
// => <Float64Array>[ 2.0, 4.0, 6.0, 8.0 ]
