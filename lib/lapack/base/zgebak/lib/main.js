// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgebak from './zgebak.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgebak, 'ndarray', ndarray );


// EXPORTS //

export default zgebak;
