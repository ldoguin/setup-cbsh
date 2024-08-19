#!/usr/bin/env cbsh

# REF
#   1. https://github.com/actions/runner-images/blob/main/images/win/Windows2022-Readme.md

# Config files are needed to avoid plugin register failure.
# The following lines were used to fix "× Plugin failed to load: No such file or directory (os error 2)"

def main [
  enablePlugins: string,  # Whether to enable or disable plugins.
  version: string,        # The tag name or version of the release to use.
  --is-legacy,            # Whether to use the legacy plugin registration command for Nu 0.92.3 and below.
] {

  let useRegister = if $is_legacy { true } else { false }
  let cbshDir = (which cbsh | get 0.path | path dirname)
  print $'enablePlugins: ($enablePlugins) of Couchbase Shell version: ($version)'

  print 'Output of (which cbsh):'
  print (which cbsh)
  print 'Directory contents:'
  ls $cbshDir | print

  # print $nu
  # Create Nu config directory if it does not exist
  if not ($nu.default-config-dir | path exists) { mkdir $nu.default-config-dir }
  config env --default | save -f $nu.env-path
  config cbsh --default | save -f $nu.config-path
  # print (ls $nu.default-config-dir)

  let allPlugins = ls $cbshDir | where name =~ nu_plugin
  let filteredPlugins = if $enablePlugins == "'true'" or $enablePlugins == 'true' {
      $allPlugins
    } else {
      $allPlugins | filter {|it| $enablePlugins =~ ($it.name | path basename | split row . | first)}
    }

  print $'Filtered plugins:'
  print $filteredPlugins

  $filteredPlugins | each {|plugin|
        let p = $plugin.name | str replace -a \ /
        if $useRegister {
          echo ([('print "' + $'Registering ($p)' + '"') $'register ($p)'] | str join "\n")
        } else {
          echo ([('print "' + $'Registering ($p)' + '"') $'plugin add ($p)'] | str join "\n")
        }
      }
    | str join "\n"
    | save -rf do-register.nu
}
