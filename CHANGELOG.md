# Changelog

All notable changes to this project are documented in this file. The format
follows Keep a Changelog and the project follows Semantic Versioning.

## [Unreleased]

## [0.1.0] - 2026-10-01

### Added

- Levels `off`, `lite`, `full`, `ultra` switched with `/crewcut <level>`.
- Compact ruleset injected at session start and on every level switch.
- `/crewcut-review`: read-only review that names the ladder rung to stop at.
- Evals measuring the token delta with and without the plugin.
- Always-loaded context: about 245 tokens of skill and agent descriptions, plus a ruleset under 450 tokens injected at session start.
- Quality guard in the ruleset, the skill and the reviewer: short never means wrong.
