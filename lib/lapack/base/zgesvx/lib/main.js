// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgesvx from './zgesvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgesvx, 'ndarray', ndarray );


// EXPORTS //

export default zgesvx;
