
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsbgst from './dsbgst.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsbgst, 'ndarray', ndarray );


// EXPORTS //

export default dsbgst;
