
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dswap from './dswap.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dswap, 'ndarray', ndarray );


// EXPORTS //

export default dswap;
