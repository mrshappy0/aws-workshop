# Deploying a Hello World Application with AWS Console (Lambda + API Gateway)

This guide walks you through deploying a simple **Hello World** application using the **AWS Console**. It will set up **AWS Lambda and API Gateway** to create a serverless REST API without using the AWS CLI, CDK, or CloudFormation.

---

## **Prerequisites**

### **Sign in to the AWS Management Console**

Go to [AWS Console](https://aws.amazon.com/console/) and log in with your credentials.

---

## **Step 1: Create an IAM Role for Lambda**

1. Navigate to **IAM Service**: [IAM Console](https://console.aws.amazon.com/iam/).
2. Click **Roles** on the left sidebar.
3. Click **Create Role**.
4. Under **Trusted entity type**, select **AWS service**.
5. Choose **Lambda** as the service.
6. Click **Next** and attach the **AWSLambdaBasicExecutionRole** policy.
7. Click **Next: Review**.
8. Name the role **LambdaExecutionRole** and click **Create Role**.

---

## **Step 2: Create a Lambda Function**

1. Navigate to **Lambda Service**: [Lambda Console](https://console.aws.amazon.com/lambda/).
2. Click **Create function**.
3. Choose **Author from scratch**.
4. Enter **Function name**: `HelloWorldFunction`.
5. Select **Runtime**: `Node.js 22.x`.
6. Expand **Change default execution role**:
    - Select **Use an existing role**.
    - Choose **LambdaExecutionRole**.
7. Click **Create function**.
8. Scroll down to the **Code source** section and click **Edit**.
9. Replace the existing code with:

```javascript
export default async function handler(event) {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Hello, World!" })
    };
};
```

Update Lambda Handler Setting for ES Modules

10. If using ES module syntax (export default), update the handler reference:
11. Go to Lambda Console → HelloWorldFunction.
12. Click Edit under Runtime Settings.
13. Change the Handler from `index.handler` to `index.default`.
14. Click Save.
15. Click **Deploy**.

---

## **Step 3: Create an API Gateway**

1. Navigate to **API Gateway**: [API Gateway Console](https://console.aws.amazon.com/apigateway/).
2. Click **Create API**.
3. Choose **REST API** and select **Build**.
4. Select **New API** and enter:
    - **API name**: `HelloWorldAPI`
    - **Endpoint Type**: `Regional`
5. Click **Create API**.
6. In the left sidebar, click **Actions** → **Create Resource**.
    - Enter **Resource Name**: `hello`
    - Click **Create Resource**.
7. Click **Actions** → **Create Method**.
    - Choose **GET** from the dropdown and click the checkmark.
    - Select **Integration type**: `Lambda Function`
    - Check **Use Lambda Proxy Integration**.
    - Enter **Lambda Function**: `HelloWorldFunction`
    - Click **Save** and **OK** in the permission prompt.
8. Click **Actions** → **Deploy API**.
    - **Deployment stage**: `New Stage`
    - **Stage Name**: `prod`
    - Click **Deploy**.

---

## **Step 4: Grant API Gateway Permission to Invoke Lambda**

1. Go to **Lambda Service**: [Lambda Console](https://console.aws.amazon.com/lambda/).
2. Click on `HelloWorldFunction`.
3. Click the **Permissions** tab.
4. Click **Add permissions** → **Create inline policy**.
5. Choose **Service**: `API Gateway`.
6. Select **Action**: `lambda:InvokeFunction`.
7. Under **Resources**, select **Specific** → **Add ARN**.
8. Paste the API Gateway ARN (found in API Gateway → Stages → `prod`).
9. Click **Review policy**.
10. Name the policy **APIGatewayInvokeLambda** and click **Create policy**.

---

## **Step 5: Test the API**

1. In **API Gateway Console**, navigate to **Stages** → **prod**.
2. Copy the **Invoke URL**.
3. Open a new browser tab or terminal and run:

```sh
curl https://your-api-gateway-id.execute-api.your-region.amazonaws.com/prod/hello
```

Expected Output:

```json
{ "message": "Hello, World!" }
```

---

## **Step 6: Clean Up**

To remove the deployed resources manually:

1. **Delete Lambda Function**:

    - Go to [Lambda Console](https://console.aws.amazon.com/lambda/).
    - Click on `HelloWorldFunction`.
    - Click **Actions** → **Delete function**.

2. **Delete API Gateway**:

    - Go to [API Gateway Console](https://console.aws.amazon.com/apigateway/).
    - Click on `HelloWorldAPI`.
    - Click **Actions** → **Delete API**.

3. **Delete IAM Role**:
    - Go to [IAM Console](https://console.aws.amazon.com/iam/).
    - Click on **Roles**.
    - Find `LambdaExecutionRole` and **Detach any attached policies**.
    - Click **Delete role**.

---
