
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlatps from './zlatps.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlatps, 'ndarray', ndarray );


// EXPORTS //

export default zlatps;
