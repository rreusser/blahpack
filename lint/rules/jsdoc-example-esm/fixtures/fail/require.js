// target: lib/lapack/ddisna/lib/index.js
// expect: commonjs
/**
* Computes reciprocal condition numbers.
*
* @module @stdlib/lapack/base/ddisna
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var ddisna = require( '@stdlib/lapack/base/ddisna' );
*/

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ddisna from './ddisna.js';
import strided from './strided.js';

setReadOnly( ddisna, 'strided', strided );

export default /** @type {typeof ddisna & { strided: typeof strided }} */ ( ddisna );
export { strided };
