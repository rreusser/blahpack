// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaqr3 from './zlaqr3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlaqr3, 'ndarray', ndarray );


// EXPORTS //

export default zlaqr3;
