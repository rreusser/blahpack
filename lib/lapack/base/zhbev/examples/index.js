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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhbev from './../lib/index.js';

// 4x4 Hermitian tridiagonal (KD=1), lower band, column-major:
var RWORK = new Float64Array( 10 );
var WORK = new Complex128Array( 4 );
var AB = new Complex128Array( 2 * 4 );
var ABv = reinterpret( AB, 0 );
var W = new Float64Array( 4 );
var Z = new Complex128Array( 16 );
var info;

// Col 1: diag=4, subdiag=(1+i)
ABv[ 0 ] = 4.0;
ABv[ 2 ] = 1.0;
ABv[ 3 ] = 1.0;

// Col 2: diag=5, subdiag=(2-i)
ABv[ 4 ] = 5.0;
ABv[ 6 ] = 2.0;
ABv[ 7 ] = -1.0;

// Col 3: diag=6, subdiag=(3+i)
ABv[ 8 ] = 6.0;
ABv[ 10 ] = 3.0;
ABv[ 11 ] = 1.0;

// Col 4: diag=7
ABv[ 12 ] = 7.0;

info = zhbev( 'column-major', 'compute-vectors', 'lower', 4, 1, AB, 2, W, 1, Z, 4, WORK, 1, RWORK, 1 ); // eslint-disable-line max-len

console.log( 'info:', info );       // eslint-disable-line no-console
console.log( 'Eigenvalues:', W );   // eslint-disable-line no-console
