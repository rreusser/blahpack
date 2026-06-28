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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaein from './../lib/index.js';

// Upper-triangular 3x3 Hessenberg matrix with eigenvalues 2, 3, 4 on the diagonal (column-major):
var H = new Float64Array( [ 2.0, 0.0, 0.0, 1.0, 3.0, 0.0, 0.5, 1.0, 4.0 ] );

// Workspace:
var B = new Float64Array( 16 );
var WORK = new Float64Array( 3 );

// Initial vector (ignored when noinit = true):
var VR = new Float64Array( 3 );
var VI = new Float64Array( 3 );

// Machine constants (IEEE-754 double precision):
var EPS3 = 2.220446049250313e-13;
var SMLNUM = 2.2250738585072014e-305;
var BIGNUM = 4.494232837155789e+304;

// Compute the right eigenvector for the real eigenvalue wr = 3.0:
var info = dlaein( 'column-major', true, true, 3, H, 3, 3.0, 0.0, VR, 1, VI, 1, B, 4, WORK, 1, EPS3, SMLNUM, BIGNUM );
console.log( 'info = %d', info );
console.log( VR );

// Using the ndarray interface:
info = dlaein.ndarray( true, true, 3, H, 1, 3, 0, 3.0, 0.0, VR, 1, 0, VI, 1, 0, B, 1, 4, 0, WORK, 1, 0, EPS3, SMLNUM, BIGNUM );
console.log( 'info = %d', info );
console.log( VR );
