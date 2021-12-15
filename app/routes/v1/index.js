
'use strict';


/********************************
 ********* All routes ***********
 ********************************/
let v1Routes = [
    ...require('./userRoutes'),
     ...require('./adminRoute'),
     ...require('./challengeRoutes'),
    
]


module.exports = v1Routes;
