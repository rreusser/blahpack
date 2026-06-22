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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlapll from './../lib/index.js';

// Parallel vectors (linearly dependent):
var x = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0 ] );
var y = new Complex128Array( [ 2.0, 4.0, 6.0, 8.0, 10.0, 12.0, 14.0, 16.0 ] );
var ssmin = new Float64Array( 1 );

zlapll( 4, x, 1, y, 1, ssmin );
console.log( 'Parallel vectors ssmin:', ssmin[ 0 ] ); // eslint-disable-line no-console

// Independent vectors:
x = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );
y = new Complex128Array( [ 0.0, 0.0, 1.0, 0.0, 0.0, 0.0 ] );

zlapll( 3, x, 1, y, 1, ssmin );
console.log( 'Orthogonal vectors ssmin:', ssmin[ 0 ] ); // eslint-disable-line no-console
