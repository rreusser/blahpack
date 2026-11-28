// target: lib/blas/dgemm/lib/index.js
// expect: ends mid-statement
/**
* @license MIT
*/

/**
* Perform one of the matrix-matrix operations:
*
* @module @rreusser/blahpack/blas/dgemm
*/

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgemm from './dgemm.js';
import strided from './strided.js';

setReadOnly( dgemm, 'strided', strided );

export default /** @type {typeof dgemm & { strided: typeof strided }} */ ( dgemm );
export { strided };
