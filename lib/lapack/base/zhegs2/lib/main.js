// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhegs2 from './zhegs2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhegs2, 'ndarray', ndarray );


// EXPORTS //

export default zhegs2;
