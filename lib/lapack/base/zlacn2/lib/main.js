// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlacn2 from './zlacn2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlacn2, 'ndarray', ndarray );


// EXPORTS //

export default zlacn2;
