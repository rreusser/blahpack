// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlarscl2 from './zlarscl2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlarscl2, 'ndarray', ndarray );


// EXPORTS //

export default zlarscl2;
