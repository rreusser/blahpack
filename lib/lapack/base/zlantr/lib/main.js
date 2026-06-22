// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlantr from './zlantr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlantr, 'ndarray', ndarray );


// EXPORTS //

export default zlantr;
