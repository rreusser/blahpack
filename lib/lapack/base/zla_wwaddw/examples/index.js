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

import uniform from '@stdlib/random/array/uniform/lib/index.js';
import zlaWwaddw from './../lib/index.js';

var opts = {
	'dtype': 'complex128'
};
var N = 3;
var x = uniform( N, -10.0, 10.0, opts );
var y = uniform( N, -10.0, 10.0, opts );
var w = uniform( N, -10.0, 10.0, opts );

// Using the standard interface:
zlaWwaddw( N, x, 1, y, 1, w, 1 );
console.log( x );

// Using the ndarray interface:
zlaWwaddw.ndarray( N, x, 1, 0, y, 1, 0, w, 1, 0 );
console.log( x );
