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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpftrf from '../../zpftrf/lib/index.js';
import zpftri from './../lib/index.js';

// 3x3 HPD matrix in RFP format (TRANSR='no-transpose', UPLO='lower'):
var A = new Complex128Array([
	10.0,
	0.0,
	3.0,
	-1.0,
	1.0,
	2.0,
	6.0,
	0.0,
	8.0,
	0.0,
	2.0,
	-1.0
]);

// First, Cholesky-factorize the matrix:
var info = zpftrf( 'no-transpose', 'lower', 3, A, 1, 0 );
console.log( 'zpftrf info:', info ); // eslint-disable-line no-console

// Then, compute the inverse:
info = zpftri( 'no-transpose', 'lower', 3, A, 1, 0 );
console.log( 'zpftri info:', info ); // eslint-disable-line no-console
console.log( 'A (inverse in RFP):', reinterpret( A, 0 ) ); // eslint-disable-line no-console
