import { Block } from "~/types/ergo";

type Miner = Block['miner'];

export type Score = {
  miner: Miner;
  numBlocks: number,
  totalFee: number
};

export function calculateScores(blocks: Block[]) {
  let map: Map<string, Score> = new Map();   
  
  for (const block of blocks) {
    let miner = block.miner;
    let id = miner.address + '/' + miner.name;
    let score = map.get(id) ?? {
      miner,
      numBlocks: 0,
      totalFee: 0,
    };

    score.numBlocks++;
    score.totalFee += block.minerReward;

    map.set(id, score);
  }

  let scores = [...map.values()];
  
  scores.sort((a, b) => b.numBlocks - a.numBlocks);
  
  return scores;
}

