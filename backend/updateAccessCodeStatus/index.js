const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
    const { code } = event;

    if (!code) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Code is required' }),
        };
    }

    const params = {
        TableName: 'FindItNow-AccessCodes',
        Key: { code },
        UpdateExpression: 'SET isUsed = :isUsed',
        ExpressionAttributeValues: {
            ':isUsed': true,
        },
        ConditionExpression: 'attribute_exists(code)',
        ReturnValues: 'UPDATED_NEW',
    };

    try {
        await dynamoDb.update(params).promise();
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Code updated successfully' }),
        };
    } catch (error) {
        if (error.code === 'ConditionalCheckFailedException') {
    
            return {
                statusCode: 404,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Code not found' }),
            };
        }
        console.error('Error updating code:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Could not update code' }),
        };
    }
};
