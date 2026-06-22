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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zppsv from './../lib/index.js';

/*
* Solve a 3x3 Hermitian positive definite system A*X = B using upper packed storage:
* A = [10  3-i  1+2i;  3+i  8  2-i;  1-2i  2+i  6]
* Upper packed (column-major): [10, 3-i, 8, 1+2i, 2-i, 6]
* B = (1+i, 2-i, 3+0.5i)
*/

var AP = new Complex128Array( [ 10.0, 0.0, 3.0, -1.0, 8.0, 0.0, 1.0, 2.0, 2.0, -1.0, 6.0, 0.0 ] ); // eslint-disable-line max-len
var B = new Complex128Array( [ 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );

var info = zppsv.ndarray( 'upper', 3, 1, AP, 1, 0, B, 1, 3, 0 );
console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'Solution X:', B ); // eslint-disable-line no-console
