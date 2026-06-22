// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaqr1 from './zlaqr1.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlaqr1, 'ndarray', ndarray );


// EXPORTS //

export default zlaqr1;
