pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/mux1.circom";

include "../node_modules/circomlib/circuits/comparators.circom";



template MerkleTreeInclusionProof(nLevels) {
    signal input leaf;
    signal input pathIndices[nLevels];
    signal input siblings[nLevels];

    signal output root;

    component poseidons[nLevels];
    component mux[nLevels];

    signal hashes[nLevels + 1];
    hashes[0] <== leaf;

    for (var i = 0; i < nLevels; i++) {
        pathIndices[i] * (1 - pathIndices[i]) === 0;

        poseidons[i] = Poseidon(2);
        mux[i] = MultiMux1(2);

        mux[i].c[0][0] <== hashes[i];
        mux[i].c[0][1] <== siblings[i];

        mux[i].c[1][0] <== siblings[i];
        mux[i].c[1][1] <== hashes[i];

        mux[i].s <== pathIndices[i];

        poseidons[i].inputs[0] <== mux[i].out[0];
        poseidons[i].inputs[1] <== mux[i].out[1];

        hashes[i + 1] <== poseidons[i].out;
    }

    root <== hashes[nLevels];
}



template CalculateIdentityCommitment() {
    signal input secret;
    
    signal output out;

    component poseidon = Poseidon(1);

    poseidon.inputs[0] <== secret;

    out <== poseidon.out;
}

// nLevels must be < 32.
template Membership(nLevels) {
    signal input secret;
    signal input today;
    signal input treePathIndices[nLevels];
    signal input treeSiblings[nLevels];

    signal output root;
    signal output validity;

    component calculateIdentityCommitment = CalculateIdentityCommitment();
    calculateIdentityCommitment.secret <== secret;
    
    component inclusionProof = MerkleTreeInclusionProof(nLevels);
    inclusionProof.leaf <== calculateIdentityCommitment.out;

    for (var i = 0; i < nLevels; i++) {
        inclusionProof.siblings[i] <== treeSiblings[i];
        inclusionProof.pathIndices[i] <== treePathIndices[i];
    }


    component comparator = LessThan(40);
    comparator.in[0] <== today;
    comparator.in[1] <== secret;

    validity <== comparator.out;

    root <== inclusionProof.root;
}

component main {public [today]}= Membership(3);

