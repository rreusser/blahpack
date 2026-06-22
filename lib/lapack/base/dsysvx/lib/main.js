// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsysvx from './dsysvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsysvx, 'ndarray', ndarray );


// EXPORTS //

export default dsysvx;
