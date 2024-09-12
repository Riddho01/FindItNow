const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    const bucketName = 'found-items';
    try {
        const data = await s3.listObjectsV2({ Bucket: bucketName }).promise();
        const items = data.Contents.map(item => item.Key);
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Allows all origins
                'Access-Control-Allow-Methods': 'GET, OPTIONS', // Allows GET and OPTIONS methods
                'Access-Control-Allow-Headers': 'Content-Type', // Allows specific headers
            },
            body: JSON.stringify(items),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({ error: 'Failed to list items' }),
        };
    }
};
