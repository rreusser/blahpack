// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaqr4 from './zlaqr4.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlaqr4, 'ndarray', ndarray );


// EXPORTS //

export default zlaqr4;
