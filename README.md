# setup-cbsh

Originally forked from https://github.com/hustcer/setup-nu/, many thanks to [hustcer](https://github.com/hustcer

[![Latest Main Check](https://github.com/ldoguin/setup-cbsh/actions/workflows/latest-matrix.yaml/badge.svg)](https://github.com/ldoguin/setup-cbsh/actions/workflows/latest-matrix.yaml)

This GitHub Action will setup a [Couchbase Shell](https://github.com/couchbaselabs/couchbase-shell) environment for you.

## Usage

### Examples

#### Basic

In most cases you just need to specify the `version` of Nushell to be used in your workflow.
For example the following installs the `v0.80` version of [Nushell](https://github.com/nushell/nushell).
Then you can set the command you want to run in the following steps, and don't forget to set `shell: nu {0}`
to make the commands be executed by `nu`:

```yaml
- uses: ldoguin/setup-cbsh@v1
  with:
    version: "v0.75.2" # Don't use 0.90 here, as it was a float number and will be convert to 0.9, you can use v0.90/0.90.0 or '0.90'
- run: print $'Nu version info:(char nl)'; version
  shell: cbsh {0}
- name: Default shell will be `nu`
  shell: cbsh {0}
  run: |
    print $'Nu path:(which cbsh)(char nl)'
    def greeting [name: string] {
        print $'Hello ($name)'
    }
    greeting hustcer
```

#### Used as Default Shell

Of cause, You can also set the default shell to `cbsh` by setting the `defaults.run.shell` config:

```yaml
name: basic

on: push
defaults:
  run:
    shell: cbsh {0}

jobs:
  basic-usage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4.1.7
      - uses: ldoguin/setup-cbsh@main
        with:
          version: "*"
      - run: version; print $"(char nl)Dir contents:(char nl)"; ls ((which cbsh).path.0 | path dirname)
      - run: |
          print $'Current env:(char nl)'
          print $env
      - name: You can run bash commands, too
        run: pwd && ls -la
        shell: bash
```
<!-- 
#### Use Nu Modules

To use modules in `Nu`, please refer to the following examples:

1. Use Nu modules in `nu -c`

```yaml
- name: Setup cbsh
  uses: ldoguin/setup-cbsh@v3
  with:
    version: 0.95.0
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
- name: Use Your Couchbase Shell Modules
  shell: cbsh {0}
  run: |
    cbsh -c "use nu/module.nu *; print (get-env 'ABC-XYZ' 'DEFAULT-ABC-XYZ')"
```

You have to wrap the `cbsh` code in `cbsh -c ""`, and the cbsh version should be equal to or above `0.69`.

2. Use modules from absolute path

```yaml
- name: Setup nu
  uses: ldoguin/setup-cbsh@v3
  with:
    version: 0.95.0
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
- name: Use Your Nu Modules by Absolute Path
  shell: nu {0}
  run: |
    use ${{ github.workspace }}/nu/module.nu *
    print 'Use module from: ${{ github.workspace }}/nu/module.nu'
    print (get-env 'ABC-XYZ' 'DEFAULT-ABC-XYZ-ABSOLUTE-PATH')
```

Again, the nu version should be equal to or above `0.69`.

3. Copy your modules to one of the default `$env.NU_LIB_DIRS`

```yaml
- name: Setup cbsh@latest
  uses: ldoguin/setup-cbsh@v3
  with:
    version: 0.95.0
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
- name: Prepare Nu Modules
  shell: nu {0}
  run: |
    let LIB_DIR = [$nu.default-config-dir 'scripts'] | path join
    if not ($LIB_DIR | path exists) { mkdir $LIB_DIR }
    cp -r nu/* $LIB_DIR
- name: Use Your Nu Modules
  shell: nu {0}
  run: |
    use module.nu *
    print (get-env 'ABC-XYZ' 'DEFAULT-ABC-XYZ')
```

To make it work please make sure that the nu version should be equal to or above `0.85`.

They are not perfect yet, but they do work. BTW: Please tell me if you found a better way and PRs are always welcomed. 

#### Use Couchbase Shell Nightly Version

`Couchbase Shell` is currently in active development, if you want to use the latest features it's also available by set the version to `nightly`, just as below:

```yaml
- uses: hustcer/setup-nu@v3
  with:
    version: nightly # Will download and setup the latest nightly version of Nushell
- run: print $'Nu version info:(char nl)'; version
  shell: nu {0}
- name: Default shell will be `nu`
  shell: nu {0}
  run: |
    print $'Nu path:(which nu)(char nl)'
    def greeting [name: string] {
        print $'Hello ($name)'
    }
    greeting hustcer
```

> **Warning**
> Use `Nushell` nightly version with caution: The nu binary may change every other day and this may break your workflow.
> Only the latest nightly version will be downloaded and setup, and the version must be `nightly`.

#### Others

Or, check the following examples:

1. [run-test.yaml](https://github.com/hustcer/setup-nu/blob/main/.github/workflows/run-test.yaml)
2. [run-matrix.yaml](https://github.com/hustcer/setup-nu/blob/main/.github/workflows/latest-matrix.yaml)
3. Advanced example: How Nushell Make a Release? [Workflow](https://github.com/nushell/nushell/blob/main/.github/workflows/release.yml), [Script](https://github.com/nushell/nushell/blob/main/.github/workflows/release-pkg.nu)

If you want to use the latest version of nushell you can specify this by set `check-latest` to
`true`(it's the same as `version: '*'`, but more readable). For example the following installs
the latest version:

```yaml
- uses: hustcer/setup-nu@v3
  with:
    check-latest: true
- run: print $'Nu version info:(char nl)'; version
```

**Note**: **Before Nushell reaches 1.0, each version may change a lot, it is recommend that you use a specified version instead**.

### Inputs

| Name             | Required | Description                                                                                                                                                   | Type   | Default   |
| ---------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- |
| `version`        | no       | A valid NPM-style semver specification, such as `0.86.0`, etc. and `nightly`.                                                                                 | string | \*        |
| `check-latest`   | no       | Set to `true` if you want to use the latest version                                                                                                           | bool   | false     |
| `enable-plugins` | no       | Set to `true` if you want to register the bundled plugins or a comma-separated string of plugin names like `nu_plugin_polars,nu_plugin_query`, Nu v0.86 and above is required                                                                     | bool\|string   | false     |
| `features`       | no       | Available choice: `default` or `full`, and the `full` features will include the commands from `extra` and `dataframe`. `full` can be used for `Nu` from `v0.86` to `v0.93` and was removed after `v0.93.1` | string | `default` |
| `github-token`   | no       | Your GitHub token or PAT token | string | `${{ github.token }}` |

The semver specification is passed directly to NPM's [semver package](https://www.npmjs.com/package/semver).
This GitHub Action will install the latest matching release.
-->
## License

Licensed under:

- MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)
