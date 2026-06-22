
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlangb from './zlangb.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlangb, 'ndarray', ndarray );


// EXPORTS //

export default zlangb;
