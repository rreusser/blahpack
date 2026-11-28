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
* ## Notes
*
* -   `dgelqt` calls the recursive panel kernel `dgelqt3` and applies each panel's block reflector to the trailing matrix via `dlarfb` (side `'right'`, no-transpose, forward, rowwise storage).
* -   Unlike the Fortran reference, `mb` is exposed as an explicit parameter (no `ILAENV` query). Pass `mb = 32` for a typical default.
*
* @module @rreusser/blahpack/lapack/dgelqt
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dgelqt from '@rreusser/blahpack/lapack/dgelqt';
*
* var A = new Float64Array( [ 3.0, 0.5, 0.6, 4.0, 0.4, 0.7, 0.2, 0.3 ] );
* var T = new Float64Array( 4 );
* var WORK = new Float64Array( 8 );
*
* dgelqt( 'column-major', 2, 4, 2, A, 2, T, 2, WORK );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgelqt from './dgelqt.js';
import strided from './strided.js';


// MAIN //

setReadOnly( dgelqt, 'strided', strided );


// EXPORTS //

export default /** @type {typeof dgelqt & { strided: typeof strided }} */ ( dgelqt );
export { strided };
