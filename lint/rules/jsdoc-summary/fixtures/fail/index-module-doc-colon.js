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
import ndarray from './ndarray.js';

setReadOnly( dgemm, 'ndarray', ndarray );

export default /** @type {typeof dgemm & { ndarray: typeof ndarray }} */ ( dgemm );
export { ndarray };
