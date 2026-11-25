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

import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarnv from './../lib/index.js';

const N = 5;
const iseed = new Int32Array( [ 1, 2, 3, 5 ] ); // ISEED(4) must be odd
const x = new Float64Array( N );

// Using the standard interface (uniform (0,1) distribution):
dlarnv( 1, iseed, 1, N, x, 1 );
console.log( x ); // eslint-disable-line no-console

// Using the ndarray interface (normal (0,1) distribution):
dlarnv.ndarray( 3, iseed, 1, 0, N, x, 1, 0 );
console.log( x ); // eslint-disable-line no-console
