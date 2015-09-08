var mongo = require('mongodb');
var Grid = require('gridfs-stream');
var _ = require('underscore');
var gfs;

function GridFSStorage(opts) {
    var options = _.extend({
        database: 'test',
        hostname: '127.0.0.1',
        port: 27017
    }, opts);
    var db = new mongo.Db(options.database, new mongo.Server(options.hostname, options.port));
    db.open(function (err) {
        if (err) return handleError(err);
        gfs = new Grid(db, mongo);
    })
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
        cb();
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
