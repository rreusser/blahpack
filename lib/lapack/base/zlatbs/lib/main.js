// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlatbs from './zlatbs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlatbs, 'ndarray', ndarray );


// EXPORTS //

export default zlatbs;
