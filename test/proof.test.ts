import 'isomorphic-fetch';

import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import { generateMerkleProof } from "@zk-kit/protocols";
import { genProof, verifyProof } from "../src";
import { poseidon } from "circomlibjs";
import * as fs from "fs";
import * as path from "path";

describe('Proof test', () => {
    it("Should create proof", async () => {

        const depth = 4;
        const numberOfLeaves = 16;
        const zeroValue = BigInt(0);
        let tree;
        const arity = 2;

        tree = new IncrementalMerkleTree(poseidon, depth, zeroValue, arity);

        for (let i = 0; i < numberOfLeaves; i += 1) {
            tree.insert(poseidon([i+1]));
        }

        console.log(tree._nodes);
        console.log('-------------------------------')

        var secret = 2;

        var hash = poseidon([secret]);
        console.log(hash);
        console.log('**********');

        var treePathIndices = new Array<number>(depth);
        var treeSiblings = new Array<BigInt>(depth);

        var temp_proof = tree.createProof(1);

        treePathIndices = temp_proof.pathIndices;
        treeSiblings = temp_proof.siblings;

        console.log(treePathIndices);
        console.log('-------------------------------')
        console.log(treeSiblings);
        console.log('-------------------------------')

        console.log(tree.verifyProof(temp_proof, hash));
        console.log('-------------------------------')

        const merkleProof = generateMerkleProof(depth, zeroValue, tree._nodes[0], hash);
        console.log(merkleProof.pathIndices);
        console.log('-------------------------------')

        const witness = {
            secret,
            treePathIndices: merkleProof.pathIndices,
            treeSiblings: merkleProof.siblings
          }

        const wasmFilePath: string = path.join("./zkFiles", "circuit.wasm")
        const finalZkeyPath: string = path.join("./zkFiles", "circuit_final.zkey")
        const vkeyPath = path.join("./zkFiles", "verification_key.json")


        const fullProof = await genProof(witness, wasmFilePath, finalZkeyPath);
        console.log(fullProof);
        const vKey = JSON.parse(fs.readFileSync(vkeyPath, "utf-8"))
        const res = await verifyProof(vKey, fullProof); 


        expect(res).toBe(true)
    });
});


