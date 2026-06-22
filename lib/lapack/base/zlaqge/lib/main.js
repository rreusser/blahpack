// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaqge from './zlaqge.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlaqge, 'ndarray', ndarray );


// EXPORTS //

export default zlaqge;
