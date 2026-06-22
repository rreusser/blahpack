

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaqsp from './zlaqsp.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlaqsp, 'ndarray', ndarray );


// EXPORTS //

export default zlaqsp;
