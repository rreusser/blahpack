
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlansp from './zlansp.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlansp, 'ndarray', ndarray );


// EXPORTS //

export default zlansp;
