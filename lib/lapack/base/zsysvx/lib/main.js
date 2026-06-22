// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsysvx from './zsysvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsysvx, 'ndarray', ndarray );


// EXPORTS //

export default zsysvx;
