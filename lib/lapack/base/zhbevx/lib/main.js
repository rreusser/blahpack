
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhbevx from './zhbevx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhbevx, 'ndarray', ndarray );


// EXPORTS //

export default zhbevx;
