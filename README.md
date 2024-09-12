
# FindItNow

## Overview

[FindItNow](https://finditnow-app.netlify.app/) is an **image recognition-based lost and found system** built on and hosted in the cloud using **Amazon Web Services (AWS)**. The web-based application aims to digitize lost-and-found systems and make the process of locating lost items more efficient.

The system serves two types of users:

- **Individuals who have lost objects:**
  - Users may upload an image of a similar object they have lost, either taken themselves or found online, and then search. The system utilizes image recognition to compare the uploaded image to those in the database of found things and displays any matches.

![SearchForLostItems](https://github.com/user-attachments/assets/7bc0583e-e3b8-469d-9d54-71e779ab6666)

- **Asset Protection or Security departments of malls, retail stores, cinemas, etc:**
  - Administrators can capture and upload images of items found in their lost and found departments to the system. Once an item is claimed and removed from the department, they can delete the image from the system.

![Admin](https://github.com/user-attachments/assets/65f1c7f5-1520-4500-8c6d-f294f25877d9)

## Architecture

![Architecture](https://github.com/user-attachments/assets/46dbb8d8-69c9-4704-ac69-836b4070b999)

### AWS Services

#### Compute
- **`AWS Lambda`**: Runs serverless functions to handle backend logic such as image recognition requests, image uploads, and deletions.
- **`EC2`**: Hosts the frontend **`React`** application, providing a responsive interface for users to interact with the system.

**Note:** Keeping the frontend application deployed on EC2 can incur high costs. To optimize expenses, the frontend is now deployed on [Netlify](https://finditnow-app.netlify.app/).

#### Storage
- **`S3`**: Serves as the primary storage for images of found items.

#### Networking
- **`API Gateway`**: Acts as the interface between the frontend and backend, exposing secure RESTful API endpoints to handle image uploads, searches, and deletions.

#### Authentication
- **`Cognito`**: Manages user authentication and access control, allowing only authorized users to perform admin tasks such as uploading and deleting found item images. This ensures the security and integrity of the system.

#### Image Processing
- **`Rekognition`**: Powers the core image recognition feature, comparing user-uploaded images against those stored in the S3 bucket.

#### Infrastructure as Code (IaC)
- **`AWS CloudFormation`**: Automates the deployment, configuration, and management of AWS resources used in the application, ensuring a consistent infrastructure setup.

## Setup

### Prerequisites

- **`Node.js`** and **`npm`**: Make sure Node.js and npm are installed.
- **`AWS`**: An AWS account is required for provisioning backend resources.

To run FindItNow locally or try out modifications, follow these steps:

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Riddho01/FindItNow.git
   ```

2. Navigate to the CloudFormation directory:
   ```bash
   cd FindItNow/CloudFormation
   ```

3. Apply the CloudFormation stacks to provision the necessary infrastructure:
* First, deploy the EC2 instance to host the frontend React application:

   ```bash
   aws cloudformation create-stack --stack-name finditnow-frontend --template-body file://frontend-ec2-deployment.yaml
   ```

* Next, deploy the backend infrastructure:

   ```bash
   aws cloudformation create-stack --stack-name finditnow-backend --template-body file://backend-deployment.yaml
   ```

**Note:** Before applying the stacks, ensure your AWS credentials are properly configured, and review and modify any hardcoded values in the YAML files, such as role parameters, to match your environment.

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```
**Note:** Ensure that you update the `.env` file with the correct configuration details specific to your infrastructure before proceeding.

## Application Features and Workflow

### 1. Admin Authentication

Admins can visit the Admin Access Portal to authenticate themselves, by clicking the 'Admin' button on the landing page.

![Admin Access Portal](https://github.com/user-attachments/assets/9bfafca1-1cd3-4a4f-8865-e6dd842475a0)

To sign up as an admin, you need a valid access code. This  ensures that only authorized users can create an account and access the central database of found items, preventing unauthorized access.

![Verify Access Code](https://github.com/user-attachments/assets/39b98bd9-8ac5-42de-a109-c63d6ffb2c5b)

If the access code is correct, users can complete the sign-up process by filling out the sign-up form.

![SignUp](https://github.com/user-attachments/assets/d7f6b668-6844-4944-aad9-9a1c89d888c9)

**Note:** Each access code can only be used once.

![UsedAccessCode](https://github.com/user-attachments/assets/554d962b-c500-4ca7-88af-680f23c3ca98)

After signing up, admins must verify their email on the 'Verify Email' tab. Email verification is necessary for login.

![UserNotConfirmed](https://github.com/user-attachments/assets/64ff2ef2-d855-49e3-ab01-e1717df33c39)

![VerificationCodeEmail](https://github.com/user-attachments/assets/191a4f8c-ef3e-4768-8676-ca54a93fe9f7)

![Verify Email](https://github.com/user-attachments/assets/9d28b810-e61a-4c15-946e-0e5cefd8e334)

Once email verification is complete, admins can log in and access the admin dashboard.

![SignIn](https://github.com/user-attachments/assets/d8cfbfc8-55d7-4ac6-afc0-4a87ef47e837)

### 2. Admin Dashboard

The admin dashboard displays all items currently in the lost and found department, referred to as 'found-items'.

![Dashboard](https://github.com/user-attachments/assets/4ca6f47f-5788-4647-8635-bec8f196f038)

Admins can upload images of found items (formats supported: PNG and JPEG).

![Upload Found Item](https://github.com/user-attachments/assets/c1def3a1-5476-4066-9ec9-c3d0909c1ce3)

![Upload](https://github.com/user-attachments/assets/4ee8b5e1-6428-426f-a41b-55e007f3b589)

![Uploaded](https://github.com/user-attachments/assets/243706c4-4667-44a7-812c-a65e5a9c9d1d)

Uploading files in other formats will result in an error.

![IncorrectFormat](https://github.com/user-attachments/assets/a3e19cd4-cf9b-4fcd-987c-8798c1a3b6f0)

Each new image must have a unique name. If the name is not unique, the system will prevent the upload.

![Filename already exists](https://github.com/user-attachments/assets/090a519c-fbbb-49a9-be53-f6441081d1ef)


To remove items from the found-items list, admins can click the bin icon at the bottom of each image and confirm the deletion in the dialog that appears.

![Delete](https://github.com/user-attachments/assets/55f80136-78ed-4302-ae51-c7e2f295e1d5)

### 3. Lost Item Search

Users who have lost items can upload a similar image (PNG or JPEG) either:
- By clicking the upload button and choosing an image

![Lost-Item](https://github.com/user-attachments/assets/31022698-69fd-40c0-b824-7ec5bb1f4785)

- By dragging the image into the system.

![ImageDrag](https://github.com/user-attachments/assets/7d1a206e-5210-48af-8f9f-f9d907558d2f)

Dragging an image with an incorrect file format will generate an error.

![Invalid Format](https://github.com/user-attachments/assets/3677902c-393c-4c5d-86c6-1cd61b527960)

After uploading the image and clicking search, the system will return any matching items if found.

![Matched Items](https://github.com/user-attachments/assets/0224a355-7b6b-4a4e-a4d9-e4ea17c56953)

## Testing

The application was tested with images of different objects: Watch, Wallet, Bottle, Sunglasses and iPad. Below are the search results for each object, showing the uploaded image and the matched item.

### 1. Sunglasses

**Uploaded Image:**

![Sunglass - Lost](https://github.com/user-attachments/assets/1efa724e-8b1e-4d82-a810-55680b3dfdd0)

**Matched Item:**

![Match-Sunglass](https://github.com/user-attachments/assets/af003221-72c7-4d35-9b74-486d555b91dc)

---

### 2. Watch

**Uploaded Image:**

![Watch - Lost](https://github.com/user-attachments/assets/99aaf138-37c5-45fb-8c03-cc8881e5402e)

**Matched Item:**

![Match-Watch](https://github.com/user-attachments/assets/fbbaaae6-b4c7-4021-8579-fdbb6b1e67cc)

---

### 3. Wallet

**Uploaded Image:**

![Wallet- Lost](https://github.com/user-attachments/assets/f177686c-4928-4e5e-b106-2ebfe93c475b)

**Matched Item:**

![Match-Wallet](https://github.com/user-attachments/assets/05f57cb6-64f9-4511-bcfa-1030cb2c9897)

---

### 4. Bottle

**Uploaded Image:**

![Bottle - Lost](https://github.com/user-attachments/assets/d53973df-a171-4fa9-8ace-68dcd062f54b)

**Matched Item:**

![Match-Bottle](https://github.com/user-attachments/assets/31cd9c22-38f6-4255-a0f0-fa31a6c11886)

---

### 5. iPad

**Uploaded Image:**

![iPad - Lost](https://github.com/user-attachments/assets/00fd7b0c-8c94-4a12-81ce-41653a304d11)

**Matched Item:**

![Match-iPad](https://github.com/user-attachments/assets/c8e0d1eb-ce85-4177-8a3e-606a7ca046c3)