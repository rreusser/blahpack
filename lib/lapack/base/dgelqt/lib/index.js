/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
* Compute a blocked LQ factorization of a real M-by-N matrix A using the compact WY representation of Q.
*
* @module @stdlib/lapack/base/dgelqt
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dgelqt = require( '@stdlib/lapack/base/dgelqt' );
*
* var A = new Float64Array( [ 3.0, 0.5, 0.6, 4.0, 0.4, 0.7, 0.2, 0.3 ] );
* var T = new Float64Array( 4 );
* var WORK = new Float64Array( 8 );
*
* dgelqt( 'column-major', 2, 4, 2, A, 2, T, 2, WORK );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dgelqt.ndarray" }
