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
import dlatrs3 from './../lib/index.js';

// Upper triangular A (column-major): A = [[2,1,1],[0,3,2],[0,0,4]]
var A = new Float64Array( [ 2.0, 0.0, 0.0, 1.0, 3.0, 0.0, 1.0, 2.0, 4.0 ] );

// Three right-hand sides stored as columns of X (column-major, LDX=3):

// B = [[1,4,7],[2,5,8],[3,6,9]]
var X = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0 ] );

var scale = new Float64Array( 3 );
var cnorm = new Float64Array( 3 );

// Workspace: nba*max(nba, min(nrhs, 32)) + nba*nba + 40 (here nba=1).
var work = new Float64Array( 1 + 1 + 40 );

var info = dlatrs3( 'column-major', 'upper', 'no-transpose', 'non-unit', 'no', 3, 3, A, 3, X, 3, scale, 1, cnorm, 1, work, 1 );

console.log( 'info: %d', info ); // eslint-disable-line no-console
console.log( 'X: %s', X ); // eslint-disable-line no-console
console.log( 'scale: %s', scale ); // eslint-disable-line no-console
