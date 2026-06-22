
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zptsvx from './zptsvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zptsvx, 'ndarray', ndarray );


// EXPORTS //

export default zptsvx;
