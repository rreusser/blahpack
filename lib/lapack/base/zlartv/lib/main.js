// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlartv from './zlartv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlartv, 'ndarray', ndarray );


// EXPORTS //

export default zlartv;
