# gridfs-storage-engine

gridfs-storage-engine is a Multer Storage Engine implementation for Gridfs (MongoDB).

It allows you to stream a file from your form or nodejs application into your mongodb directly.

## How does it work

At the moment, gridfs-storage-engine streams a file to mongodb using grind-stream.

Following the [Multer Storage Engine](https://github.com/expressjs/multer/blob/master/StorageEngine.md) pattern, to use this Storage engine you will need to initialize it with multer. 

```
var storage = require('gridfs-storage-engine')();
var upload = multer({ storage: storage });
```

Then you could activate it for the end points that you choose

```
router.get('/api/v1/aggregate', function () { //doSomething });
router.post('/api/v1/aggregate/', upload.single('file'), function () { //what to do after create... } );
```

Any key/value body elements a part from the file, will be added as the file metadata.

### Options

By default gridfs-storage-engine will try to open a database connection with the following details

```
{
    database: 'test',
    hostname: '127.0.0.1',
    port: 27017
}
```

You can overwrite those by providing as parameters of the require.

```
var storage = require('gridfs-storage-engine')({
    database: 'yourDatabase'
});
var upload = multer({ storage: storage });
```

If you need to submit files using nodejs check [form-data](https://www.npmjs.com/package/form-data).

## Current limitations & future improvements

Currently, the is only support for a single file transfer.

As per multer limitations, the only supported encoding is "multipart/form-data". 

There isn't a check for duplicate files. If you insert a file that is already present in the datase, a new record will be created. This is a limitations of GridFS and can be addressed by removing the old file after an insert.

No tests provided. Adding test coverage will be a next release priority.

## Further reading

[Multer Storage Engine](https://github.com/expressjs/multer/blob/master/StorageEngine.md)

[GridFS](http://docs.mongodb.org/manual/core/gridfs/)

