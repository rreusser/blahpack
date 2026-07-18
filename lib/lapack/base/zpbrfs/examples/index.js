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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpbrfs from './../lib/index.js';

// 3x3 HPD band matrix (upper, KD=1):
const AB = new Complex128Array( [ 0.0, 0.0, 4.0, 0.0, 1.0, 1.0, 5.0, 0.0, 2.0, -1.0, 6.0, 0.0 ] ); // eslint-disable-line max-len
const AFB = new Complex128Array( [ 0.0, 0.0, 2.0, 0.0, 0.5, 0.5, 2.12132034355964239, 0.0, 0.942809041582063467, -0.471404520791031734, 2.21108319357026639, 0.0 ] ); // eslint-disable-line max-len
const B = new Complex128Array( [ 4.0, 2.0, 10.0, 2.0, 13.0, 3.0 ] );
const X = new Complex128Array( [ 1.0, 0.0, 1.0, 1.0, 2.0, 0.0 ] );
const FERR = new Float64Array( 1 );
const BERR = new Float64Array( 1 );
const WORK = new Complex128Array( 6 );
const RWORK = new Float64Array( 3 );

const info = zpbrfs.ndarray( 'upper', 3, 1, 1, AB, 1, 2, 0, AFB, 1, 2, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
console.log( 'info:', info );
console.log( 'FERR:', FERR[ 0 ] );
console.log( 'BERR:', BERR[ 0 ] );
