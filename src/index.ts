/**
 * Author: hustcer, ldoguin
 * Created: 2022/04/28 18:50:20
 */

import shell from 'shelljs';
import semver from 'semver';
import * as core from '@actions/core';

import * as setup from './setup';
import { registerPlugins } from './plugins';

async function main() {
  try {
    const versionSpec = core.getInput('version');
    console.log(`versionSpec: ${versionSpec}`);
    const checkLatest = (core.getInput('check-latest') || 'false').toUpperCase() === 'TRUE';
    const enablePlugins = (core.getInput('enable-plugins') || 'false').toLowerCase();
    const config = core.getMultilineInput('config');
    const githubToken = core.getInput('github-token');
    const version = ['*', 'nightly', 'source'].includes(versionSpec)
      ? versionSpec
      : semver.valid(semver.coerce(versionSpec));
    console.log(`coerce version: ${version}`);
    const ver = version === null ? undefined : version;
    if (!ver) {
      core.setFailed(`Invalid version: ${versionSpec}`);
    }
    let installedVersion = '';
    if (ver === 'source') {
      // build latest
      shell.exec(`cargo install --git https://github.com/couchbaselabs/couchbase-shell`);
      const { stdout } = shell.exec(`cbsh --version`);
      installedVersion = stdout;
      core.info(`Successfully installed Couchbase Shell ${installedVersion} from source.`);
    } else {
      const tool = await setup.checkOrInstallTool({
        checkLatest,
        githubToken,
        enablePlugins,
        bin: 'cbsh',
        owner: 'couchbaselabs',
        versionSpec: ver,
        name: version === 'nightly' ? 'nightly' : 'couchbase-shell',
      });
      core.addPath(tool.dir);
      // version: * --> 0.95.0; nightly --> nightly-56ed69a; 0.95 --> 0.95.0
      core.info(`Successfully setup Couchbase Shell ${tool.version}.`);
      installedVersion = tool.version;
    }
    // Change to workspace directory so that the register-plugins.nu script can be found.
    shell.cd(process.env.GITHUB_WORKSPACE);
    console.log(`Current directory: ${process.cwd()}`);
    await registerPlugins(enablePlugins, installedVersion);
    if (config.length > 0) {
      await setup.registerConfiguration(config);
    }
  } catch (err) {
    core.setFailed(err.message);
  }
}

main();
