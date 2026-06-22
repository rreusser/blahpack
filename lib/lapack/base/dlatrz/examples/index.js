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
import dlatrz from './../lib/index.js';

var WORK2 = new Float64Array( 3 );
var WORK = new Float64Array( 3 );
var TAU2 = new Float64Array( 3 );
var TAU = new Float64Array( 3 );
var A2 = new Float64Array([
	4.0,
	0.0,
	0.0,
	1.0,
	5.0,
	0.0,
	2.0,
	1.0,
	6.0,
	3.0,
	2.0,
	1.0,
	1.0,
	4.0,
	2.0
]);
var A = new Float64Array([
	4.0,
	0.0,
	0.0,
	1.0,
	5.0,
	0.0,
	2.0,
	1.0,
	6.0,
	3.0,
	2.0,
	1.0,
	1.0,
	4.0,
	2.0
]);

// Using the standard interface:
dlatrz( 'column-major', 3, 5, 2, A, 3, TAU, 1, WORK, 1 );
console.log( TAU ); // eslint-disable-line no-console

// Using the ndarray interface:
dlatrz.ndarray( 3, 5, 2, A2, 1, 3, 0, TAU2, 1, 0, WORK2, 1, 0 );
console.log( TAU2 ); // eslint-disable-line no-console
