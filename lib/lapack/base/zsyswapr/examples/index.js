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
import discreteUniform from '@stdlib/random/array/discrete-uniform/lib/index.js';
import zsyswapr from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};
var N = 4;
var buf = discreteUniform( 2 * N * N, -10, 10, opts );
var A = new Complex128Array( buf.buffer );

// Swap rows/columns 0 and 2 of the complex symmetric matrix stored in the upper triangle:
zsyswapr( 'column-major', 'upper', N, A, N, 0, 2 );
console.log( A ); // eslint-disable-line no-console
