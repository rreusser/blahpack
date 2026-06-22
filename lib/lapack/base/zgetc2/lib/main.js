
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgetc2 from './zgetc2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgetc2, 'ndarray', ndarray );


// EXPORTS //

export default zgetc2;
