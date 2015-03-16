couchbase-views
====================

install couchbase views from directory/files, uses couchbase's node library

You have node code that connects to [couchbase ](http://www.couchbase.com/) via [couchnode](https://github.com/couchbase/couchnode)! But how to keep a connection to the [views](http://docs.couchbase.com/couchbase-manual-2.0/#views-and-indexes) your queries are using?

`couchbase-views` aims to enable devs to store couchbase views alongside the code using them.
View revisioning can be accomplished by naming of the enclosing design documents.

Usage
=====
`couchbase-views` expects a directory of views laid out like so:

    views-dir
    └───design-document-a
        ├───view-a
        │   ├───map.js
        │   └───reduce.js
        ├───view-b
        │   └───map.js
        └───view-c.js

Note that views can be either a `js` file or a directory with a `map.js` with an optional `reduce.js` file.

With this layout, adding these views to your cluster is done via:

```javascript
var path = require('path');
var couchbase = require('couchbase');
var couchbaseViews = require('couchbase-views'); // vote couchbase-views!

// same connection as before
var cluster = new couchbase.Cluster();
var bucket = cluster.openBucket('default');

// new stuff!
couchbaseViews
  .connect(bucket)
  .setDesignViews(path.join(__dirname, 'views-dir'));
  // or
  //.setDesignViewsProduction(path.join(__dirname, 'views-dir'));
```

While simple, API improvements could be had; ideas welcome.
