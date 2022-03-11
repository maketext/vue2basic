//process.env.NODE_ENV = 'production'

const express = require('express')
const app = express()
const session = require('express-session')
const axios = require('axios')
const port = 8888
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs')
const querystring = require('querystring')
const nodemailer = require('nodemailer')
const { md5 } = require('pure-md5')
const bcrypt = require('bcrypt')

const ipf = require('express-ipfilter').IpFilter

const multer = require('multer'); // express에 multer모듈 적용 (for 파일업로드)
const path = require('path')
const dayjs = require('dayjs')
const { write } = require('fs-lockfile')
const writeFile = write
const passport = require("passport")
const Localstrategy = require("passport-local").Strategy
const crypto = require("crypto")


//const path = require('path-posix')
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'res/file') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
	}
})
const upload = multer(
{ 
	storage: storage,
	limits: { fieldSize: 1024 * 1024 * 1024 } 
})

function log(msg)
{
	console.log(msg)
}
app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: 'naielkscdii',
	cookie: {
		httpOnly: true,
		secure: false
	}
}))


app.use((req, res, next) => {
	log(`\n\n새 라우팅 ${req.path}`)

	res.on("finish", function() {
		log("응답메시지 전송됨.")
	})
	// 직렬화/역직렬화, 캐싱확인용 컴포넌트 들어갈 자리.
	next()
})

app.use(express.static(path.join(__dirname, '..', 'res')))

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

axios.defaults.baseURL = "http://localhost:8080"
function patch (url, param, callback) {
	axios.patch(url, param)
		.then(function (res) {
			console.log("HTTP PATCH 응답 res.data=" + JSON.stringify(res.data))
			if(callback)
				callback(res.data)
		})
}

app.listen(port, () => {
	log("HTTP 네트워크 소켓 리스닝 중...")
})


app.set('view engine', 'pug')
//app.set('views', path.resolve(__dirname,'..', 'pug'))
app.set('views', path.join(__dirname,'..', 'pug'))

let baseImagePath = path.join(__dirname, '..', "res/img")
let baseFilePath = path.join(__dirname, '..', "res/file")

let urlToSendMail

app.get(['/:pugFileName', '/'], (req, res, next) => {
	log(`view rendering - ${req.params.pugFileName}.pug`)
	switch(req.params.pugFileName)
	{
		case 'sendmail':
		{
			urlToSendMail = md5(`MSS-${Math.random()}`)
			res.render(`${req.params.pugFileName}`, {axiosAddr: '127.0.0.1', urlToSendMail: urlToSendMail})
			break
		}
		case undefined:
		{
			res.render(`index`, {axiosAddr: '127.0.0.1'})
			break
		}
		default:
		{
			throw 'URL Parameter is not valid.'
			next()
			//res.sendFile(`/img/favicon/${req.params.pugFileName}`)
		}
	}
})
app.get('/img/:img', (req, res, next) => {
	let im = querystring.unescape(req.params.img)
	im = im.replace(/\s/g, "%20")
	console.log(`im=${im}`)
	let newfile = `${baseImagePath}/${im.replace(".webp", "").replace(".WEBP", "")}.webp`
	
	if(im.endsWith(".jpg") || im.endsWith(".jpeg") || im.endsWith(".png") || im.endsWith(".gif"))
		newfile = `${baseImagePath}/${im}`
	if(im.endsWith(".JPG") || im.endsWith(".JPEG") || im.endsWith(".PNG") || im.endsWith(".GIF"))
		newfile = `${baseImagePath}/${im}`


	if(im == 'error')
	{
		res.writeHead(200)
		res.end('')
	}

	//log("그림 다운로드")
	//log(newfile)
	fs.readFile(newfile, (err, data) => {
		if(err)
		{
			log(err)
			fs.readFile(`${baseImagePath}/x.jpg`, (err, data) => {
				res.writeHead(200, {"Content-Type": "img/jpeg"})
				res.end(data)
			})
		}
		else
		{
			res.writeHead(200, {"Content-Type": "img/jpeg"})
			res.end(data)
		}
		
	})

})

app.post(['/getUserDetails'], (req, res, next) => {
	console.log('파라미터=', req.body)
	res.send({id:'aa', pw:'aa'})
})

app.use(function(err, req, res, next) {
	res.render('error', {axiosAddr: 'http://127.0.0.1:8080'})
})