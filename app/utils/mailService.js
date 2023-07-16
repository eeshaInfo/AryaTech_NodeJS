const Mailjet = require ('node-mailjet')
const email_template = require('./emailTemplate')

module.exports = sendEmail=async()=>{

  const mailjet = new Mailjet({
    apiKey: process.env.MAILJET_API_KEY ,
    apiSecret: process.env.MAILJET_SECRET_KEY
  });

const request = mailjet
.post("send", {'version': 'v3.1'})
.request({
  "Messages":[
    {
      "From": {
        "Email": "aryatechcomputeredu@gmail.com",
        "Name": "AryaTech"
      },
      "To": [
        {
          "Email": "sonukumar6598sg@gmail.com",
          "Name": "SONU KUMAR"
        },
        {
          "Email": "mdeesha1996@gmail.com",
          "Name": "Md Eesha"
        },  {
          "Email": "anmolkumarmumbi@gmail.com ",
          "Name": "Anmol Kumar"
        }
      ],
      "Subject": "Testing email from Eesha",
      "TextPart": "I am integrating email service in our project if you are getting this email please ignore it",
      "HTMLPart": await email_template.changesPassword(null),
      "CustomID": "AppGettingStartedTest"
    }
  ]
})
request
  .then((result) => {
    console.log(result.body)
  })
  .catch((err) => {
    console.log(err.statusCode)
  })
}

