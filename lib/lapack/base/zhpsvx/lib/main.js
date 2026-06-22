
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhpsvx from './zhpsvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhpsvx, 'ndarray', ndarray );


// EXPORTS //

export default zhpsvx;
