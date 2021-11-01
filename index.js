const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

async function run() {
  try {
    const repo_token = core.getInput('repo-token');
    const context = github.context;
    const octokit = github.getOctokit(repo_token);
    const WEBHOOK_ID = core.getInput('webhook-id') || '';
    const WEBHOOK_TOKEN = core.getInput('webhook-token') || '';

    if(WEBHOOK_ID === '' || WEBHOOK_TOKEN === '') {
      console.log("Cannot find webhook values");
    }
    else {
      const iterator = octokit.paginate.iterator(octokit.rest.issues.listForRepo, {
        ...context.repo,
        state: 'open',
        sort: 'created',
        direction: 'asc',
        per_page: 100,
      });
      
      let content = '';
      // iterate through each response
      for await (const { data: issues } of iterator) {
        for (const issue of issues) {
          let issueMsg = `**${issue.title}**\nby ${issue.user.login} - <${issue.html_url}>\n\n`;
          console.log(issueMsg);
          content += issueMsg;
        }
      }

      axios.post(`https://discord.com/api/webhooks/${WEBHOOK_ID}/${WEBHOOK_TOKEN}`, { content })
      .then(() => console.log("Message sent to Discord"))
      .catch(error => console.log("Error sending message to Discord:", error.message))

    }
    // const ms = core.getInput('milliseconds');

    // core.debug((new Date()).toTimeString()); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    // await wait(parseInt(ms));
    // core.info((new Date()).toTimeString());

    // core.setOutput('time', new Date().toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
