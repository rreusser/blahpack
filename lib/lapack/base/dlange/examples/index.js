/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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
import dlange from './../lib/index.js';

var frobNorm;
var maxNorm;
var oneNorm;
var infNorm;
var WORK;
var A;

// 3x4 column-major matrix:

// A = [  1.0  -4.0   7.0  -2.0 ]

//     [ -3.0   5.0  -8.0   6.0 ]

//     [  2.0  -1.0   9.0  -3.0 ]
A = new Float64Array([
	1.0,
	-3.0,
	2.0,
	-4.0,
	5.0,
	-1.0,
	7.0,
	-8.0,
	9.0,
	-2.0,
	6.0,
	-3.0
]);
WORK = new Float64Array( 3 );

// Max norm: largest absolute value
maxNorm = dlange( 'column-major', 'max', 3, 4, A, 3, WORK, 1 );
console.log( 'Max norm: %d', maxNorm ); // eslint-disable-line no-console
// => Max norm: 9

// One norm: maximum column sum
oneNorm = dlange( 'column-major', 'one-norm', 3, 4, A, 3, WORK, 1 );
console.log( 'One norm: %d', oneNorm ); // eslint-disable-line no-console
// => One norm: 24

// Infinity norm: maximum row sum
infNorm = dlange( 'column-major', 'inf-norm', 3, 4, A, 3, WORK, 1 );
console.log( 'Infinity norm: %d', infNorm ); // eslint-disable-line no-console
// => Infinity norm: 22

// Frobenius norm: sqrt of sum of squares
frobNorm = dlange( 'column-major', 'frobenius', 3, 4, A, 3, WORK, 1 );
console.log( 'Frobenius norm: %d', frobNorm ); // eslint-disable-line no-console
// => Frobenius norm: 17.291616465790582
