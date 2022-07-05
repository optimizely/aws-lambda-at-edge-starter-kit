# Optimizely Full Stack Feature Flags and Experimentation

[Optimizely Full Stack](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs) is a feature flagging and experimentation platform for websites, mobile apps, chatbots, APIs, smart devices, and anything else with a network connection.

You can deploy code behind feature flags, experiment with A/B tests, and roll out or roll back features immediately. All of this functionality is available with minimal performance impact via easy-to-use, open source SDKs.

---

# Optimizely + AWS Lambda@Edge Starter Kit

> Starter Kit for running Optimizely experiments on AWS Lambda@Edge Functions using AWS Lambda and AWS Cloudfront.

The Optimizely starter kit for AWS's Lambda@Edge embeds and extends our [Javascript SDK](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/javascript-node-sdk) to provide a starting point for you to implement experimentation and feature flagging for your experiences at the edge. For a guide to getting started with the Optimizely platform, you can reference our [Javascript Quickstart documentation](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/javascript-node-quickstart) alongside of this starter kit.

Note: This starter kit in particular makes use of the "Lite" version of our Javascript SDK for Node.js.

### **External Data Fetching & Caching**

This starter kit uses standard ES7 async/await fetch methods to handle external data fetching. After fetching the Optimizely datafile, the datafile itself is cached as a JSON object in-memory. Large datafiles may cause this method presented in the starter kit to break - if you experience issues with large datafiles breaking in-memory Lambda caching, you can consider one of the alternative methods of caching with Lambda@Edge outlined in [this article here](https://aws.amazon.com/blogs/networking-and-content-delivery/leveraging-external-data-in-lambdaedge/).

Alternative methods to in-memory data caching include using a persistent connection to your datafile JSON, or caching via CloudFront.

For even faster data fetching, you can consider storing your datafile in an S3 bucket that you own and refactor the datafile fetching mechanism to use Lambda's built-in AWS SDK library and fetch from your S3 bucket instead.

### **Identity Management**

Out of the box, Optimizely's Full Stack SDKs require a user-provided identifier to be passed in at runtime to drive experiment and feature flag decisions. In case a user ID is not provided directly from the client, this starter kit generates a unique ID as a fallback, stores it into the cookie, and re-uses it to ensure decisions are sticky per user session. Alternatively, the client can provide a unique identifier itself by passing it in as a value for the `OPTIMIZELY_USER_ID` cookie.

### **Bucketing**

For more information on how Optimizely Full Stack SDKs bucket visitors, [click here](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/how-bucketing-works).

---

# How to Use this Starter Kit

> **Pre-requisites:**
> In order to use this starter kit, you should have:
>
> - A basic AWS Lambda@Edge setup already configured. [For a tutorial on how to setup a basic AWS Lambda@Edge environment, click here.](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-how-it-works-tutorial.html).
> - An Optimizely account. [To sign up for an Optimizely account, click here.](https://www.optimizely.com/products/intelligence/full-stack-experimentation/)

1. After your Lambda@Edge environment is prepared, clone this starter kit to your local development environment and run `npm install`.

2. Navigate to `src/main.js` and update the `<YOUR_SDK_KEY_HERE>` and `<YOUR_FLAG_HERE>` values to the respective values from your Optimizely dashboard.

   > Note: It is recommended to store your SDK Key in your Lambda environment variables instead for production. To do so, navigate to your Lambda console and select `Configuration` > `Environment variables` and click `"Edit"`. Click `"Add environment variable"` and add your SDK to a new variable with the key `OPTIMIZELY_SDK_KEY`.

3. Hook into different lifecycle events by inserting logic to change headers, cookies, and more in the switch-case statement in `src/main.js`.

4. Utilize Optimizely's JavaScript Lite bundle to get decisions and log events to influence the behavior of that logic.

5. Run `npm run build` - this uses Rollup to bundle the source code into a neat .zip file to be imported into Lambda.

   > Note: Notice that a `/dist` folder is generated with the new dist.zip file - it should be roughly ~22kb in size assuming you've changed nothing else.

6. Upload your function to AWS Lambda via GUI or CLI.

   > Navigate to your AWS Lambda console, select the function associated your Lambda@Edge environment, and import the `dist.zip` file. After you upload it, there should now be a minified `main.js` file located inside of your Lambda function's "Code Source" section.

   > **AWS CLI**: You can use the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) to update your AWS Lambda function programmatically. Example command: `aws lambda update-function-code --function-name my-aws-lambda-at-edge-function --zip-file fileb://dist.zip`.
   >
   > **Lambda Layers**: If you need additional libraries, custom runtimes, or configuration files to use alongside your Lambda function, consider looking into utilizing [Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/invocation-layers.html).

7. After your Lambda Function is set up, ensure that you have provisioned it with Lambda@Edge permissions and associate it with your CloudFront distribution. Set the CloudFront trigger for this function to be "Viewer Request".

   > Note: CloudFront triggers are associated with only one specific version of your Lambda function. Remember to update the CloudFront trigger assignment as needed when pushing new versions of your Lambda function. You may, for example, need to have one function that handles receiving viewer requests (viewer request trigger) and one function that handles returning a response to the viewer (viewer response trigger).

8. Test your Lambda@Edge function - you should see that it returns a simple home page with the results of your feature flag test. Hooray!

   > Example Endpoint: https://7qv3bw2fnoxkgy3tlhin7p7x3e0bebtk.lambda-url.us-east-1.on.aws/

   > For more visibility into what the starter kit is accomplishing, you can navigate to your CloudWatch console. Under `Logs` > `Log groups` > `/aws/lambda/<YOUR_LAMBDA_NAME>`, click into your Lambda's log group and view the test. You'll find the entire process of reading the headers, assigning the User ID, fetching the datafile, and making the decision all there.

   > Note: Also provided are:
   > 1. A slightly altered version of `index.js` - `viewer_request.js`, which is a file that outlines how to return a `request` object instead of a `response` object. You can refer to this file when designing functions that only adjust the request to your origin rather than return a response.
   > 2. `viewer_response.js`, which is a file that reads the cookie from the request headers and includes them in the return response. You can refer to this file when accommodating for retrieving a user ID generated from the viewer request hook and re-using it in the viewer response hook.

9. From here, how you'd like to use Optimizely's experimentation features is up to you! You can modify the cookies and headers based on experimentation results, add hooks to the "Origin Request" and "Origin Response" CloudFront triggers to do things like origin redirects or dynamic asset manipulation, or add more services to the pipeline including your own logging systems, databases, CDN origins, and more. Keep in mind that Lambda@Edge has some limitations - you can familiarize yourself with those by referencing this article - [Edge Functions Restrictions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions-restrictions.html).

If you have further questions, comments, concerns, or contributions, feel free to reach out via GitHub Issues!

---

# Lambda@Edge

### **Why use Lambda@Edge?**

- **Speed**: Take advantage of CloudFront's reduction in latency by extending your compute location closer to your users.

- **Cost**: Consolidate requests and remove transfer out fees from AWS origins.

- **Security**: Improved security from DDOS attacks through AWS Standard Shield.

### **Lambda@Edge Use Cases**

With Lambda@Edge, you can build a variety of solutions, for example:

- Inspect cookies to rewrite URLs to different versions of a site for A/B testing.

- Send different objects to your users based on the User-Agent header, which contains information about the device that submitted the request. For example, you can send images in different resolutions to users based on their devices.

- Inspect headers or authorized tokens, inserting a corresponding header and allowing access control before forwarding a request to the origin.

- Add, delete, and modify headers, and rewrite the URL path to direct users to different objects in the cache.

- Generate new HTTP responses to do things like redirect unauthenticated users to login pages, or create and deliver static webpages right from the edge. For more information, see Using Lambda functions to generate HTTP responses to viewer and origin requests in the Amazon CloudFront Developer Guide.

In this starter kit's case, we utilize Lambda@Edge to call to your Optimizely datafile and make decisions on whether feature flags are enabled or disabled based on an incoming user ID by checking the value of `OPTIMIZELY_USER_ID` from the cookies.

### **Lambda@Edge Restrictions & Limitations**

- There are some restrictions to using Lambda@Edge. Please read the [official documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions-restrictions.html) for the most up-to-date details.

- As of July 2022, the maximum compressed size of a Lambda@Edge package can't exceed 50MB for origin events and 1MB for viewer events.

### **Further Considerations**

- For even greater performance gains, consider using [AWS CloudFront Functions](https://aws.amazon.com/blogs/aws/introducing-cloudfront-functions-run-your-code-at-the-edge-with-low-latency-at-any-scale/) and [AWS S3](https://aws.amazon.com/s3/) in tandem with AWS Lambda@Edge.

### **Additional Resources**

- [Lambda - Lambda@Edge Docs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html)
- [CloudFront - Lambda@Edge Docs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge.html)
- [CloudFront - Lambda@Edge Get Started](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-how-it-works.html)
- [Example Lambda Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-examples.html)
