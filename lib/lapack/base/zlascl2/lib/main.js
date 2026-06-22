// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlascl2 from './zlascl2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlascl2, 'ndarray', ndarray );


// EXPORTS //

export default zlascl2;
