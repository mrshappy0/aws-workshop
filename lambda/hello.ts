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