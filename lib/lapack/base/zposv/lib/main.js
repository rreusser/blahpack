// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zposv from './zposv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zposv, 'ndarray', ndarray );


// EXPORTS //

export default zposv;
