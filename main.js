var application_root = __dirname,
    path = require("path");
    
var express    = require('express');
var busboy  = require('connect-busboy');
var fs = require('fs');

var helpers = {};

helpers.isInt = function(n){
	return /^-?[0-9]+$/.test(n.toString());
}

helpers.parseType = function (type){
	//@TODO: loop trouble setings.conversions instead
	switch(type){
		case 'sass':
			outtype = 'sass';
		break;
		case 'scss':
			outtype = 'scss';
		break;
		default:
		case 'css':
			outtype = 'css';
		break;
	}
	
	return outtype;
}

helpers.parseFileType = function (type, filename){
	//@TODO: Parse the filename
	return helpers.parseType(type);
}

function listResource(req, res) {
	res.send('list of resources here');
}

function createResource(req, res) {
	var id = 2;

	uploadResource(req, res, id);
}

function uploadResource(req, res, id) {
	
	var fstream;
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {
		var outtype = helpers.parseFileType(req.params.type, filename);
		
	    console.log("Uploading: " + filename);
	    
	    var newfilename = id+'.'+outtype;
	    fstream = fs.createWriteStream(__dirname + '/resources/' + newfilename);
	    file.pipe(fstream);
	    fstream.on('close', function () {
	    	//@TODO: return resource 
	        res.send('Done');
	    });
	});
}

function getResource(req, res) {
	
	var outtype = helpers.parseType(req.params.type);
	
	if(helpers.isInt(req.params.id)){
		//@TODO: check file exists
		var id = req.params.id
		console.log('resources/'+req.params.id+'.'+outtype);
	}else{
		//@TODO: Better Error
		res.send('Not a valid ID');
		return
	}
	
	var format = req.params.format || 'json'; //@TODO: Implement header to request format, Also set to json default
	
	switch(format){
		case 'raw':
			res.contentType('text/css');
			res.sendfile('resources/'+id+'.'+outtype); //@TODO: filename
		break;
		case 'download':
			format = 'download';
			res.contentType('text/css');
			res.download('resources/'+id+'.'+outtype, 'yourfile'.outtype); //@TODO: filename
		break;
		default:
		case 'json':
		
			var links = {};
			
			settings.conversions.forEach(function(conv) {
				links[conv] = {};
				links[conv].links = {};
				links[conv].links.raw = settings.url+'/resources/'+id+'/'+conv+'/raw';
				links[conv].links.download = settings.url+'/resources/'+id+'/'+conv+'/download';
				links[conv].status = 'Ready|Queued|Processing';
				
			});
			res.send(links);
		break;
	}
}

function postreq(req, res) {
  res.send('hello ' + req.params.id);
}

function root(req, res) {
  res.send('hi');
}

var app        = express(); 				// define our app using express

var settings = {
	url: "http://assaas.hazan.me",
	listen: 8080,
	conversions: ['css','scss','sass']
};

var app = express();
//app.use(bodyParser());
app.use(busboy());
var router = express.Router();
app.use('/', router);

router.get('/', root);
router.get('/resources', listResource);
router.post('/resources/:type?', createResource);
router.get('/resources/:id/:type?/:format?', getResource);
//router.post('/resources/:id', postreq);

// Launch server

app.listen(8080);