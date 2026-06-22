// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztrexc from './ztrexc.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztrexc, 'ndarray', ndarray );


// EXPORTS //

export default ztrexc;
