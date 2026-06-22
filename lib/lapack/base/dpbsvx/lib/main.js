
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dpbsvx from './dpbsvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dpbsvx, 'ndarray', ndarray );


// EXPORTS //

export default dpbsvx;
