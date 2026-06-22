
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhbgst from './zhbgst.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhbgst, 'ndarray', ndarray );


// EXPORTS //

export default zhbgst;
