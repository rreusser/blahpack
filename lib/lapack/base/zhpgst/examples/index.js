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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpptrf from '../../zpptrf/lib/index.js';
import zhpgst from './../lib/index.js';

// Hermitian positive-definite B (2x2), upper packed: b11, b12, b22
var BP = new Complex128Array( [ 4, 0, 1, 2, 10, 0 ] );
var AP = new Complex128Array( [ 5, 0, 1, -1, 3, 0 ] );
var info;

zpptrf( 'upper', 2, BP );

info = zhpgst( 1, 'upper', 2, AP, BP );
console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'AP (interleaved):', reinterpret( AP, 0 ) ); // eslint-disable-line no-console
