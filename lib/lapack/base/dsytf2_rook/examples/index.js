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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytf2Rook from './../lib/index.js';

var N = 4;
var A = new Float64Array([
	2,
	-1,
	0,
	0,
	0,
	2,
	-1,
	0,
	0,
	0,
	2,
	-1,
	0,
	0,
	0,
	2
]);
var IPIV = new Int32Array( N );

// Using the standard interface:
var info = dsytf2Rook( 'column-major', 'lower', N, A, N, IPIV, 1, 0 );
console.log( info );

// Using the ndarray interface:
info = dsytf2Rook.ndarray( 'lower', N, A, 1, N, 0, IPIV, 1, 0 );
console.log( info );
