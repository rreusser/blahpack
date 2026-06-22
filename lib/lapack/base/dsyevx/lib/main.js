// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsyevx from './dsyevx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsyevx, 'ndarray', ndarray );


// EXPORTS //

export default dsyevx;
