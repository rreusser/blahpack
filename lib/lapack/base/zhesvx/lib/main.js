// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhesvx from './zhesvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhesvx, 'ndarray', ndarray );


// EXPORTS //

export default zhesvx;
