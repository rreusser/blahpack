
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgeevx from './zgeevx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgeevx, 'ndarray', ndarray );


// EXPORTS //

export default zgeevx;
