const express = require('express')
const router = express.Router()
var url = require("url");
const InfoModel = require('../models/t_info')
const UserModel = require('../models/t_user')
const CollectModel = require('../models/Collection')
// GET /info 
//   eg: GET /info?author=xxx
router.get('/', function (req, res, next) {
    console.log('/info')
    var p = url.parse(req.url);
    var param = req.query;
    author = '' //请求的用户id
    if(param)
    {
        console.log('-------------------1-----------------')
        author = url.parse(decodeURI(req.url),true).query.author; //解析参数为author的值
        if(author)
            console.log(author);
    }

    InfoModel.getInfos(author)
        .then(function (infos) {
            res.send(infos)
        })
        .catch(next)
})

// POST /info/create 
router.post('/create', function (req, res, next) {
    
    console.log(req.body)
    const title = req.body.title//标题
    const type = req.body.type //招募类型
    const content = req.body.content //招募内容
    const membernum = req.body.membernum //团队人数
    const requirement = req.body.requirement //招募要求
    const author = req.body.author //发布招募的人 类型： User

    let info = {
        author: author,
        title: title,
        type: type,
        content: content,
        membernum: Number(membernum),
        requirement: requirement
    }


    InfoModel.create(info)
        .then(function (result) {
            // 此 post 是插入 mongodb 后的值，包含 _id
            res.send(result.ops[0])
            
        })
        .catch(next)
})

// GET /info/create 
router.get('/create', function (req, res, next) {
    res.send('发表文章页, 传输数据请使用post')
})

// GET /info/:infoId 
router.get('/:infoId', function (req, res, next) {
    const infoId = req.params.infoId
    console.log('infoId detail')
    Promise.all([
        InfoModel.getInfoById(infoId), // 获取招募信息
    ])
        .then(function (result) {
            const info = result[0]
            info.type = 0
            if (!info) {
                info.type = 1
            }
            res.send(info)
        
        
        })
        .catch(next)
})

// GET /info/:infoId/edit 
router.get('/:infoId/edit', function (req, res, next) {
    res.send('更新文章页, 传输数据请使用post')
})

// POST /info/:infoId/edit 
router.post('/:infoId/edit', function (req, res, next) {
    const infoId = req.params.infoId
    console.log(req.body)
    const title = req.body.title//标题
    const type = req.body.type //招募类型
    const content = req.body.content //招募内容
    const membernum = req.body.membernum //团队人数
    const requirement = req.body.requirement //招募要求
    const author = '5cde930da9188f1431f3da7c' //发布招募的人 类型： User


    let info = {
        author: author,
        title: title,
        type: type,
        content: content,
        membernum: Number(membernum),
        requirement: requirement
    }

    
    InfoModel.updateInfoById(infoId, info)
        .then(function (result) {
            //更新成功
            res.send("ok")
        })
        .catch(next)

    
})

// GET /info/:infoId/remove 
router.get('/:infoId/remove', function (req, res, next) {
    const infoId = req.params.infoId
    InfoModel.delInfoById(infoId)
        .then(function (info) {
            if (!info) {
                throw new Error('文章不存在')
            }
            
            InfoModel.delInfoById(infoId)
                .then(function () {
                    res.send("Delete successfully")
                })
                .catch(next)
            })
})

// POST 根据招募类型查找用户
router.post('/user', function (req, res, next) {
    console.log('/user')
    const requireType = Number(req.body.requireType) //招募要求

    UserModel.getUsersByRequireType(requireType)
        .then(function (users) {
            res.send(users)
        })
        .catch(next)
})

// POST /info/:infoId/collect
router.post('/:infoId/collect', function(req, res, next) {
    const infoId = req.params.infoId
    const userId = req.body.userId
    Promise.all([
        UserModel.getUserById(userId),
        InfoModel.getInfoById(infoId),
    ]).then(function(result) {
        info = result[0]
        user = result[1]
        console.log('COLLECT: USER')
        console.log(user)
        Promise.all([
            CollectModel.create(userId, infoId, info, user), // 创建收藏
            InfoModel.incPv(infoId),// pv 加 1
            CollectModel.incPv(infoId)
            ])
            .then(function (result2) {
                const info = result2[0]
        
                res.send(info)
            })
            .catch(next)
    })
    
})

// POST /info/:infoId/dropcollect
router.post('/:infoId/dropcollect', function(req, res, next) {
    const infoId = req.params.infoId
    const userId = req.body.userId

    Promise.all([
        CollectModel.dropCollectById(userId, infoId), // 创建收藏
        InfoModel.delPv(infoId),// pv - 1
        CollectModel.delPv(infoId)
        ])
        .then(function (result) {

            const info = result[0]
            res.send(info)
        })
        .catch(next)
})

router.post('/:infoId/isCollected', function(req, res, next) {
    console.log('isCollected')
    const infoId = req.params.infoId
    const userId = req.body.userId

    var isCollect = ''

    CollectModel.getIsCollectted(userId, infoId)
        .then(function(result) {
            if(result) {
				isCollect = true
			} else {
				isCollect = false
            }
            console.log(isCollect)
            res.send(JSON.stringify({isCollect: isCollect}))
        })
        .catch(next)
})

//获取全部收藏
router.post('/mycollect', function(req, res, next) {
    const userId = req.body.userId

    CollectModel.getCollectionsByUserId(userId)
        .then(function(result) {
            res.send(result)
        })
        .catch(next)

})

module.exports = router