
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlar1v from './zlar1v.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlar1v, 'ndarray', ndarray );


// EXPORTS //

export default zlar1v;
