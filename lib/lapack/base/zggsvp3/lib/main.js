
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zggsvp3 from './zggsvp3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zggsvp3, 'ndarray', ndarray );


// EXPORTS //

export default zggsvp3;
