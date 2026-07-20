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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqtr from './../lib/index.js';

// Upper quasi-triangular matrix T (4-by-4, column-major); the leading 3-by-3 block is used:
const T = new Float64Array([
	2.0, 0.0, 0.0, 0.0,
	1.0, 3.0, 0.0, 0.0,
	3.0, -1.0, 4.0, 0.0,
	0.0, 0.0, 0.0, 0.0
]);

// Second right-hand side (imaginary part); unused in the real case (`lreal = true`):
const b = new Float64Array( 4 );

// Right-hand side on entry; overwritten with the solution on exit:
const x = new Float64Array([ 10.0, 5.0, 8.0, 0.0, 0.0, 0.0, 0.0, 0.0 ]);

const WORK = new Float64Array( 8 );

// Solve T * x = scale * x for the real case (no transpose, real shift w = 0):
const out = dlaqtr( 'column-major', false, true, 3, T, 4, b, 1, 0.0, x, 1, WORK, 1 );

console.log( 'info: %d, scale: %d', out.info, out.scale ); // eslint-disable-line no-console
console.log( 'x: [ %s ]', Array.prototype.slice.call( x, 0, 3 ).join( ', ' ) ); // eslint-disable-line no-console
