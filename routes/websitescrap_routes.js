const express = require('express');
const router = express.Router();
const user = require('../controller/websitescrap_controller')
const bodyParser = require('body-parser')

var jsonparser = bodyParser.json()

router.post('/add-url',jsonparser,user.postApi)

router.get('/user-pagination',user.UserPagination);

module.exports = router;