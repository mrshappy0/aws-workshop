# Deploying a Hello World Application with AWS CLI (Lambda + API Gateway)

This guide walks you through deploying a simple "Hello World" application using **only AWS CLI commands**. It will set up **AWS Lambda and API Gateway** to create a serverless REST API without using CDK or CloudFormation.

---

## Prerequisites

### Creating an IAM User

Before using AWS CLI, ensure you have an IAM user with the necessary permissions:

1. Go to the [AWS IAM Console](https://console.aws.amazon.com/iam/home?#/users)
2. Click **"Add Users"**
   - Enter a **user name**
   - Check **"Access key - Programmatic access"**
   - Click **Next**
3. Attach **AdministratorAccess** policy
4. Click **Create User** and securely save the **Access Key ID** and **Secret Access Key**

### Installing AWS CLI

Install AWS CLI for your respective OS:

#### **MacOS**

```sh
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg ./AWSCLIV2.pkg -target /
which aws
aws --version
```

#### **Windows**

```sh
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi /qn
aws --version
```

#### **Linux**

Follow steps in the official AWS documentation:
[Install AWS CLI on Linux](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

### Configuring AWS CLI

Once AWS CLI is installed, configure it with your IAM user credentials:

```sh
aws configure
```

You'll be prompted to enter:

- **AWS Access Key ID**
- **AWS Secret Access Key**
- **Default region name** (e.g., `us-east-1`)
- **Default output format** (`json`, `yaml`, or `table`)

Verify the configuration:

```sh
aws sts get-caller-identity
```

This should return your **Account ID**, **User ARN**, and **IAM User Name**.

---

## Step 1: Create an IAM Role for Lambda

AWS Lambda requires an **IAM role** with execution permissions:

```sh
aws iam create-role --role-name LambdaExecutionRole \
    --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [{
        "Effect": "Allow",
        "Principal": {"Service": "lambda.amazonaws.com"},
        "Action": "sts:AssumeRole"
      }]}'
```

Attach the necessary permissions:

```sh
aws iam attach-role-policy --role-name LambdaExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

---

## Step 2: Create a Lambda Function

1. Create a local directory and `index.js` file:

```sh
mkdir lambda && cd lambda
cat << EOF > index.js
exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Hello, World!" })
    };
};
EOF
```

2. Zip the function:

```sh
zip function.zip index.js
```

3. Upload the function to AWS Lambda:

```sh
aws lambda create-function --function-name HelloWorldFunction \
    --runtime nodejs18.x --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/LambdaExecutionRole \
    --handler index.handler --zip-file fileb://function.zip
```

---

## Step 3: Create an API Gateway

1. Create a new REST API:

```sh
aws apigateway create-rest-api --name HelloWorldAPI --region $(aws configure get region)
```

2. Get the **API ID**:

```sh
aws apigateway get-rest-apis --query "items[*].[id,name]" --output table
```

3. Get the **Root Resource ID**:

```sh
aws apigateway get-resources --rest-api-id <API_ID>
```

4. Create a **GET method** for API Gateway:

```sh
aws apigateway put-method --rest-api-id <API_ID> --resource-id <RESOURCE_ID> \
    --http-method GET --authorization-type NONE
```

5. Integrate API Gateway with Lambda:

```sh
aws apigateway put-integration --rest-api-id <API_ID> --resource-id <RESOURCE_ID> \
    --http-method GET --type AWS_PROXY --integration-http-method POST \
    --uri arn:aws:apigateway:$(aws configure get region):lambda:path/2015-03-31/functions/arn:aws:lambda:$(aws configure get region):$(aws sts get-caller-identity --query Account --output text):function:HelloWorldFunction/invocations
```

6. Deploy the API:

```sh
aws apigateway create-deployment --rest-api-id <API_ID> --stage-name prod
```

---

## Step 4: Grant API Gateway Permission to Invoke Lambda

```sh
aws lambda add-permission --function-name HelloWorldFunction \
    --statement-id apigateway-test --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$(aws configure get region):$(aws sts get-caller-identity --query Account --output text):<API_ID>/*/*"
```

---

## Step 5: Test the API

Get the API Gateway endpoint:

```sh
aws apigateway get-stage --rest-api-id <API_ID> --stage-name prod
```

Test the API:

```sh
curl https://<API_ID>.execute-api.$(aws configure get region).amazonaws.com/prod/
```

Expected Output:

```json
{"message":"Hello, World!"}
```

---

## Step 6: Clean Up

To remove the deployed resources:

```sh
aws lambda delete-function --function-name HelloWorldFunction
aws apigateway delete-rest-api --rest-api-id <API_ID>
aws iam delete-role --role-name LambdaExecutionRole
```

This ensures all AWS resources created by this guide are **properly removed**.

