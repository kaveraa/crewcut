# Changelog

All notable changes to this project are documented in this file. The format
follows Keep a Changelog and the project follows Semantic Versioning.

## [Unreleased]

### Added

- Levels `off`, `lite`, `full`, `ultra` switched with `/crewcut <level>`.
- Compact ruleset injected at session start and on every level switch.
- `/crewcut-review`: read-only review that names the ladder rung to stop at.
- Evals measuring the token delta with and without the plugin.
- Always-loaded context: about 245 tokens of skill and agent descriptions, plus a ruleset under 400 tokens injected at session start.
