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

import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlasdt from './../lib/index.js';

// Build the divide-and-conquer computation tree for a bidiagonal matrix of order 20 (leaf size <= 5):
const N = 20;
const MSUB = 5;
const lvl = new Int32Array( 1 );
const nd = new Int32Array( 1 );
const INODE = new Int32Array( N );
const NDIML = new Int32Array( N );
const NDIMR = new Int32Array( N );

// Using the standard interface:
dlasdt( N, lvl, nd, INODE, 1, NDIML, 1, NDIMR, 1, MSUB );
console.log( lvl[ 0 ], nd[ 0 ], INODE.subarray( 0, nd[ 0 ] ), NDIML.subarray( 0, nd[ 0 ] ), NDIMR.subarray( 0, nd[ 0 ] ) ); // eslint-disable-line no-console

// Using the ndarray interface:
dlasdt.ndarray( N, lvl, nd, INODE, 1, 0, NDIML, 1, 0, NDIMR, 1, 0, MSUB );
console.log( lvl[ 0 ], nd[ 0 ], INODE.subarray( 0, nd[ 0 ] ), NDIML.subarray( 0, nd[ 0 ] ), NDIMR.subarray( 0, nd[ 0 ] ) ); // eslint-disable-line no-console
