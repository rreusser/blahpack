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

/* eslint-disable camelcase */

import uniform from '@stdlib/random/array/uniform/lib/index.js';
import dla_wwaddw from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};

var N = 5;
var x = uniform( N, -10.0, 10.0, opts );
var y = uniform( N, -1.0e-10, 1.0e-10, opts );
var w = uniform( N, -1.0, 1.0, opts );

dla_wwaddw( N, x, 1, y, 1, w, 1 );
console.log( x ); // eslint-disable-line no-console
console.log( y ); // eslint-disable-line no-console
