
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgetf2 from './zgetf2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgetf2, 'ndarray', ndarray );


// EXPORTS //

export default zgetf2;
