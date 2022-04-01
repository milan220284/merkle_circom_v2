import 'isomorphic-fetch';

import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import { generateMerkleProof } from "@zk-kit/protocols";
import { genProof, verifyProof } from "../src";
import { poseidon } from "circomlibjs";
import * as fs from "fs";
import * as path from "path";

describe('Proof test', () => {
    it("Should create proof", async () => {

        const depth = 3;
        // const numberOfLeaves = 8;
        // const zeroValue = BigInt(0);
        const zeroValue = poseidon([BigInt('0x' + Buffer.from('X', 'utf-8').toString('hex'))]);
        let tree;
        const arity = 2;

        const data = {
            id: "CERT-17BB9",
            dateOfIssuing: 1648806090,
            dateOfExp: 1648809690,
            firstName: "Petar",
            lastName: "Petrović",
            dateOfBirth: 922808634,
            placeOfBirth: "Beograd"
          }

// client tree
        tree = new IncrementalMerkleTree(poseidon, depth, zeroValue, arity);

        tree.insert(poseidon([BigInt('0x' + Buffer.from(data.id, 'utf-8').toString('hex'))]));
        tree.insert(poseidon([BigInt(data.dateOfIssuing)]));
        tree.insert(poseidon([data.dateOfExp]));
        tree.insert(poseidon([BigInt('0x' + Buffer.from(data.firstName,'utf-8').toString('hex'))]));
        tree.insert(poseidon([BigInt('0x' + Buffer.from(data.lastName, 'utf-8').toString('hex'))]));
        tree.insert(poseidon([BigInt(data.dateOfBirth)]));
        tree.insert(poseidon([BigInt('0x' + Buffer.from(data.placeOfBirth, 'utf-8').toString('hex'))]));

        // console.log(tree._nodes);
        // console.log('-------------------------------');

        // var treePathIndices = new Array<number>(depth);
        // var treeSiblings = new Array<BigInt>(depth);

        // var temp_proof = tree.createProof(2);

        // treePathIndices = temp_proof.pathIndices;
        // treeSiblings = temp_proof.siblings;

        // console.log(treePathIndices);
        // console.log('-------------------------------')
        // console.log(treeSiblings);
        // console.log('-------------------------------')

        // console.log(tree.verifyProof(temp_proof, poseidon([data.dateOfExp])));
        // console.log('-------------------------------')

        const merkleProof = generateMerkleProof(depth, zeroValue, tree._nodes[0], poseidon([data.dateOfExp]));
        // console.log(merkleProof.pathIndices);
        // console.log('-------------------------------')

        const witness = {
            secret: data.dateOfExp,
            today: 164880980000,
            treePathIndices: merkleProof.pathIndices,
            treeSiblings: merkleProof.siblings
          }

        const wasmFilePath: string = path.join("./zkFiles", "circuit.wasm")
        const finalZkeyPath: string = path.join("./zkFiles", "circuit_final.zkey")
        const vkeyPath = path.join("./zkFiles", "verification_key.json")


        const fullProof = await genProof(witness, wasmFilePath, finalZkeyPath);
        // today is public
        console.log(fullProof.publicSignals);
        const vKey = JSON.parse(fs.readFileSync(vkeyPath, "utf-8"))
        const res = await verifyProof(vKey, fullProof); 


        expect(res).toBe(true)
    });
});


