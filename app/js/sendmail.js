var nodemailer = require('./js/lib/nodemailer')

let mailHtml = '<p>%NAME%:</p>' +
    '<p>您好，请确认以下报销内容，如对报销结果有疑义，请联系财务部。</p>' +
    '<p>报销日期：%DATE%</p>' +
    '<p>报销总金额：%SUM%元</p>' +
    '<p>  明细列表:</p>' +
    '<ul>%DETAIL%</ul>';
function makeMailHtml(host, data) {
    var html = mailHtml
    html = html.replace(/%NAME%/, data.name)
    html = html.replace(/%DATE%/, host.date)
    html = html.replace(/%SUM%/, data.sum)
    html = html.replace(/%DETAIL%/, data.detail)
    return html
}

const notify_email = 'ods_hla@163.com'
// 发送邮件
function sendMail(host, collection, cb) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.mxhichina.com',
        port: 25,
        secure: false,
        auth: {
            user: finance_email,
            pass: host.passwd
        }
    });

    // 批量发送
    var count = 0
    cb(count)

    collection.forEach(function (item) {
        let mailOptions = {
            from: '"' + host.user + '"<' + finance_email + '>',
            to: item.email,
            subject: '报销通知单',
            html: makeMailHtml(host, item)
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                $.alert({
                    title: '错误',
                    content: '<' + item.email + '>邮件发送失败',
                    buttons:{
                        confirm:{
                            text:'关闭'
                        }
                    }
                })
                return console.log(error);
            }
            count += 1
            cb(count)
            console.log('发送邮件: %s', info.messageId);
        });
    })
}

