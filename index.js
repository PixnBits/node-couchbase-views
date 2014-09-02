/** usage **
couchbaseViews = require('couchbase-views');

couchbaseViews.connect(cbConnection)
	.setDesignViews('directoryOf dirs for collections and files for views');
	.promoteToProduction('after date for safety');

	OR

	.addViews('design doc name', ['file 1','file 2'])
/** usage **/

var couchbaseView = require('./lib/couchbaseView');

module.exports.connect = function(couchbaseBucketConnection){
	return new couchbaseView(couchbaseBucketConnection);
};
