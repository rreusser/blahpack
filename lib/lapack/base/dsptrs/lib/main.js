
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsptrs from './dsptrs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsptrs, 'ndarray', ndarray );


// EXPORTS //

export default dsptrs;
