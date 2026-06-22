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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsyconvf from './../lib/index.js';

var N = 3;
var A = new Complex128Array( N * N );
var E = new Complex128Array( N );
var IPIV = new Int32Array( [ 0, 1, 2 ] );

// Using the standard interface:
var out = zsyconvf( 'column-major', 'upper', 'convert', N, A, N, E, 1, IPIV, 1, 0 );
console.log( out ); // eslint-disable-line no-console

// Using the ndarray interface:
out = zsyconvf.ndarray( 'upper', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
console.log( out ); // eslint-disable-line no-console
