// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlangt from './zlangt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlangt, 'ndarray', ndarray );


// EXPORTS //

export default zlangt;
