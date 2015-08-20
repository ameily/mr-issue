# mr-issue

> What's all this churning and bubbling? You call this is a radar screen?
>
> No sir, we call it "Mr. Issue".


Redmine issues and version tracking are far superior to Gitlab; however, Gitlab
git integration and Merge Requests for code reviews are far superior to Redmine.
But, keeping issues and Merge Requests in sync is a nightmare. Until now...

Introducing mr-issue, a Gitlab webhook listener that is able to find issues
referenced in the body of Merge Requests and then update the issue in Redmine.
mr-issue can update the corresponding Redmine issue's attributes.

## Tutorial

 * **Configure mr-issue**
   * mr-issue has a single configuration file that is straightforward. There is
     an example config at `conf/app-config.exmple.js`.
 * **Install dependencies**
   * You'll need NodeJS. I've only tested on Node 0.10, but other versions
     should work. If you're new to NodeJS or using Ubuntu, I've found
     [nvm](https://github.com/creationix/nvm) invaluable.
```
nvm install 0.10
nvm use 0.10
npm install
```
 * **Launch mr-issue**
   * `node app.js`
 * **Reference issue in Merge Requests body.**
  * If a Merge Request will close an issue, simply write `closes #<issue num>`.
    Closing issues #666? Write `closes #666` somewhere in the Merge Request
    body. Yes, it's that easy.
  * Multiple issues can be referenced in a MR: `closes #123 closes #124 closes #456`
 * ????
 * Profit!

## Available Actions

 * **Assigned To**: assign the issue to a user by either specifying a user ID
   or a user login name.
 * **Status**: set the issue status to either a status ID or a status name.
 * **Merge Request Field**: it's helpful to bind an issue to the Merge
   Request link. So, add a new issue custom field named "Merge Request" and
   mr-issue will automatically update the issue field to the URL of the Merge
   Request.
 * **Comment**: post a comment to the issue.

## Merge Request Events

mr-issue can update the issue differently depending on the Merge Request
webhook that is fired, whether the MR was just opened or merged. Typical issue
workflow is:

 * MR Opened: assign the issue to the quality assurance or testing lead, post a
   comment ("Merge Request submitted") and change the issue status _Feedback_.
 * MR Merged: post a comment ("Merge Request accepted") and set the issue
   status to _Closed_.

## Configuration

The `conf/app-config.js` file is used to configure mr-issue. The example
configuration file `conf/app-config.example.js` has several examples. The
highlights are:

 * Per-project configuration for both Redmine and Gitlab.
 * Global configuration for all projects.
 * Impersonate the issue update as the user who created and/or merged the Merge
   Request.

## License

mr-issue is licensed under the BSD ISC license. Do just about anything, but
please submit bug reports and/or pull requests on Github.
