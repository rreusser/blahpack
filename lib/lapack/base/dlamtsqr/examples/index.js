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
import { ndarray as dlatsqr } from './../../dlatsqr/lib/index.js';
import { ndarray as dlamtsqr } from './../lib/index.js';

// Build a tall 6-by-2 matrix and factor it with TSQR (row block size MB=3).
var M = 6;
var K = 2;
var MB = 3;
var NB = 2;

var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 0.5, 1.5, 2.5, 3.5, 4.5, 5.5 ] ); // eslint-disable-line max-len
var T = new Float64Array( NB * 2 * K );
var WORK = new Float64Array( NB * K );
var C = new Float64Array( M );

dlatsqr( M, K, MB, NB, A, 1, M, 0, T, 1, NB, 0, WORK, 1, 0 );

// Apply Q from the left to a 6-by-1 vector e1.
C[ 0 ] = 1.0;
dlamtsqr( 'left', 'no-transpose', M, 1, K, MB, NB, A, 1, M, 0, T, 1, NB, 0, C, 1, M, 0, WORK, 1, 0 ); // eslint-disable-line max-len
console.log( C ); // eslint-disable-line no-console
