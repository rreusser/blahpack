// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztrttp from './ztrttp.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztrttp, 'ndarray', ndarray );


// EXPORTS //

export default ztrttp;
