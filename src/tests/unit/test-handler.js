'use strict';

const app = require('../../app.js');
const chai = require('chai');
const AWS = require('aws-sdk');
const fs = require('fs').promises;
const expect = chai.expect;

const {google} = require('googleapis');
let privateKey = require("../privateKey.json");

AWS.config.update({
  accessKeyId: 'asdjsadkskdskskdk',
  secretAccessKey: 'sdsadsissdiidicdsi',
  region: 'us-east-1',
  endpoint: 'http://localhost:4566'
});

describe('googlesheets', function () {

    beforeEach(async() => {

        process.env.SPREAD_SHEET_ID = "1w96XEDHaEgZuGKn32aMqoIHO4HVLlwOE0ovgZK1JkcA";
        process.env.SHEET = "Sheet1";
        process.env.APP_ENVIRONMENT = "prod";

        await sheets.spreadsheets.values.clear({
            spreadsheetId: process.env.SPREAD_SHEET_ID,
            range: process.env.SHEET + '!A1:Z',
        });
    });

    let jwtClient = new google.auth.JWT(
        privateKey.client_email,
        null,
        privateKey.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({
        version: 'v4',
        auth: jwtClient
    });

    it('insert 1 row', async () => {

        var text = await readFile('./tests/unit/json/data0.json');
        const result = await app.handler(JSON.parse(text), {})
        expect(result).to.be.equal("update made to Google Sheets");

        let values = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREAD_SHEET_ID,
            range: process.env.SHEET + '!A1:B',
        });

        expect(values.data.values.length).to.be.equal(1);
        expect(values.data.values[0].length).to.be.equal(1);
        expect(values.data.values[0][0]).to.be.equal("john smith");
    });

    it('insert 2 rows', async () => {

        var text = await readFile('./tests/unit/json/data1.json');
        const result = await app.handler(JSON.parse(text), {})
        expect(result).to.be.equal("update made to Google Sheets");

        let values = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREAD_SHEET_ID,
            range: process.env.SHEET + '!A1:B',
        });

        expect(values.data.values.length).to.be.equal(2);
        expect(values.data.values[0].length).to.be.equal(1);
        expect(values.data.values[0][0]).to.be.equal("john smith");
        expect(values.data.values[1][0]).to.be.equal("jane smith");
    });

    it('insert 2 rows with header', async () => {

        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.SPREAD_SHEET_ID,
            range: process.env.SHEET + '!A1:Z1',
            valueInputOption: 'RAW',
            resource: { values: [ ['Date', 'Name']] },
            auth: jwtClient
        });

        var text = await readFile('./tests/unit/json/data1.json');
        const result = await app.handler(JSON.parse(text), {})
        expect(result).to.be.equal("update made to Google Sheets");

        let values = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREAD_SHEET_ID,
            range: process.env.SHEET + '!A1:B',
        });

        expect(values.data.values.length).to.be.equal(3);
        expect(values.data.values[0].length).to.be.equal(2);
        expect(values.data.values[0][0]).to.be.equal("Date");
        expect(values.data.values[0][1]).to.be.equal("Name");
        expect(values.data.values[1][0]).to.be.equal("");
        expect(values.data.values[1][1]).to.be.equal("john smith");
        expect(values.data.values[2][0]).to.be.equal("");
        expect(values.data.values[2][1]).to.be.equal("jane smith");
    });

    it('insert 2 rows with header twice', async () => {

        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.SPREAD_SHEET_ID,
            range: process.env.SHEET + '!A1:Z1',
            valueInputOption: 'RAW',
            resource: { values: [ ['Date', 'Name']] },
            auth: jwtClient
        });

        var text = await readFile('./tests/unit/json/data1.json');
        var result = await app.handler(JSON.parse(text), {})
        expect(result).to.be.equal("update made to Google Sheets");

        var values = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREAD_SHEET_ID,
            range: process.env.SHEET + '!A1:B',
        });

        expect(values.data.values.length).to.be.equal(3);
        expect(values.data.values[0].length).to.be.equal(2);
        expect(values.data.values[0][0]).to.be.equal("Date");
        expect(values.data.values[0][1]).to.be.equal("Name");
        expect(values.data.values[1][0]).to.be.equal("");
        expect(values.data.values[1][1]).to.be.equal("john smith");
        expect(values.data.values[2][0]).to.be.equal("");
        expect(values.data.values[2][1]).to.be.equal("jane smith");

        text = await readFile('./tests/unit/json/data2.json');
        result = await app.handler(JSON.parse(text), {})
        expect(result).to.be.equal("update made to Google Sheets");

        values = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREAD_SHEET_ID,
            range: process.env.SHEET + '!A1:B',
        });

        expect(values.data.values.length).to.be.equal(5);
        expect(values.data.values[0].length).to.be.equal(2);
        expect(values.data.values[0][0]).to.be.equal("Date");
        expect(values.data.values[0][1]).to.be.equal("Name");
        expect(values.data.values[1][0]).to.be.equal("");
        expect(values.data.values[1][1]).to.be.equal("john smith");
        expect(values.data.values[2][0]).to.be.equal("");
        expect(values.data.values[2][1]).to.be.equal("jane smith");
        expect(values.data.values[3][0]).to.be.equal("");
        expect(values.data.values[3][1]).to.be.equal("james smith");        
        expect(values.data.values[4][0]).to.be.equal("");
        expect(values.data.values[4][1]).to.be.equal("jack smith");        
    });
});

async function readFile(filePath) {
    return fs.readFile(filePath).then((data) => {
        return data.toString();
    });
}