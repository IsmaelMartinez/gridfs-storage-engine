var mongo = require('mongodb');
var Grid = require('gridfs-stream');
var _ = require('underscore');
var gfs;


GridFSStorage.prototype.connectToMongoDB = function connectToMongoDB(options) {
    mongo.MongoClient.connect(options.url, function (err, db) {
        if (err) throw new Error(err);
        gfs = new Grid(db, mongo);
        console.log('mongoDB connected');
        db.on('close', function () {
            console.log('mongoDB connection close');
        });
        db.on('error', function (err) {
            console.error('mongoDB error', err);
        });
        db.on('disconnect', function (err) {
            console.log('mongoDB disconnect', err);
        });
        db.on('disconnected', function (err) {
            console.log('mongoDB disconnected', err);
        });
        db.on('parseError', function (err) {
            console.error('mongoDB parse', err);
        });
        db.on('timeout', function (err) {
            console.log('mongoDB timeout', err);
        });
    });
}

function GridFSStorage(opts) {
    var options = _.extend({
        database: 'test',
        hostname: '127.0.0.1',
        port: 27017,
        url: null
    }, opts);

    if (!options.url) options.url = 'mongodb://' + options.hostname + ":" + options.port + "/" + options.database;

    this.connectToMongoDB(options);
}

function streamFileToGridFS(req, file, cb) {
    var writestream = gfs.createWriteStream({
        filename: file.originalname,
        metadata: req.body,
        content_type: file.mimetype
    });

    file.stream.pipe(writestream);
    writestream.on('close', function (file) {
        console.log('saved', file);
        cb(null, { gridfsEntry: file });
    });
}
GridFSStorage.prototype._handleFile = function _handleFile(req, file, cb) {
    streamFileToGridFS(req, file, cb);
}

function removeFile(id) {
    gfs.remove({_id: id}, function (err) {
        if (err) return err;
        console.log('deleted file._id ', id);
    });
}

GridFSStorage.prototype._removeFile = function _removeFile(req, file, cb) {
    delete file.buffer;
    if (file._id) removeFile(file._id);
    cb(null)
}

gfs = null;

module.exports = function (opts) {
    return new GridFSStorage(opts)
}
