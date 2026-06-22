
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dppsvx from './dppsvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dppsvx, 'ndarray', ndarray );


// EXPORTS //

export default dppsvx;
