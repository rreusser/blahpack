
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlantb from './zlantb.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlantb, 'ndarray', ndarray );


// EXPORTS //

export default zlantb;
