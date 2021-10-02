# github-tokens

Generate GitHub access tokens for your repositories using a GitHub App so you don't have to use a personal access token.
Uses [`Create an installation access token for an app` API](https://docs.github.com/en/rest/reference/apps#create-an-installation-access-token-for-an-app)
to generate these tokens.

The [`Generate Tokens`](./.github/workflows/generate-tokens.yml) workflow runs every 30 minutes,
as tokens expire within an hour.

## Usage

There are two steps to setting this up for yourself:

* Create and install your GitHub App
* Clone and configure this repository into your organization

After completing these steps,
the access token is available to you as the `REPO_GITHUB_TOKEN` secret in the configured repositories.

### Create and Install Your GitHub App

* Under https://github.com/settings/apps, click `New GitHub App`
  * Give your app a name (e.g. ` Access Token Generator`)
  * `WebHook` => `Active` can be disabled
  * `Permissions` must be a superset of all permissions you wish to give to your repositories
* Note `App ID` for `GH_APP_ID` below
* Generate a private key, and note it for `GH_PRIVATE_KEY` below
  * Copy the value in full, including the new line characters
* Generate a client secret, and note it for `GH_CLIENT_SECRET` below
* Install the app into the organization of your choice
  * Note the Installation ID in the URL after installation (e.g. `https://github.com/settings/installations/<AppId>`)
    for `GH_INSTALLATION_ID` below

### Clone and Configuration of This Repository

Create a copy of this repository in your personal space or organization by:

* Clicking the `Use this template` at the main page of this repository OR
* Forking this repository OR
* Creating a new repository and using Git commands to populate it

Set the following secrets based on the values noted above:

* `GH_APP_ID`
* `GH_CLIENT_SECRET`
* `GH_INSTALLATION_ID`
* `GH_PRIVATE_KEY`

Update [config.yml](./config.yml) appropriately for your repositories.

## Config

* `org`: the name of your org
* `tokens`: an array of repositories to configure
  * `name`: name of the secret to use (default: `REPO_GITHUB_TOKEN`)
  * `repository`: name of repository to create the token in
  * `permissions`: permissions to set for that token ([full list](https://docs.github.com/en/rest/reference/apps#create-an-installation-access-token-for-an-app))
  * `targets`: repositories that token has access to (default: `[<repository>]`, i.e. itself only)
