
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaic1 from './zlaic1.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlaic1, 'ndarray', ndarray );


// EXPORTS //

export default zlaic1;
