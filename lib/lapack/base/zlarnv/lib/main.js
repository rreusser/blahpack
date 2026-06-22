
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlarnv from './zlarnv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlarnv, 'ndarray', ndarray );


// EXPORTS //

export default zlarnv;
