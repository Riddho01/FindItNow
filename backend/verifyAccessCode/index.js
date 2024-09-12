const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = 'FindItNow-AccessCodes';

exports.handler = async (event) => {

    const {code}=event;

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, PUT',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (!code) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'Code is required' }),
        };
    }

    try {
            const params = {
                TableName: tableName,
                Key: { code },
            };

            const result = await dynamoDb.get(params).promise();

            if (!result.Item) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ message: 'Invalid code' }),
                };
            }

            if (result.Item.isUsed) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ message: 'Code has already been used' }),
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'Code is valid' }),
            };

        }catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};