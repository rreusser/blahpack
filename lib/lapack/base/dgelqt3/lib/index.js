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

/**
* Recursively computes an LQ factorization of a real `M`-by-`N` matrix using the compact WY representation of `Q`.
*
* @module @stdlib/lapack/base/dgelqt3
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dgelqt3 = require( '@stdlib/lapack/base/dgelqt3' );
*
* var A = new Float64Array( [ 2.0, 0.5, 1.0, 3.0, 0.5, 1.5 ] );
* var T = new Float64Array( 4 );
*
* dgelqt3( 'column-major', 2, 3, A, 2, T, 2 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dgelqt3.ndarray" }
