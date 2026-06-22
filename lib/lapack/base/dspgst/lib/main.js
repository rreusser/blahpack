
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dspgst from './dspgst.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dspgst, 'ndarray', ndarray );


// EXPORTS //

export default dspgst;
