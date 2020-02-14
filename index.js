const fs = require('fs');
const os = require('os');
const path = require('path');
const jsdom = require("jsdom");
const axios = require('axios');
const iconv = require('iconv-lite');
const { JSDOM } = jsdom;

let down_request = axios.create({
    responseType: 'arraybuffer'
});

let url = fs.readFileSync(path.join('.', '网址.txt'), 'utf8');
let type;
if (/jd\.com/gi.exec(url)) {
    type = 'jd';
} else if(/suning.com/gi.exec(url)) {
    type = 'suning';
} else if(/tmall.com/gi.exec(url)) {
    type = 'tmall';
}

if(type === 'suning') {
    axios
        .get(url)
        .then((res) => {
            let dom = new JSDOM(res.data);
            let document = dom.window.document;

            // root
            let title = document.querySelector("#itemDisplayName").textContent;
            title = title.replace(/[\\\/@]/gi, "");
            let root_dir = path.join(os.homedir(), 'Downloads', title);
            if(! fs.existsSync(root_dir))
                fs.mkdirSync(root_dir);

            // slides
            let slides_dir = path.join(root_dir, '轮播图');
            if(! fs.existsSync(slides_dir))
                fs.mkdirSync(slides_dir);
            let thumbs_qs = document.querySelectorAll(".imgzoom-thumb-main > ul > li");
            let slides = [];
            thumbs_qs
                .forEach((ele, idx) => {
                    slides.push(ele.querySelector('a > img').src);
                });
            slides = slides
                .map((ele, idx) => {
                    return 'http:' + ele.replace(/60/gi, '800');
                });
            slides.forEach(async function(src, idx){
                let filename = (idx).toString() + '.jpg';
                await down_request
                    .get(src)
                    .then((res) => {
                        fs.writeFileSync(path.join(slides_dir, filename), res.data, 'binary');
                    })
            });

            // intro
            let intro_dir = path.join(root_dir, '图片介绍');
            if(!fs.existsSync(intro_dir))
                fs.mkdirSync(intro_dir);
            let intro_qs = document.querySelectorAll('div[modulename="商品详情"] > p > img');
            let intros = [];
            intro_qs
                .forEach((ele, idx) => {
                    intros.push(ele.getAttribute('src2'));
                });
            intros = intros
                .map((ele, idx) => {
                    if(/http/gi.test(ele)) {
                        return ele;
                    } else {
                        return 'http:' + ele;
                    }
                });
            intros.forEach(async function(src, idx) {
                let filename = (idx).toString() + '.jpg';
                await down_request
                    .get(src)
                    .then((res) => {
                        fs.writeFileSync(path.join(intro_dir, filename), res.data, 'binary');
                    }).catch((err) => {

                    });
            })
        });
}

if(type === 'jd') {
    let p_id = url.match(/\/[0-9]*\.html/gi)[0].replace(/[\/\.html]/gi, "");
    axios
        .get(`https://item.m.jd.com/product/${p_id}.html`)
        .then(async function(res) {
            let dom = new JSDOM(res.data);
            let document = dom.window.document;
            let title = document.querySelector('#itemName').textContent;
            title = title.replace(/[\\\/@]/gi, "");
            let root_dir = path.join(os.homedir(), 'Downloads', title);
            if(! fs.existsSync(root_dir))
                fs.mkdirSync(root_dir);
            let slides_dir = path.join(root_dir, '轮播图');
            if(! fs.existsSync(slides_dir))
                fs.mkdirSync(slides_dir);

            let slides = res.data.match(/"image":\["jfs.*"]/gi)[0].match(/jfs[0-9a-zA-Z\/]*\.jpg/gi);
            slides = slides
                .map((ele, idx) => {
                    return 'http://m.360buyimg.com/mobilecms/s750x750_' + ele;
                });
            slides.forEach(async function(src, idx){
                let filename = (idx).toString() + '.jpg';
                await down_request
                    .get(src)
                    .then((res) => {
                        fs.writeFileSync(path.join(slides_dir, filename), res.data, 'binary');
                    })
            });

            // intro
            let intro_dir = path.join(root_dir, '图片介绍');
            if(!fs.existsSync(intro_dir))
                fs.mkdirSync(intro_dir);
            await axios
                .get(`https://wqsitem.jd.com/detail/0_d${p_id}_normal.html`)
                .then(res => {
                    let intros = res.data.match(/\/\/img30\.360buyimg\.com\/[0-9a-zA-Z\/]*\.jpg/gi);
                    intros = intros.map((ele, idx) => {
                        if(/http/gi.test(ele)) {
                            return ele;
                        } else {
                            return 'http:' + ele;
                        }
                    });
                    intros.forEach(async function(src, idx) {
                        let filename = (idx).toString() + '.jpg';
                        await down_request
                            .get(src)
                            .then((res) => {
                                fs.writeFileSync(path.join(intro_dir, filename), res.data, 'binary');
                            }).catch((err) => {

                            });
                    });
                });
        });
}

if(type === 'tmall') {
    let tmall_request = axios.create({      // 解决GBK乱码问题
        responseType: 'arraybuffer',
        headers: {
            'cookie': 'enc=t3u7vpp8wqMRADneqrbJZqrTgMpYdqedxVdbyEfmGxeP7rSVaG4UQPMrvJcWa9T%2FYJwQt9yZiNXfgf2kBg9g0w%3D%3D; '
        }
    });
    tmall_request
        .get(url)
        .then(async function (res) {
            let dom = new JSDOM(res.data);
            let document = dom.window.document;

            // root
            let title = document.querySelector(".tb-detail-hd > h1 > a").textContent;
            title = title.replace(/[\\\/@]/gi, "");
            let root_dir = path.join(os.homedir(), 'Downloads', title);
            if(! fs.existsSync(root_dir))
                fs.mkdirSync(root_dir);

            // slides
            let slides_dir = path.join(root_dir, '轮播图');
            if(! fs.existsSync(slides_dir))
                fs.mkdirSync(slides_dir);
            let thumbs_qs = document.querySelectorAll("#J_UlThumb > li > a > img");
            let slides = [];
            thumbs_qs
                .forEach((ele, idx) => {
                    slides.push(ele.src);
                });
            slides = slides
                .map((ele, idx) => {
                    return 'http:' + ele.replace(/60/gi, '800');
                });
            slides.forEach(async function(src, idx){
                let filename = (idx).toString() + '.jpg';
                await down_request
                    .get(src)
                    .then((res) => {
                        fs.writeFileSync(path.join(slides_dir, filename), res.data, 'binary');
                    })
            });

            // intro
            let intro_dir = path.join(root_dir, '图片介绍');
            if(!fs.existsSync(intro_dir))
                fs.mkdirSync(intro_dir);
            let result_text = iconv.decode(res.data, 'GBK');
            let intro_url = result_text.match(/descnew.taobao.com[a-z0-9A-Z%\/_.]*/gi);
            intro_url = "https://" + intro_url;
            await tmall_request
                .get(intro_url)
                .then((res) => {
                    let r_text = iconv.decode(res.data, 'utf8');
                    let intros = r_text.match(/https:\/\/img\.alicdn\.com[a-z0-9A-Z\/!._]*\.jpg/gi);
                    intros.forEach(async function(src, idx) {
                        let filename = (idx).toString() + '.jpg';
                        await down_request
                            .get(src)
                            .then((res) => {
                                fs.writeFileSync(path.join(intro_dir, filename), res.data, 'binary');
                            }).catch((err) => {         // 防止有404的出现

                            });
                    });
                })
        });
}