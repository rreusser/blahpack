// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgelss from './zgelss.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgelss, 'ndarray', ndarray );


// EXPORTS //

export default zgelss;
