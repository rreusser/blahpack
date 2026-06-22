// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsygv from './dsygv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsygv, 'ndarray', ndarray );


// EXPORTS //

export default dsygv;
