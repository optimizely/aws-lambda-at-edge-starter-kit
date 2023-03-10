# Optimizely AWS Lambda@Edge Starter Kit

This repository houses the AWS Lambda@Edge Starter Kit which provides a quickstart for users who would like to use Optimizely Feature Experimentation and Optimizely Full Stack (legacy) with AWS Lambda@Edge.

Optimizely Feature Experimentation is an A/B testing and feature management tool for product development teams that enables you to experiment at every step. Using Optimizely Feature Experimentation allows for every feature on your roadmap to be an opportunity to discover hidden insights. Learn more at [Optimizely.com](https://www.optimizely.com/products/experiment/feature-experimentation/), or see the [developer documentation](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/welcome).

Optimizely Rollouts is [free feature flags](https://www.optimizely.com/free-feature-flagging/) for development teams. You can easily roll out and roll back features in any application without code deploys, mitigating risk for every feature on your roadmap.

## Get Started

Refer to the [Optimizely AWS Lambda@Edge Starter Kit documentation](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/aws-lambda-at-edge) for detailed instructions about using this starter kit.

### Prerequisites

1. You will need an **Optimizely Account**. If you do not have an account, you can [register for a free account](https://www.optimizely.com/products/intelligence/full-stack-experimentation/).
 
2. You will need an **AWS Account with Lambda@Edge Access**. For more information, visit the official [AWS Lambda@Edge product page here](https://aws.amazon.com/lambda/edge/).

### Requirements

You must first have a basic AWS Lambda@Edge environment set up. To do so, follow the instructions listed on the [official Lambda@Edge Developer Guide here](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-how-it-works-tutorial.html).

This will include the following steps:

1. **Sign up for an AWS account**. If you haven't already done so, sign up for Amazon Web Services at [https://aws.amazon.com/](https://aws.amazon.com/). Choose Sign Up Now and enter the required information.

2. **Create a CloudFront distribution**. Learn more about AWS CloudFront on the [official CloudFront Developer Guide here](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html).

3. **Create your function**. Navigate to AWS Lambda and create a new function using the "cloudfront-modify-response-header" blueprint.

4. **Add a CloudFront trigger to run the function**. In your Lambda function settings, configure your CloudFront distribution to be the trigger for your Lambda function.

### Install the Starter Kit

5. After your Lambda@Edge environment is prepared, clone this starter kit to your local development environment and run `npm install`.

## Use the AWS Lambda@Edge Starter Kit

The Optimizely starter kit for Akamai's EdgeWorkers embeds and extends our [Javascript (Node) SDK](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/javascript-node-sdk). For a guide to getting started with our platform more generally, you can reference our [Javascript (Node) Quickstart developer documentation](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/javascript-node-quickstart).

> Note: This starter kit in particular makes use of the "Lite" version of our Javascript SDK for Node.js which explicitly excludes the datafile manager and event processor features for better performance. As a result, it is expected that you will provide the datafile manually to the Optimizely SDK either through a local file reference or by using the provided platform-specific `getDatafile()` helper to load in your Optimizely project's datafile.

### Initialization

Sample code is included in `src/index.js` that shows examples of initializing and using the Optimizely JavaScript (Node) SDK interface for performing common functions such as creating user context, adding a notification listener, and making a decision based on the created user context.

Additional platform-specific code is included in `src/optimizely_helpers.js` which provide workarounds for otherwise common features of the Optimizely SDK.

### Get started

1. Navigate to `src/index.js` and update the `<YOUR_SDK_KEY_HERE>` and `<YOUR_FLAG_HERE>` values to the respective values from your Optimizely dashboard.

   > Note: You can **not** store environment variables with Lambda@Edge. [Read more about the limitation here](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions-restrictions.html#lambda-requirements-lambda-function-configuration). If you'd like to inject the SDK Key into your Lambda, an alternative method is outlined in [this StackOverflow post](https://stackoverflow.com/questions/54828808/aws-lambdaedge-nodejs-environment-variables-are-not-supported) detailing how to use CloudFront Origin Custom Headers as a workaround.

2. Hook into different lifecycle events by inserting logic to change headers, cookies, and more in the switch-case statement in `src/index.js`.

3. Utilize Optimizely's JavaScript Lite bundle to get decisions and log events to influence the behavior of that logic.

4. Run `npm run build` - this uses Rollup to bundle the source code into a neat .zip file to be imported into Lambda.

   > Note: Notice that a `/dist` folder is generated with the new dist.zip file. It should be roughly ~22kb in size assuming you have not made any additional changes.

5. Upload your function to AWS Lambda via GUI or CLI.

   > Navigate to your AWS Lambda console, select the function associated your Lambda@Edge environment, and import the `dist.zip` file. After you upload it, there should now be a minified `index.js` file located inside of your Lambda function's "Code Source" section.

   > **AWS CLI**: You can use the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) to update your AWS Lambda function programmatically. Example command: `aws lambda update-function-code --function-name my-aws-lambda-at-edge-function --zip-file fileb://dist.zip`.
   >
   > **Lambda Layers**: If you need additional libraries, custom runtimes, or configuration files to use alongside your Lambda function, consider looking into utilizing [Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/invocation-layers.html).

6. After your Lambda Function is set up, provision it with Lambda@Edge permissions and associate it with your CloudFront distribution. Set the CloudFront trigger for this function to be "Viewer Request".

   > Note: CloudFront triggers are associated with only one specific version of your Lambda function. Remember to update the CloudFront trigger assignment as needed when pushing new versions of your Lambda function. You may, for example, need to have one function that handles receiving viewer requests (viewer request trigger) and one function that handles returning a response to the viewer (viewer response trigger).

7. Test your Lambda@Edge function - you should see that it returns a simple home page with the results of your feature flag test. Hooray!

   > For more visibility into what the starter kit is accomplishing, you can navigate to your CloudWatch console. Under `Logs` > `Log groups` > `/aws/lambda/<YOUR_LAMBDA_NAME>`, click into your Lambda's log group and view the test. You'll find the entire process of reading the headers, assigning the User ID, fetching the datafile, and making the decision all there.

   > Note: Also provided are:
   >
   > 1. A slightly altered version of `index.js` - `viewer_request.js`, which is a file that outlines how to return a `request` object instead of a `response` object. You can refer to this file when designing functions that only adjust the request to your origin rather than return a response.
   > 2. `viewer_response.js`, which is a file that reads the cookie from the request headers and includes them in the return response. You can refer to this file when accommodating for retrieving a user ID generated from the viewer request hook and re-using it in the viewer response hook.

8. Adjust your Lambda's configuration as needed. For example, you may need to increase your function's memory, storage and timeout threshold to accommodate your function's needs.

9. From here, you can use Optimizely's experimentation features as desired. You can modify the cookies and headers based on experimentation results, add hooks to the "Origin Request" and "Origin Response" CloudFront triggers to do things like origin redirects or dynamic asset manipulation, or add more services to the pipeline including your own logging systems, databases, CDN origins and more. Keep in mind that Lambda@Edge has some limitations - you can familiarize yourself with those by referencing this article - [Edge Functions Restrictions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions-restrictions.html).

## Additional Resources and Concepts

### External Data Fetching & Caching

This starter kit uses standard ES7 async/await fetch methods to handle external data fetching. After fetching the Optimizely datafile, the datafile itself is cached as a JSON object in-memory. Large datafiles may cause this method presented in the starter kit to break. If you experience issues with large datafiles breaking in-memory Lambda caching, you can consider one of the alternative methods of caching with Lambda@Edge outlined in [this article](https://aws.amazon.com/blogs/networking-and-content-delivery/leveraging-external-data-in-lambdaedge/).

Alternative methods to in-memory data caching include using a persistent connection to your datafile JSON or caching via CloudFront.

For even faster data fetching, you can consider storing your datafile in an S3 bucket that you own and refactor the datafile fetching mechanism to use Lambda's built-in AWS SDK library and fetch from your S3 bucket instead.

> Note: Additional caching mechanisms may be available through your CloudFront distribution's configuration.

### Identity Management

Out of the box, Optimizely's Feature Experimentation SDKs require a user-provided identifier to be passed in at runtime to drive experiment and feature flag decisions. In case a user ID is not provided directly from the client, this starter kit generates a unique ID as a fallback, stores it into the cookie and re-uses it to ensure decisions are sticky per user session. Alternatively, you can use an existing unique identifier available within your application and pass it in as the value for the `OPTIMIZELY_USER_ID` cookie.

### Bucketing

For more information on how Optimizely Feature Experimentation SDKs assign users to feature flags and experiments, see [the documentation on how bucketing works](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/how-bucketing-works). 

### AWS Lambda@Edge

For more information about AWS Lambda@Edge, you may visit the following resources:

- [Lambda - Lambda@Edge offical documentation](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html)
- [CloudFront - Lambda@Edge documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge.html)
- [CloudFront - Lambda@Edge Get Started](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-how-it-works.html)
- [Example Lambda Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-examples.html)
- [Article: Lambda@Edge Gotchas and Tips](https://medium.com/@mnylen/lambda-edge-gotchas-and-tips-93083f8b4152)
- [Optimizely AWS Lambda@Edge Starter Kit Documentation](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/aws-lambda-at-edge)

## SDK Development

### Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md).

### Other Optimizely SDKs

- Agent - https://github.com/optimizely/agent

- Android - https://github.com/optimizely/android-sdk

- C# - https://github.com/optimizely/csharp-sdk

- Flutter - https://github.com/optimizely/optimizely-flutter-sdk

- Go - https://github.com/optimizely/go-sdk

- Java - https://github.com/optimizely/java-sdk

- JavaScript - https://github.com/optimizely/javascript-sdk

- PHP - https://github.com/optimizely/php-sdk

- Python - https://github.com/optimizely/python-sdk

- React - https://github.com/optimizely/react-sdk

- Ruby - https://github.com/optimizely/ruby-sdk

- Swift - https://github.com/optimizely/swift-sdk

### Other Optimizely Edge Starter Kits

- Akamai EdgeWorkers - https://github.com/optimizely/akamai-edgeworker-starter-kit

- Cloudflare Workers - https://github.com/optimizely/cloudflare-worker-template

- Fastly Compute@Edge - https://github.com/optimizely/fastly-compute-starter-kit

- Vercel Functions - https://github.com/optimizely/vercel-examples/tree/main/edge-functions/feature-flag-optimizely