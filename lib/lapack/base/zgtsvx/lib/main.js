
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgtsvx from './zgtsvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgtsvx, 'ndarray', ndarray );


// EXPORTS //

export default zgtsvx;
