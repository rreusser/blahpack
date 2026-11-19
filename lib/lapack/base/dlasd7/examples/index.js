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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlasd7 from './../lib/index.js';


const N = 7;
const d = new Float64Array( [ 1.0, 3.0, 5.0, 0.0, 2.0, 4.0, 6.0 ] );
const z = new Float64Array( N );
const ZW = new Float64Array( N );
const VF = new Float64Array( [ 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7 ] );
const VFW = new Float64Array( N );
const VL = new Float64Array( [ 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1 ] );
const VLW = new Float64Array( N );
const DSIGMA = new Float64Array( N );
const IDX = new Int32Array( N );
const IDXP = new Int32Array( N );
const IDXQ = new Int32Array( [ 1, 2, 3, 0, 1, 2, 3 ] );
const PERM = new Int32Array( N );
const GIVCOL = new Int32Array( 2 * N );
const GIVNUM = new Float64Array( 2 * N );

// Using the standard interface:
dlasd7( 'column-major', 1, 3, 3, 0, k, d, 1, z, 1, ZW, 1, VF, 1, VFW, 1, VL, 1, VLW, 1, 0.5, 0.3, DSIGMA, 1, IDX, 1, IDXP, 1, IDXQ, 1, PERM, 1, givptr, GIVCOL, N, GIVNUM, N, c, s );
console.log( out );
console.log( DSIGMA );
