
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zpbsvx from './zpbsvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zpbsvx, 'ndarray', ndarray );


// EXPORTS //

export default zpbsvx;
