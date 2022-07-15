# Optimizely Full Stack Feature Flags and Experimentation

[Optimizely Full Stack](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs) is a feature flagging and experimentation platform for websites, mobile apps, chatbots, APIs, smart devices, and anything else with a network connection.

You can deploy code behind feature flags, experiment with A/B tests, and roll out or roll back features immediately. All of this functionality is available with minimal performance impact via easy-to-use, open source SDKs.

---

## Optimizely + AWS Lambda@Edge Starter Kit

> Starter Kit for running Optimizely experiments on [AWS Lambda@Edge Functions](https://aws.amazon.com/lambda/edge/) using AWS Lambda and AWS Cloudfront.

The Optimizely starter kit for AWS's Lambda@Edge embeds and extends our [Javascript SDK](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/javascript-node-sdk) to provide a starting point for you to implement experimentation and feature flagging for your experiences at the edge. 

For a guide to getting started with the Optimizely platform, you can reference our [Javascript Quickstart documentation](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/javascript-node-quickstart) alongside of this starter kit.

Note: This starter kit in particular makes use of the "Lite" version of our Javascript SDK for Node.js.

### External Data Fetching & Caching

This starter kit uses standard ES7 async/await fetch methods to handle external data fetching. After fetching the Optimizely datafile, the datafile itself is cached as a JSON object in-memory. Large datafiles may cause this method presented in the starter kit to break - if you experience issues with large datafiles breaking in-memory Lambda caching, you can consider one of the alternative methods of caching with Lambda@Edge outlined in [this article](https://aws.amazon.com/blogs/networking-and-content-delivery/leveraging-external-data-in-lambdaedge/).

Alternative methods to in-memory data caching include using a persistent connection to your datafile JSON, or caching via CloudFront.

For even faster data fetching, you can consider storing your datafile in an S3 bucket that you own and refactor the datafile fetching mechanism to use Lambda's built-in AWS SDK library and fetch from your S3 bucket instead.

> Note: Additional caching mechanisms may be available through your CloudFront distribution's configuration.

### Identity Management

Out of the box, Optimizely's Full Stack SDKs require a user-provided identifier to be passed in at runtime to drive experiment and feature flag decisions. In case a user ID is not provided directly from the client, this starter kit generates a unique ID as a fallback, stores it into the cookie, and re-uses it to ensure decisions are sticky per user session. Alternatively, you can use an existing unique identifier available within your application and pass it in as the value for the `OPTIMIZELY_USER_ID` cookie.

### Bucketing
For more information on how Optimizely Full Stack SDKs assign users to feature flags and experiments, see [the documentation on how bucketing works](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/how-bucketing-works). 


## How to use

### Prerequisites
In order to use this starter kit, you should have:

   - A basic AWS Lambda@Edge setup already configured. For a tutorial on how to setup a basic AWS Lambda@Edge environment, [click here](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-how-it-works-tutorial.html).
   - An Optimizely account. If you do not have an account, you can [register for a free account](https://www.optimizely.com/products/intelligence/full-stack-experimentation/).

### Get started
1. After your Lambda@Edge environment is prepared, clone this starter kit to your local development environment and run `npm install`.

2. Navigate to `src/index.js` and update the `<YOUR_SDK_KEY_HERE>` and `<YOUR_FLAG_HERE>` values to the respective values from your Optimizely dashboard.

   > Note: You can **not** store environment variables with Lambda@Edge. [Read more about the limitation here](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions-restrictions.html#lambda-requirements-lambda-function-configuration). If you'd like to inject the SDK Key into your Lambda, an alternative method is outlined in [this StackOverflow post](https://stackoverflow.com/questions/54828808/aws-lambdaedge-nodejs-environment-variables-are-not-supported) detailing how to use CloudFront Origin Custom Headers as a workaround.

3. Hook into different lifecycle events by inserting logic to change headers, cookies, and more in the switch-case statement in `src/index.js`.

4. Utilize Optimizely's JavaScript Lite bundle to get decisions and log events to influence the behavior of that logic.

5. Run `npm run build` - this uses Rollup to bundle the source code into a neat .zip file to be imported into Lambda.

   > Note: Notice that a `/dist` folder is generated with the new dist.zip file. It should be roughly ~22kb in size assuming you have not made any additional changes.

6. Upload your function to AWS Lambda via GUI or CLI.

   > Navigate to your AWS Lambda console, select the function associated your Lambda@Edge environment, and import the `dist.zip` file. After you upload it, there should now be a minified `index.js` file located inside of your Lambda function's "Code Source" section.

   > **AWS CLI**: You can use the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) to update your AWS Lambda function programmatically. Example command: `aws lambda update-function-code --function-name my-aws-lambda-at-edge-function --zip-file fileb://dist.zip`.
   >
   > **Lambda Layers**: If you need additional libraries, custom runtimes, or configuration files to use alongside your Lambda function, consider looking into utilizing [Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/invocation-layers.html).

7. After your Lambda Function is set up, ensure that you have provisioned it with Lambda@Edge permissions and associate it with your CloudFront distribution. Set the CloudFront trigger for this function to be "Viewer Request".

   > Note: CloudFront triggers are associated with only one specific version of your Lambda function. Remember to update the CloudFront trigger assignment as needed when pushing new versions of your Lambda function. You may, for example, need to have one function that handles receiving viewer requests (viewer request trigger) and one function that handles returning a response to the viewer (viewer response trigger).

8. Test your Lambda@Edge function - you should see that it returns a simple home page with the results of your feature flag test. Hooray!

   > For more visibility into what the starter kit is accomplishing, you can navigate to your CloudWatch console. Under `Logs` > `Log groups` > `/aws/lambda/<YOUR_LAMBDA_NAME>`, click into your Lambda's log group and view the test. You'll find the entire process of reading the headers, assigning the User ID, fetching the datafile, and making the decision all there.

   > Note: Also provided are:
   >
   > 1. A slightly altered version of `index.js` - `viewer_request.js`, which is a file that outlines how to return a `request` object instead of a `response` object. You can refer to this file when designing functions that only adjust the request to your origin rather than return a response.
   > 2. `viewer_response.js`, which is a file that reads the cookie from the request headers and includes them in the return response. You can refer to this file when accommodating for retrieving a user ID generated from the viewer request hook and re-using it in the viewer response hook.

9. Adjust your Lambda's configuration as needed. For example, you may need to increase your function's memory, storage, and timeout threshold to accommodate your function's needs.

10. From here, how you would like to use Optimizely's experimentation features is up to you. You can modify the cookies and headers based on experimentation results, add hooks to the "Origin Request" and "Origin Response" CloudFront triggers to do things like origin redirects or dynamic asset manipulation, or add more services to the pipeline including your own logging systems, databases, CDN origins, and more. Keep in mind that Lambda@Edge has some limitations - you can familiarize yourself with those by referencing this article - [Edge Functions Restrictions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions-restrictions.html).


## Contributing
If you have further questions, comments, concerns, or contributions, feel free to reach out via GitHub Issues! Please see [CONTRIBUTING](CONTRIBUTING.md).


## Additional resources

- [Lambda - Lambda@Edge offical documentation](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html)
- [CloudFront - Lambda@Edge documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge.html)
- [CloudFront - Lambda@Edge Get Started](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-how-it-works.html)
- [Example Lambda Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-examples.html)
- [Article: Lambda@Edge Gotchas and Tips](https://medium.com/@mnylen/lambda-edge-gotchas-and-tips-93083f8b4152)
- [AWS Lambda@Edge with Optimizely documentation](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/lambda)
