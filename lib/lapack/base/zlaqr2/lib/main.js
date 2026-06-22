// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaqr2 from './zlaqr2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlaqr2, 'ndarray', ndarray );


// EXPORTS //

export default zlaqr2;
