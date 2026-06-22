// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsyevr from './dsyevr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsyevr, 'ndarray', ndarray );


// EXPORTS //

export default dsyevr;
