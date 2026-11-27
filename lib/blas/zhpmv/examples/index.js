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
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhpmv from './../lib/index.js';

// Perform y = alpha*A*x + beta*y for a 2x2 Hermitian matrix A in packed (upper) storage:
const AP = new Complex128Array( [ 1.0, 0.0, 2.0, 1.0, 3.0, 0.0 ] );
const x = new Complex128Array( [ 1.0, 0.0, 1.0, 0.0 ] );
const alpha = new Complex128( 1.0, 0.0 );
const beta = new Complex128( 0.0, 0.0 );

// Using the standard interface:
let y = new Complex128Array( 2 );
zhpmv( 'column-major', 'upper', 2, alpha, AP, x, 1, beta, y, 1 );
console.log( reinterpret( y, 0 ) ); // eslint-disable-line no-console

// Using the ndarray interface:
y = new Complex128Array( 2 );
zhpmv.ndarray( 'upper', 2, alpha, AP, 1, 0, x, 1, 0, beta, y, 1, 0 );
console.log( reinterpret( y, 0 ) ); // eslint-disable-line no-console
