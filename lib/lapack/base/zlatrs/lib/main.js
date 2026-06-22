// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlatrs from './zlatrs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlatrs, 'ndarray', ndarray );


// EXPORTS //

export default zlatrs;
