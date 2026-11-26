// target: lib/lapack/base/dgeqrf/lib/dgeqrf.js
// expect: nocall
// Importing ndarray.js is not enough: the wrapper must call it (here it reaches the algorithm through another module).
/* eslint-disable max-len, max-params, no-unused-vars */

import ndarray from './ndarray.js';
import dgeqr2 from '../../dgeqr2/lib/base.js';

function dgeqrf( order, M, N, A, LDA, TAU, strideTAU, WORK ) {
	return dgeqr2( M, N, A, 1, LDA, 0, TAU, strideTAU, 0, WORK, 1, 0 );
}

export default dgeqrf;
