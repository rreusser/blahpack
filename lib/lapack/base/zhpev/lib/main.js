
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhpev from './zhpev.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhpev, 'ndarray', ndarray );


// EXPORTS //

export default zhpev;
