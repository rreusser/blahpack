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

import discreteUniform from '@stdlib/random/array/discrete-uniform/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgelqt3 from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};

var M = 3;
var N = 5;
var A = discreteUniform( M * N, -5, 5, opts );
var T = new Float64Array( M * M );

// Recursively factor A as L * Q with the compact-WY representation:
var info = dgelqt3( 'column-major', M, N, A, M, T, M );

console.log( 'info = ' + info ); // eslint-disable-line no-console
console.log( A ); // eslint-disable-line no-console
console.log( T ); // eslint-disable-line no-console
