# merkle_circom

# Overview

Demo example for ZK Membership Proofs with circom 2.0.0 inspired by https://github.com/akinovak/circom2-example

- The `./scripts` directory includes a build script for the `./circuits/circuit.circom` circuit.
- The `./src/index.ts` file contains all the helper functions needed for generating and verifying proofs.
- The `./bundle-test.js` and the `./test/proof.test.ts` files contain a minimal example on how to generate and verify proofs

# Startup instructions

1. `npm install`
2.  `./scripts/build-circuits.sh`
3. `npm test` or `npm run test:js-bundle`
