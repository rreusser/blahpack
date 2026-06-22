
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dspsv from './dspsv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dspsv, 'ndarray', ndarray );


// EXPORTS //

export default dspsv;
