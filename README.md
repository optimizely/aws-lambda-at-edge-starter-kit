# Optimizely + AWS Lambda@Edge Starter Kit

> Starter Kit for running Optimizely experiments on AWS Lambda@Edge Functions using AWS Lambda and AWS Cloudfront.

---

### Starter Kit Usage

0. Setup a basic CloudFront and AWS Lambda@Edge connection by following [this tutorial from AWS](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-how-it-works-tutorial.html).

1. Clone this starter kit and run `npm install`.

2. Update the `YOUR_SDK_KEY_HERE` and `YOUR_FLAG_HERE` values in `src/main.js` to the respective values from your Optimizely dashboard.

3. Hook into different lifecycle events by inserting logic to change headers, cookies, and more in the switch-case statement in `src/main.js`.

4. Utilize Optimizely's JavaScript Lite bundle to get decisions and log events to influence the behavior of that logic.

5. Run `npm run build` - notice that a `/dist` folder is generated.

6. Use the generated `bundle.js` file if using Lambda Layers with node_modules pre-installed in the environment. Otherwise, import the `dist.zip` file to Lambda and use that. (TODO: Update this bullet point with correct information after finished with starter kit.)

> AWS CLI: You can use the AWS CLI ([Install Here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)), to update your AWS Lambda function using the `update-function-code` command like so: `aws lambda update-function-code --function-name my-aws-lambda-at-edge-function --zip-file fileb://dist.zip`.

> Lambda Layers: You can also provision Lambda Layers (TODO: Update docs regarding Lambda Layers)

Note: CloudFront triggers are associated with only one specific version of your Lambda function. Remember to update the CloudFront trigger assignment as needed when pushing new versions of your Lambda function.

---

### Why use Lambda@Edge?

- **Speed**: Take advantage of CloudFront's reduction in latency.

- **Cost**: Consolidate requests and removes transfer out fees from AWS origins.

- **Security**: Improved security from DDOS attacks through AWS Standard Shield.

### Lambda@Edge Use Cases

With Lambda@Edge, you can build a variety of solutions, for example:

- Inspect cookies to rewrite URLs to different versions of a site for A/B testing.

- Send different objects to your users based on the User-Agent header, which contains information about the device that submitted the request. For example, you can send images in different resolutions to users based on their devices.

- Inspect headers or authorized tokens, inserting a corresponding header and allowing access control before forwarding a request to the origin.

- Add, delete, and modify headers, and rewrite the URL path to direct users to different objects in the cache.

- Generate new HTTP responses to do things like redirect unauthenticated users to login pages, or create and deliver static webpages right from the edge. For more information, see Using Lambda functions to generate HTTP responses to viewer and origin requests in the Amazon CloudFront Developer Guide.

### Lambda@Edge Restrictions

- There are some restrictions to using Lambda@Edge. Please read the [official documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions-restrictions.html) for the most up-to-date details.

### Additional Resources

- [Lambda - Lambda@Edge Docs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html)
- [CloudFront - Lambda@Edge Docs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge.html)
- [CloudFront - Lambda@Edge Get Started](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-how-it-works.html)
- [Example Lambda Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-examples.html)
