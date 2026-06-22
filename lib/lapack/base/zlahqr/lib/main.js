// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlahqr from './zlahqr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlahqr, 'ndarray', ndarray );


// EXPORTS //

export default zlahqr;
