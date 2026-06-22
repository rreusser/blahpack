

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zupgtr from './zupgtr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zupgtr, 'ndarray', ndarray );


// EXPORTS //

export default zupgtr;
