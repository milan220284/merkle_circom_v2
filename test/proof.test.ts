import 'isomorphic-fetch';

import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import { generateMerkleProof, Semaphore } from "@zk-kit/protocols";
const { groth16 } = require("snarkjs");
// import createProof from "../src/createProof"

// export const SNARK_FIELD_SIZE = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617")
// const ZqField = require("ffjavascript").ZqField
// export const Fq = new ZqField(SNARK_FIELD_SIZE)
import { genProof, verifyProof} from "../src";
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
        // Binary tree.

        for (let i = 0; i < numberOfLeaves; i += 1) {
            tree.insert(poseidon([i+1]));
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

        console.log(tree.verifyProof(temp_proof, hash));
        console.log('-------------------------------')

        const merkleProof = generateMerkleProof(depth, zeroValue, tree._nodes[0], hash);
        console.log(merkleProof.pathIndices);
        console.log('-------------------------------')

        const wasmFilePath: string = path.join("./zkFiles", "circuit.wasm")
        const finalZkeyPath: string = path.join("./zkFiles", "circuit_final.zkey")
        const vkeyPath = path.join("./zkFiles", "verification_key.json")
        // const grothInput = {
        //     secret,
        //     treePathIndices,
        //     treeSiblings
        // };

        // const witness = Semaphore.genWitness(identity, merkleProof, externalNullifier, secret);

        const witness = {
            secret,
            treePathIndices: merkleProof.pathIndices,
            treeSiblings: merkleProof.siblings
          }


        // const fullProof = await Semaphore.genProof(witness, wasmFilePath, finalZkeyPath);

        // const { proof, publicSignals } = await groth16.prove(witness, wasmFilePath, finalZkeyPath, null)
        // const fullProof = {
        //           proof,
        //           publicSignals: {
        //             merkleRoot: publicSignals[0]
        //           }
        //         }

        const fullProof = await genProof(witness, wasmFilePath, finalZkeyPath);
        console.log(fullProof);
        const vKey = JSON.parse(fs.readFileSync(vkeyPath, "utf-8"))
        const res = await verifyProof(vKey, fullProof); 



        // const fullProof = await genProof(grothInput, wasmFilePath, finalZkeyPath);
        // const vKey = JSON.parse(fs.readFileSync(vkeyPath, "utf-8"))
        // const res = await verifyProof(vKey, fullProof); 

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


