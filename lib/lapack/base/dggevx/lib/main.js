
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dggevx from './dggevx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dggevx, 'ndarray', ndarray );


// EXPORTS //

export default dggevx;
