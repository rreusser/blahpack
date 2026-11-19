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
import dlartg from './../lib/index.js';

// Using the standard interface:
const c = new Float64Array( 1 );
const s = new Float64Array( 1 );
const r = new Float64Array( 1 );

dlartg( 1, 1, c, s, r );
let out = new Float64Array( [ c[ 0 ], s[ 0 ], r[ 0 ] ] );
console.log( out );

// Using the ndarray interface:
dlartg.ndarray( 1, 1, c, s, r );
out = new Float64Array( [ c[ 0 ], s[ 0 ], r[ 0 ] ] );
console.log( out );
