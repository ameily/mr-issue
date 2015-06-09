///
/// @copyright 2015 Adam Meily <meily.adam@gmail.com>
///

///
/// This is the configuration file for the mr-issue instance. Update it
/// according to the current setup and copy it to app-config.js.
///

module.exports = {

  ///
  /// Redmine configuration
  ///
  redmine: {

    ///
    /// Redmine server URL
    ///
    url: "https://redmine",

    ///
    /// API key
    ///
    apiKey: "<Insert Redmine API Key Here>",

    ///
    /// Whether to impersonate the user performing the GItlab operation or not.
    ///
    impersonate: true,

    ///
    /// (optional) SSL Certificate Authority file path to use when verifying the
    /// Redmine server's identity.
    ///
    //sslCaFile: "/path/to/ssl/ca.crt"
  },

  ///
  /// Global actions that apply to all projects
  ///
  globalActions: {

    ///
    /// Merge request created
    ///
    open: {

      ///
      /// (optional) Set the status to Feedback
      ///
      status: "feedback",

      ///
      /// (optional) Post a comment under the issue.
      ///
      notes: "Merge Request submitted."
    },

    ///
    /// Merge request accepted
    ///
    merge: {

      ///
      /// Set the status to Closed
      ///
      status: "closed",

      ///
      /// (optional) Post a comment under the issue.
      ///
      notes: "Merge Request accepted."
    }
  },

  ///
  /// The list of projects.
  ///
  projects: [{
    ///
    /// The name of the project. This will match the endpoint of the webhook.
    /// For example, if the name is "my-project", the webhook will need to
    /// reference http://<mr-server>:<port>/my-project.
    ///
    name: "my-project",

    ///
    /// List of Redmine project names or IDs to filter on. When an issue is
    ///referenced in a Merge Request description, the issue is queried to
    /// determine if it is within the correct Redmine project. If the issue
    /// isn't within the corresponding Redmine project, the issue isn't
    /// modified. This is to protect issue reference typos and disable
    /// incorrect cross-project references.
    ///
    /// If not defined, all issues are considered in scope and updated
    /// accordingly.
    ///
    /// All entries in the list can either be a project name (string) or the
    /// unique project ID (number).
    ///
    redmineProjects: [
      "myproject"
    ],

    ///
    /// Merge Request actions
    actions: {
      ///
      /// Merge Request created
      ///
      open: {
        ///
        /// Assign the issue to user1
        ///
        assignedTo: "user1"
      }
    }
  }]
};
