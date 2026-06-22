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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarzt from './../lib/index.js';

var K = 2;
var N = 5;

var V = new Complex128Array([
	0.3,
	0.1,
	-0.5,
	0.2,
	0.7,
	-0.4,
	0.0,
	0.0,
	0.0,
	0.0,
	0.1,
	0.6,
	0.4,
	-0.3,
	-0.2,
	0.5,
	0.0,
	0.0,
	0.0,
	0.0
]);
var TAU = new Complex128Array( [ 0.8, -0.3, 0.5, 0.2 ] );
var T = new Complex128Array( K * K );

zlarzt.ndarray( 'backward', 'rowwise', N, K, V, 1, K, 0, TAU, 1, 0, T, 1, K, 0 );

console.log( reinterpret( T, 0 ) ); // eslint-disable-line no-console
