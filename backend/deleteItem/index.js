const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    const bucketName = event.bucket;
    const fileKey = event.key;

    const params = {
        Bucket: bucketName,
        Key: fileKey
    };

    try {
        await s3.deleteObject(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify(`File ${fileKey} successfully deleted from bucket ${bucketName}`)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(`Error deleting file ${fileKey} from bucket ${bucketName}: ${error}`)
        };
    }
};
