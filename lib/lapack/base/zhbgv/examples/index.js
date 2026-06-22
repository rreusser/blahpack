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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhbgv from './../lib/index.js';

// 3x3 diagonal Hermitian matrices (KA=KB=0), A = diag(5, 6, 7), B = diag(2, 3, 4):
var AB = new Complex128Array( 3 );
var BB = new Complex128Array( 3 );
var W = new Float64Array( 3 );
var Z = new Complex128Array( 9 );
var WORK = new Complex128Array( 3 );
var RWORK = new Float64Array( 9 );
var info;
var v;

v = reinterpret( AB, 0 );
v[ 0 ] = 5.0;
v[ 2 ] = 6.0;
v[ 4 ] = 7.0;

v = reinterpret( BB, 0 );
v[ 0 ] = 2.0;
v[ 2 ] = 3.0;
v[ 4 ] = 4.0;

info = zhbgv.ndarray( 'compute-vectors', 'upper', 3, 0, 0, AB, 1, 1, 0, BB, 1, 1, 0, W, 1, 0, Z, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'Eigenvalues (W):', W ); // eslint-disable-line no-console
