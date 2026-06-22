
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsbtrd from './dsbtrd.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsbtrd, 'ndarray', ndarray );


// EXPORTS //

export default dsbtrd;
