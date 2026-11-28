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
import zhpr from './../lib/index.js';

// Perform A = alpha*x*x^H + A for a 2x2 Hermitian matrix A in packed (upper) storage:
const x = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0 ] );

// Using the standard interface:
let AP = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
zhpr( 'column-major', 'upper', 2, 1.0, x, 1, AP );
console.log( reinterpret( AP, 0 ) ); // eslint-disable-line no-console

// Using the strided interface:
AP = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
zhpr.strided( 'upper', 2, 1.0, x, 1, 0, AP, 1, 0 );
console.log( reinterpret( AP, 0 ) ); // eslint-disable-line no-console
