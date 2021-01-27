const AWS = require('aws-sdk');
const {google} = require('googleapis');
var ssm;

exports.lambdaHandler = async (event, context) => {

    var jwtClient;
    var sheets;
    var privateKey;
    ssm = new AWS.SSM();

    return getPrivateKey().then((privateKey) => {

        return new Promise((resolve, reject) => {

            jwtClient = new google.auth.JWT(
                privateKey.client_email,
                null,
                privateKey.private_key,
                ['https://www.googleapis.com/auth/spreadsheets']
            );

            jwtClient.authorize(function (err, tokens) {
                if (err) {
                    reject(err);
                } else {
                    resolve(tokens);
                }
            });
        });

    }).then(() => {

       sheets = google.sheets({
            version: 'v4',
            auth: jwtClient
        });

        return sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREAD_SHEET_ID,
            range: process.env.SHEET + '!A1:Z1',
        });

    }).then((headers) => {

        let headerLabels = [];

        if (headers.data.values != null && headers.data.values.length > 0) {
            headers.data.values[0].forEach(header => {
                headerLabels.push(header.toLowerCase());
            });
        }

        const dataArray = [];

        event.Records.forEach(record => {

            var body = JSON.parse(record.body);
            var message = JSON.parse(body.Message);
            var content = JSON.parse(message.content);
            
            if (headerLabels.length == 0) {
                Object.keys(content).forEach(k => {
                    headerLabels.push(k.toLowerCase());
                });
                headerLabels.sort();
            }

            var contentLowerCase = [];
            Object.keys(content).forEach(k => {
                contentLowerCase[k.toLowerCase()] = content[k];
            });

            const data = [];
            headerLabels.forEach(label => {
                if (contentLowerCase[label] != null) {
                    data.push(contentLowerCase[label]);
                } else {
                    data.push("");
                }
            });

            dataArray.push(data);
        });
        
        return dataArray;

    }).then((dataArray) => {

        return sheets.spreadsheets.values.append({
          spreadsheetId: process.env.SPREAD_SHEET_ID,
          range: process.env.SHEET,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: dataArray,
          },
          auth: jwtClient
        });

    }).then((res) => {

        if (res.data.updates) {
          return Promise.resolve("update made to Google Sheets");
        } else {
          return Promise.reject("no update made for Google Sheets");
        }

    }).catch(error => { 
        return Promise.reject(error);
    });
};

async function getPrivateKey() {
    var params = {
      Name: "/formkiq/" + process.env.APP_ENVIRONMENT + "/auth/google/spreadsheets",
      WithDecryption: true
    };
    return new Promise((resolve, reject) => {
      ssm.getParameter(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data.Parameter.Value));
        }
      });
    });
}