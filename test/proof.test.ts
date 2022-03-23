import 'isomorphic-fetch';

import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
// import createProof from "../src/createProof"

// export const SNARK_FIELD_SIZE = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617")
// const ZqField = require("ffjavascript").ZqField
// export const Fq = new ZqField(SNARK_FIELD_SIZE)
import { genProof, verifyProof } from "../src";
import { poseidon } from "circomlibjs";
import * as fs from "fs";
import * as path from "path";

describe('Proof test', () => {
    it("Should create proof", async () => {

        var depth = 4;
        var numberOfLeaves = 16;
        var tree;
        var arity = 2;

        tree = new IncrementalMerkleTree(poseidon, depth, BigInt(0), arity);
        // Binary tree.

        for (var i = 0; i < numberOfLeaves; i += 1) {
            tree.insert(i+1);
        }

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

        console.log(tree._nodes);
        console.log('-------------------------------')

        console.log(tree.verifyProof(temp_proof, 2));
        console.log('-------------------------------')

        const wasmFilePath: string = path.join("./zkFiles", "circuit.wasm")
        const finalZkeyPath: string = path.join("./zkFiles", "circuit_final.zkey")
        const vkeyPath = path.join("./zkFiles", "verification_key.json")
        const grothInput = {
            secret,
            treePathIndices,
            treeSiblings
        };

        const fullProof = await genProof(grothInput, wasmFilePath, finalZkeyPath);
        const vKey = JSON.parse(fs.readFileSync(vkeyPath, "utf-8"))
        const res = await verifyProof(vKey, fullProof); 
        console.log(treePathIndices);
        console.log(treeSiblings);
        console.log(fullProof.publicSignals);

        // var proof = [];


        // for (var i = 0; i < arity ** depth; i += 1) {
        //     try {
        //         proof[i] = tree.createProof(i);
        //     } catch (error) {
        //         console.error("proof[" + i + "] is not valid");
        //     }
        // }

        // console.log('-------------------------------')


        // for (var i = 0; i < arity ** depth; i += 1) {
        //     try {
        //         tree.verifyProof(proof[i]);
        //         console.log(proof[i])
        //     } catch (error) {
        //         console.error("proof[" + i + "] is not valid, so it is not printed");
        //     }
        // }

        expect(res).toBe(true)
    });
});


