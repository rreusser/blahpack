// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zstein from './zstein.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zstein, 'ndarray', ndarray );


// EXPORTS //

export default zstein;
