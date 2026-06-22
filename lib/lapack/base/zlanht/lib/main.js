// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlanht from './zlanht.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlanht, 'ndarray', ndarray );


// EXPORTS //

export default zlanht;
