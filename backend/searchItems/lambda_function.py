import json
import boto3
import logging
import base64
from io import BytesIO
from PIL import Image

# Initialize AWS Rekognition client
rekognition = boto3.client('rekognition')
s3 = boto3.client('s3')

# Set the Logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# S3 bucket name
BUCKET_NAME = 'found-items'

def lambda_handler(event, context):
    logger.info("Received event: %s", json.dumps(event))

    try:
        # Decode the image data from the request body
        image_data = base64.b64decode(event['body'])

        # Check if image_data is empty
        if not image_data:
            logger.error("Received empty image data")
            return create_response(400, "Received empty image data")

        # Process the image and prepare it for Rekognition
        image = Image.open(BytesIO(image_data))
        
        # Convert image to RGB if it has an alpha channel
        if image.mode == 'RGBA':
            image = image.convert('RGB')

        stream = BytesIO()
        image.save(stream, format="JPEG")
        uploaded_image_binary = stream.getvalue()

        # Check if uploaded_image_binary is empty
        if not uploaded_image_binary:
            logger.error("Processed image binary is empty")
            return create_response(400, "Processed image binary is empty")

        # Perform object detection on the uploaded image
        logger.info("Detecting labels in the uploaded image...")
        uploaded_labels = detect_labels(uploaded_image_binary)

        # Retrieve and compare with images in the S3 bucket
        logger.info("Comparing with found items...")
        matches = compare_with_found_items(uploaded_labels)

        return create_response(200, matches)

    except Exception as e:
        logger.error("Error occurred: %s", e)
        return create_response(500, f"Failed because of: {e}")

def create_response(status_code, body):
    """Helper function to create a response with CORS headers."""
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        'body': json.dumps(body)
    }

def detect_labels(image_binary):
    """Detect labels in the provided image binary data."""
    try:
        response = rekognition.detect_labels(
            Image={'Bytes': image_binary},
            MaxLabels=15,
            MinConfidence=70
        )

        labels_info = [
            {'Label': label_info['Name'], 'Confidence': label_info['Confidence']}
            for label_info in response['Labels']
        ]
        return labels_info
    except Exception as e:
        logger.error("Error detecting labels: %s", e)
        raise

def compare_with_found_items(uploaded_labels):
    """Compare the uploaded image labels with images in the S3 folder."""
    matches = []
    try:
        # List objects in the S3 bucket
        response = s3.list_objects_v2(Bucket=BUCKET_NAME)
        if 'Contents' not in response:
            return matches

        # Iterate over each object in the bucket
        for item in response['Contents']:
            # Skip directories
            key = item['Key']
            if key.endswith('/'):
                continue

            # Download the image
            s3_object = s3.get_object(Bucket=BUCKET_NAME, Key=key)
            found_image_binary = s3_object['Body'].read()

            # Check if found_image_binary is empty
            if not found_image_binary:
                logger.error("Found image binary is empty for key: %s", key)
                continue

            # Detect labels in the found image
            found_labels = detect_labels(found_image_binary)

            # Compare labels with uploaded image labels
            if check_labels_match(uploaded_labels, found_labels):
                matches.append({
                    'Image': key,
                    'Labels': found_labels
                })

    except Exception as e:
        logger.error("Error comparing with found items: %s", e)

    return matches

def check_labels_match(uploaded_labels, found_labels):
    """Check if there are matching labels between two sets of labels."""
    uploaded_label_names = {label['Label'] for label in uploaded_labels}
    found_label_names = {label['Label'] for label in found_labels}

    # Define a threshold for a match
    threshold = 2
    common_labels = uploaded_label_names.intersection(found_label_names)

    return len(common_labels) >= threshold