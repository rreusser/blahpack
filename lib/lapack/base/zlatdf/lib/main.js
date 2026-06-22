
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlatdf from './zlatdf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlatdf, 'ndarray', ndarray );


// EXPORTS //

export default zlatdf;
