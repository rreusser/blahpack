/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable camelcase */

/**
* Generates an `M`-by-`N` complex matrix `Q` with orthonormal columns from the output of `zlatsqr`, using a row-block (GETT) sweep.
*
* ## Notes
*
* -   `zungtsqr_row` reconstructs the orthonormal factor `Q` from the row-block-by-column-block compact-WY storage produced by `zlatsqr`. The algorithm sweeps row blocks bottom-up so the resulting `Q` is built in row-major order — hence the `_row` suffix.
* -   `T` is treated as `nb`-by-(`N` * `Number_of_row_blocks`) where `Number_of_row_blocks = ceil((M - N) / (mb - N))` when `mb < M`, and `1` otherwise.
*
* @module @rreusser/blahpack/lapack/base/zungtsqr_row
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlatsqr from '@rreusser/blahpack/lapack/base/zlatsqr';
* import zungtsqr_row from '@rreusser/blahpack/lapack/base/zungtsqr_row';
*
* var A = new Complex128Array( 6 );
* var T = new Complex128Array( 4 );
* var WORK = new Complex128Array( 2 );
* zlatsqr( 'column-major', 3, 2, 4, 2, A, 3, T, 2, WORK );
* zungtsqr_row( 'column-major', 3, 2, 4, 2, A, 3, T, 2, WORK );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zungtsqr_row.ndarray" }
