# Deploying a Hello World Application with AWS CDK (Lambda + API Gateway)

This guide walks you through deploying a simple "Hello World" application using AWS Cloud Development Kit (CDK). It leverages AWS Lambda and API Gateway to create a serverless REST API.

---

## Prerequisites

#### Creating an IAM User

Before installing the AWS CLI, ensure you have an IAM user with the necessary permissions:

1. Go to the [AWS IAM Console](https://console.aws.amazon.com/iam/home?#/users)
2. Click **"Add Users"**
   - Enter a **user name**
   - Check **"Access key - Programmatic access"**
   - Click **Next**
3. Attach **AdministratorAccess** policy
4. Click **Create User** and securely save the **Access Key ID** and **Secret Access Key**

#### Installing AWS CLI

Install AWS CLI for your respective OS:

##### **MacOS**

```sh
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg ./AWSCLIV2.pkg -target /
which aws
aws --version
```

##### **Windows**

```sh
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi /qn
aws --version
```

##### **Linux**

Follow steps in the official AWS documentation:
[Install AWS CLI on Linux](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

#### Configuring AWS CLI

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

1. [AWS CLI](https://aws.amazon.com/cli/) - Install it using:
   ```sh
   curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
   sudo installer -pkg AWSCLIV2.pkg -target /
   ```
   After installation, configure it with:
   ```sh
   aws configure
   ```
   Follow the prompts to set up your AWS Access Key, Secret Key, default region, and output format.
2. Typescript - install it using:
```sh
npm install -g typescript
```
---------------------------------------------------------------------------------
## Step 1: Initialize the CDK Project

```sh
mkdir hello-world-cdk && cd hello-world-cdk
npx cdk init app --language=typescript
```

This creates a new AWS CDK project in TypeScript.

## Step 2: Install Dependencies

```sh
npm i aws-lambda @aws-cdk/aws-lambda @aws-cdk/aws-apigateway
npm i --save-dev @types/aws-lambda esbuild
```

## Step 3: Write the Lambda Function

Create a new directory for the Lambda function:

```sh
mkdir lambda && touch lambda/hello.ts
```

Edit `lambda/hello.ts` and add the following code (ensure `aws-lambda` is installed using `npm install @types/aws-lambda` if missing):

```typescript
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Context,
} from "aws-lambda";

interface MyEvent extends APIGatewayProxyEvent {
    message: string;
}

export const handler = async (
    event: MyEvent,
    _: Context
): Promise<APIGatewayProxyResult> => {
    console.log(`Received event: ${JSON.stringify(event)}`);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Hello, ${event.message ?? "World"}!`,
        }),
    };
};
```

## Step 4: Define the CDK Stack

Edit `lib/hello-world-cdk-stack.ts` and replace the contents with:

```typescript
import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, OutputFormat, SourceMapMode } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class HelloWorldCdkStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // Create Lambda Function
        const helloLambda = new NodejsFunction(this, "HelloLambda", {
            entry: "lambda/hello.ts",
            functionName: 'hello-world',
            handler: "handler",
            runtime: Runtime.NODEJS_22_X,
            bundling: {
                minify: true,
                sourceMap: true,
                sourceMapMode: SourceMapMode.INLINE,
                sourcesContent: false,
                target: 'esnext',
              }
        });

        // Create API Gateway
        new LambdaRestApi(this, "HelloApi", {
            handler: helloLambda,
        });
    }
}
```

## Step 5: Deploy the Application

Synthesize the CloudFormation template:
```sh
npx cdk synth
```

Deploy the stack to AWS:

```sh
npx cdk bootstrap
npx cdk deploy
```

## Step 6: Test the API

Once deployment completes, note the API Gateway endpoint from the output.
Test it using:

```sh
curl https://your-api-gateway-id.execute-api.your-region.amazonaws.com/prod/
```

Expected Output:

```json
{"message":"Hello, World!"}
```

## Step 7: Clean Up (Optional)

To remove the deployed resources:

```sh
npx cdk destroy
```