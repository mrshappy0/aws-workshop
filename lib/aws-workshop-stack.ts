import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, SourceMapMode } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class AwsWorkshopStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const helloLambda = new NodejsFunction(this, "HelloHandler", {
            runtime: Runtime.NODEJS_22_X,
            entry: "lambda/hello.ts",
            handler: "handler",
            bundling: {
                minify: true,
                sourceMap: true,
                sourceMapMode: SourceMapMode.INLINE,
                sourcesContent: false,
                target: "esnext",
            },
        });

        new LambdaRestApi(this, "HelloAPI", {
            handler: helloLambda,
        });
    }
}
