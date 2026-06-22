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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsptrf from '../../zsptrf/lib/base.js';
import zsptri from './../lib/base.js';

// 2x2 complex symmetric matrix (upper packed): A = [ 2+i, 1+2i; 1+2i, 3+i ]
var AP = new Complex128Array( [ 2.0, 1.0, 1.0, 2.0, 3.0, 1.0 ] );
var IPIV = new Int32Array( 2 );
var WORK = new Complex128Array( 2 );
var view;
var info;

// Factor
zsptrf( 'upper', 2, AP, 1, 0, IPIV, 1, 0 );

// Invert
info = zsptri( 'upper', 2, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
console.log( 'info:', info ); // eslint-disable-line no-console

view = reinterpret( AP, 0 );
console.log( 'inv(A) packed:', view ); // eslint-disable-line no-console
