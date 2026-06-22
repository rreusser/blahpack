
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlargv from './zlargv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlargv, 'ndarray', ndarray );


// EXPORTS //

export default zlargv;
