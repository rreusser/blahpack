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
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zrot from './../lib/index.js';

const N = 3;
const cx = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0, 1.0, 1.0 ] );
const cy = new Complex128Array( [ 0.0, 0.0, 1.0, 0.0, 0.0, -1.0 ] );

// Rotation with c = 0.6 and s = 0.8i (c^2 + |s|^2 = 1):
const s = new Complex128( 0.0, 0.8 );

// Using the standard interface:
let out = zrot( N, cx, 1, cy, 1, 0.6, s );
console.log( out );

// Using the ndarray interface:
out = zrot.ndarray( N, cx, 1, 0, cy, 1, 0, 0.6, s );
console.log( out );
