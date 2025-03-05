## [1.2.14](https://github.com/524H0003/Project_W/compare/v1.2.13...v1.2.14) (2025-03-05)


### Bug Fixes

* **event:** add query all events ([#150](https://github.com/524H0003/Project_W/issues/150)) ([d9c0531](https://github.com/524H0003/Project_W/commit/d9c05319c7d72973a4e72146d0f77c5f1751694d))

## [1.2.13](https://github.com/524H0003/Project_W/compare/v1.2.12...v1.2.13) (2025-03-04)


### Bug Fixes

* **response:** better server response ([#148](https://github.com/524H0003/Project_W/issues/148)) ([6d4ce02](https://github.com/524H0003/Project_W/commit/6d4ce023191fd7accf97fb934bb9271abe3dee0c))

## [1.2.12](https://github.com/524H0003/Project_W/compare/v1.2.11...v1.2.12) (2025-02-19)


### Bug Fixes

* update app.controller.ts and sql.module.ts ([#146](https://github.com/524H0003/Project_W/issues/146)) ([926ae00](https://github.com/524H0003/Project_W/commit/926ae00b167d8e30c98c39ec6305010c14fb027c))

## [1.2.11](https://github.com/524H0003/Project_W/compare/v1.2.10...v1.2.11) (2025-02-19)


### Bug Fixes

* **auth-bloc:** reduce amount of bloc if bloc out of usage time or lost root ([#143](https://github.com/524H0003/Project_W/issues/143)) ([f1c9948](https://github.com/524H0003/Project_W/commit/f1c99488301c2baa009cdbf8792e1e99633db725))

## [1.2.10](https://github.com/524H0003/Project_W/compare/v1.2.9...v1.2.10) (2025-02-18)


### Bug Fixes

* **auth-bloc:** fix logout ([#141](https://github.com/524H0003/Project_W/issues/141)) ([040f0a0](https://github.com/524H0003/Project_W/commit/040f0a0008ac9634e86f176d9433328fc1db164c))

## [1.2.9](https://github.com/524H0003/Project_W/compare/v1.2.8...v1.2.9) (2025-02-18)


### Performance Improvements

* **typeorm:** better blockchain save ([#140](https://github.com/524H0003/Project_W/issues/140)) ([f3f9111](https://github.com/524H0003/Project_W/commit/f3f911138090f6336016706b9c8b8f8b6e2d4a55))

## [1.2.8](https://github.com/524H0003/Project_W/compare/v1.2.7...v1.2.8) (2025-02-17)


### Bug Fixes

* **hash:** change from argon2 to xxhash for data hashing ([#139](https://github.com/524H0003/Project_W/issues/139)) ([5c9e60c](https://github.com/524H0003/Project_W/commit/5c9e60cde87036c9054d951c36e8db2b52813e79))

## [1.2.7](https://github.com/524H0003/Project_W/compare/v1.2.6...v1.2.7) (2025-02-17)


### Bug Fixes

* **ssl:** allow rejectUnauthorized ([#138](https://github.com/524H0003/Project_W/issues/138)) ([91594a0](https://github.com/524H0003/Project_W/commit/91594a02fc7a7c1ab4da63186df912a4c1c475f4))

## [1.2.6](https://github.com/524H0003/Project_W/compare/v1.2.5...v1.2.6) (2025-02-17)


### Bug Fixes

* **front-end:** add csrf request to all request ([#137](https://github.com/524H0003/Project_W/issues/137)) ([e1c9def](https://github.com/524H0003/Project_W/commit/e1c9def6772544c35f6224d3d76da63c46da03c9)), closes [#134](https://github.com/524H0003/Project_W/issues/134)

## [1.2.5](https://github.com/524H0003/Project_W/compare/v1.2.4...v1.2.5) (2025-02-17)


### Bug Fixes

* **response:** fix request timeout ([#136](https://github.com/524H0003/Project_W/issues/136)) ([08e35e3](https://github.com/524H0003/Project_W/commit/08e35e35d730b4e119e8180c3d75600ff7a9203a))


### Reverts

* **cookie-name:** remove hashing and random cookie key ([#135](https://github.com/524H0003/Project_W/issues/135)) ([392cefe](https://github.com/524H0003/Project_W/commit/392cefe552e80a6ebc6b6a62cec7806da6fbf60d))

## [1.2.4](https://github.com/524H0003/Project_W/compare/v1.2.3...v1.2.4) (2025-02-17)


### Bug Fixes

* **cookie:** change cookie name from numeric to alpha ([b0ed8ad](https://github.com/524H0003/Project_W/commit/b0ed8ad7f55be1b5e9534546b97c9fb0fe321818))
* **cookie:** change cookie name from numeric to alpha ([#133](https://github.com/524H0003/Project_W/issues/133)) ([93ddda0](https://github.com/524H0003/Project_W/commit/93ddda00a3f78784711ce61abcb9aba2d89fb75b))

## [1.2.3](https://github.com/524H0003/Project_W/compare/v1.2.2...v1.2.3) (2025-02-17)


### Bug Fixes

* **aws-s3:** fix unusual file name upload ([ddf8e86](https://github.com/524H0003/Project_W/commit/ddf8e86ba5e4a6a33750ccf8e1f5309eb8bba09b))
* **aws-s3:** fix unusual file name upload ([#132](https://github.com/524H0003/Project_W/issues/132)) ([13b943a](https://github.com/524H0003/Project_W/commit/13b943a3d2eda379b1dfe8575d42871e812d7cca))
* **regular-express:** fix server file regular express ([0587854](https://github.com/524H0003/Project_W/commit/0587854d5b864fc734013f5ee177f8a808a3c22a))
* **typescript:** stricter boolean expression ([3d5c102](https://github.com/524H0003/Project_W/commit/3d5c102109468654136ce148cfcb1209157b6e43))

## [1.2.2](https://github.com/524H0003/Project_W/compare/v1.2.1...v1.2.2) (2025-02-17)


### Bug Fixes

* **encryption:** fix encrypt and decrypt functions ([8d04df5](https://github.com/524H0003/Project_W/commit/8d04df520342dafcf98f4bb308038a3f60731376))
* **encryption:** fix encrypt and decrypt functions ([#131](https://github.com/524H0003/Project_W/issues/131)) ([b0f026b](https://github.com/524H0003/Project_W/commit/b0f026be606f6d36b740715af21a3d3826862852))


### Reverts

* **cookie:** remove signed cookie feature ([#130](https://github.com/524H0003/Project_W/issues/130)) ([324a63b](https://github.com/524H0003/Project_W/commit/324a63b622ca2d32f53fd25a74c3adf0815a3c2a))

## [1.2.1](https://github.com/524H0003/Project_W/compare/v1.2.0...v1.2.1) (2025-02-16)


### Bug Fixes

* **server-response:** a quick update of server response and fix adminjs problems ([#129](https://github.com/524H0003/Project_W/issues/129)) ([edbbcb7](https://github.com/524H0003/Project_W/commit/edbbcb77ebc876adc57169357204ac48a56b9540))

# [1.2.0](https://github.com/524H0003/Project_W/compare/v1.1.0...v1.2.0) (2025-02-16)


### Features

* **optimize:** better server controller endpoint ([#128](https://github.com/524H0003/Project_W/issues/128)) ([704f4d0](https://github.com/524H0003/Project_W/commit/704f4d0f5731da4c4137cb2f29c8d5694c6bc2bb))

# [1.1.0](https://github.com/524H0003/Project_W/compare/v1.0.1...v1.1.0) (2025-02-13)


### Features

* **server:** add compression for server performance ([#125](https://github.com/524H0003/Project_W/issues/125)) ([ef11e50](https://github.com/524H0003/Project_W/commit/ef11e502ba9ca5cfa2f1c1be91e0a963f8bc55b7))

## [1.0.1](https://github.com/524H0003/Project_W/compare/v1.0.0...v1.0.1) (2025-02-11)


### Bug Fixes

* Auto generate changelog and version ([fd6a9dc](https://github.com/524H0003/Project_W/commit/fd6a9dc5c7f0d564ff7018df4db6840c1017fc28))
* Auto generate release ([5a52aa1](https://github.com/524H0003/Project_W/commit/5a52aa19b612f6fd49888bf8b5ecb54af7f379e5))
* Auto release ([d759630](https://github.com/524H0003/Project_W/commit/d759630937bfc970315eba40cffcd03bc867fe53))
