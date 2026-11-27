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
* @module @rreusser/blahpack/lapack/base/dgelqt3
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dgelqt3 from '@rreusser/blahpack/lapack/base/dgelqt3';
*
* var A = new Float64Array( [ 2.0, 0.5, 1.0, 3.0, 0.5, 1.5 ] );
* var T = new Float64Array( 4 );
*
* dgelqt3( 'column-major', 2, 3, A, 2, T, 2 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgelqt3 from './dgelqt3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgelqt3, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dgelqt3 & { ndarray: typeof ndarray }} */ ( dgelqt3 );
export { ndarray };
