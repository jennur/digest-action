const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const repo_token = core.getInput('repo-token');
    const context = github.context;
    const octokit = github.getOctokit(repo_token);

    const iterator = octokit.paginate.iterator(octokit.rest.issues.listForRepo, {
      ...context.repo,
      state: 'open',
      sort: 'created',
      direction: 'asc',
      per_page: 100,
    });
    
    // iterate through each response
    for await (const { data: issues } of iterator) {
      for (const issue of issues) {
        console.log("Issue #%d: %s", issue.number, issue.title);
      }
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
