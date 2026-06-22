// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsygvx from './dsygvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsygvx, 'ndarray', ndarray );


// EXPORTS //

export default dsygvx;
