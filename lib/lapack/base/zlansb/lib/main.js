
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlansb from './zlansb.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlansb, 'ndarray', ndarray );


// EXPORTS //

export default zlansb;
