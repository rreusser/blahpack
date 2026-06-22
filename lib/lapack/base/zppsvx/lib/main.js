
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zppsvx from './zppsvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zppsvx, 'ndarray', ndarray );


// EXPORTS //

export default zppsvx;
