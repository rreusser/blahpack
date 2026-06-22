
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlarfy from './zlarfy.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlarfy, 'ndarray', ndarray );


// EXPORTS //

export default zlarfy;
