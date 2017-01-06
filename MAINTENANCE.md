# Restangular maintenance policy

Restangular follows the [Semantic Versioning](http://semver.org/) for its releases:
`(Major).(Minor).(Patch)`.

- **Patch number**: When backwards compatible bug fixes are introduced that fix
  incorrect behavior.
- **Minor version**: When new, backwards compatible functionality is introduced
  to the public API or a minor feature is introduced, or when a set of smaller
  features is rolled out.
- **Major version**: Whenever there is something significant or any backwards
  incompatible changes are introduced to the public API.

The current stable release will receive security patches and bug fixes
(eg. `1.6.0` -> `1.6.1`). Feature releases will mark the next supported stable
release where the minor version is increased numerically by increments of one
(eg. `1.6.3 -> 1.7.0`).

We encourage everyone to run the latest stable release.

# Notes for maintainers

Following are a set of guidelines and checklists for maintaining the
[main repository](https://github.com/mgonto/restangular).

## Keeping master usable

In order for developers to use the bleeding edge master version in their projects,
we'll need to keep the dist files up to date. After merging PRs that include mentionable
changes, please update the dist files `grunt build` and the CHANGELOG `grunt changelog`.
The CHANGELOG will have a section called `Unreleased` for changes not yet included in
any release. This is the place for

## Releasing

Follow this checklist for publishing a new release.

- [ ] Bump version `grunt bump --type=patch/minor/major`
- [ ] Create changelog `grunt changelog` (open it in editor and make sure its sensible)
- [ ] Make dist files `grunt build`
- [ ] Commit changes `git add dist package.json CHANGELOG.md` and `git commit -m "chore(release): release 1.6.1"`
- [ ] Tag release `git tag -a -m "Version 1.6.1" 1.6.1`
- [ ] Push everything `git push` and `git push --tags`
- [ ] Publish to NPM `npm publish`
- [ ] Create a [new release](https://github.com/mgonto/restangular/releases) on GitHub, entering the version changelog as body
