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
