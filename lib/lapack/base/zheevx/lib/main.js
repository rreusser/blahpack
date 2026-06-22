// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zheevx from './zheevx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zheevx, 'ndarray', ndarray );


// EXPORTS //

export default zheevx;
