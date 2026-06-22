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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarfgp from './../lib/index.js';

var alpha = new Float64Array( [ 3.0 ] );
var x = new Float64Array( [ 4.0, 0.0, 0.0 ] );
var tau = new Float64Array( 1 );

// Compute the reflector so that applying H to ( alpha, x ) gives ( beta, 0 ) with beta >= 0:
dlarfgp( 4, alpha, 0, x, 1, tau, 0 );

console.log( 'beta = %d', alpha[ 0 ] ); // eslint-disable-line no-console
console.log( 'tau  = %d', tau[ 0 ] ); // eslint-disable-line no-console
console.log( 'v    =', x ); // eslint-disable-line no-console
