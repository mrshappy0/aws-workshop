# Deploying a Hello World Application with AWS CloudFormation (Lambda + API Gateway)

This guide walks you through deploying a simple "Hello World" application using AWS CloudFormation. It leverages AWS Lambda and API Gateway to create a serverless REST API.

---

## Prerequisites

### Creating an IAM User

Before installing the AWS CLI, ensure you have an IAM user with the necessary permissions:

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

Refer to the official AWS documentation for a detailed guide: [AWS CLI Quickstart](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html)
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

Ensure you have the following installed and configured:

[AWS CLI](https://aws.amazon.com/cli/) - Install it using:
   ```sh
   curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
   sudo installer -pkg AWSCLIV2.pkg -target /
   ```
   After installation, configure it with:
   ```sh
   aws configure
   ```
   Follow the prompts to set up your AWS Access Key, Secret Key, default region, and output format.

## Step 1: Create a CloudFormation Template

Create a new directory for your CloudFormation project:

```sh
mkdir hello-world-cloudformation && cd hello-world-cloudformation
```

Create a file called `template.yml`:

```sh
touch template.yml
```

Add the following CloudFormation YAML to define a Lambda function and an API Gateway:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: Deploys a Lambda function with API Gateway

Resources:
  HelloWorldFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: HelloWorldFunction
      Handler: index.handler
      Runtime: nodejs18.x
      Code:
        ZipFile: |
          exports.handler = async (event) => {
            return {
              statusCode: 200,
              body: JSON.stringify({ message: "Hello, World!" })
            };
          };
      Role: !GetAtt LambdaExecutionRole.Arn

  LambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      Policies:
        - PolicyName: LambdaBasicExecution
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - logs:CreateLogGroup
                  - logs:CreateLogStream
                  - logs:PutLogEvents
                Resource: '*'

  ApiGateway:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: HelloWorldAPI

  RootMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref ApiGateway
      ResourceId: !GetAtt ApiGateway.RootResourceId
      HttpMethod: GET
      AuthorizationType: NONE
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub
          - "arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${LambdaArn}/invocations"
          - LambdaArn: !GetAtt HelloWorldFunction.Arn

  ApiGatewayDeployment:
    Type: AWS::ApiGateway::Deployment
    Properties:
      RestApiId: !Ref ApiGateway
      Description: "Initial deployment"
    DependsOn:
      - RootMethod

  ApiGatewayStage:
    Type: AWS::ApiGateway::Stage
    Properties:
      StageName: prod
      RestApiId: !Ref ApiGateway
      DeploymentId: !Ref ApiGatewayDeployment
    DependsOn:
      - ApiGatewayDeployment

Outputs:
  ApiEndpoint:
    Description: "API Gateway endpoint URL for Hello World function"
    Value: !Sub "https://${ApiGateway}.execute-api.${AWS::Region}.amazonaws.com/prod/"
```

## Step 2: Deploy the CloudFormation Stack

Run the following command to deploy your stack:

```sh
aws cloudformation deploy --template-file template.yml --stack-name HelloWorldStack --capabilities CAPABILITY_NAMED_IAM
```

This will create the Lambda function, API Gateway, and necessary IAM roles.

## Step 3: Deploy API Gateway and Test the API

After deployment, get the API Gateway endpoint:

```sh
aws cloudformation describe-stacks --stack-name HelloWorldStack --query "Stacks[0].Outputs" --output table
```

### Test the API

Once deployed, test the API using:

```sh
curl https://your-api-gateway-id.execute-api.your-region.amazonaws.com/prod/
```

Expected Output:

```json
{"message":"Hello, World!"}
```

## Step 4: Clean Up

To delete the deployed resources:

```sh
aws cloudformation delete-stack --stack-name HelloWorldStack
```
