//var glob = require('glob');
var fs = require('fs');
var path = require('path');

function couchbaseView(couchbaseBucketConnection){

	if(!(this instanceof couchbaseView)){
		return new couchbaseView(couchbaseBucketConnection);
	}

	if(!(couchbaseBucketConnection && couchbaseBucketConnection.setDesignDoc)){
		return null;
	}

	this.bucketConn = couchbaseBucketConnection;
	this.designDocs = {};
}

couchbaseView.prototype.setDesignViews = function(dirPath){
	loadAndSetViews(this, dirPath, false);
	return this;
};

couchbaseView.prototype.setDesignViewsProduction = function(dirPath){
	loadAndSetViews(this, dirPath, true);
	return this;
};

function loadAndSetViews(couchbaseViewInstance, dirPath, promoteToProduction){
	var bucketConn = couchbaseViewInstance.bucketConn;

	fs.readdirSync(dirPath).forEach(function(designName){
		var designViews = {};
		var designPath = path.join(dirPath, designName);

		if(!fs.statSync(designPath).isDirectory()){
			return;
		}

		fs.readdirSync(designPath).forEach(function(viewName){

			var viewPath = path.join(designPath, viewName);
			var viewName = path.basename(viewName, '.js');
			var view = designViews[viewName] = {};

			try{

				if(fs.statSync(viewPath).isDirectory()){
					// look for files `map.js` and `reduce.js`
					var mapFile = path.join(viewPath, 'map.js');
					view.map = replaceCarriageReturn(fs.readFileSync(mapFile, {encoding:'utf-8'}));
					try{
						var reduceFile = path.join(viewPath, 'reduce.js');
						view.reduce = replaceCarriageReturn(fs.readFileSync(reduceFile, {encoding:'utf-8'}));
					}catch(e){
						console.warn('unable to load reduce function for view '+viewName);
					}
				}else{
					// is a file, shorthand for `map.js`
					view.map = replaceCarriageReturn(fs.readFileSync(viewPath, {encoding:'utf-8'}));
				}
			}catch(e){
				throw new Error('unable to load map function for view '+viewName);
			}
		});

		setDocViews(couchbaseViewInstance, designName, designViews, undefined, promoteToProduction);

	});

};

function setDocViews(couchbaseViewInstance, docName, docViews, callback, production){
	if(!(couchbaseViewInstance && couchbaseViewInstance.bucketConn && docName && docViews)){
		return null;
	}

	docName = docName.replace(/^dev_/, '');
	if(true !== production){
		docName = 'dev_' + docName;
	}

	couchbaseViewInstance.designDocs[docName] = docViews;
	couchbaseViewInstance.bucketConn.setDesignDoc(
		docName,
		{'views':docViews},
		callback || function(err, result){
			if(err){
				console.error('error setting designDoc '+docName);
			}else{
				console.log('set designDoc '+docName)
			}
		}
	);
}

// per http://www.couchbase.com/forums/thread/design-docs-views-created-rest-api-dont-work-show-results-grayed-out-404-error-client
// couchbase doesn't like carriage returns
function replaceCarriageReturn(str){
	return str.replace(/\r\n?/g,'\n');
}


module.exports = couchbaseView;