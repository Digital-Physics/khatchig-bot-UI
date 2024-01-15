class ParticleGridRoom {
    constructor(kwargs) {
        for (const [key, value] of Object.entries(kwargs)) {
            this[key] = value;
        }
    }

    tryReplaceParticle() {
        const [x, y] = this.pos;
        const pType = this.typeGrid[x][y];

        for (const row of Array.from({ length: 3 }, (_, j) =>
            Array.from({ length: 3 }, (_, i) => [i + x - 1, j + y - 1, this.typeGrid[i + x - 1][j + y - 1]])
        )) {
            for (const [i, j, cellType] of row) {
                if (cellType === this.copyType[pType]) {
                    for (const row2 of Array.from({ length: 3 }, (_, l) =>
                        Array.from({ length: 3 }, (_, k) => [k + i - 1, l + j - 1, this.typeGrid[k + i - 1][l + j - 1]])
                    )) {
                        for (const [k, l, cellType2] of row2) {
                            if (cellType2 === this.replaceType[pType]) {
                                this.typeGrid[k][l] = this.copyType[pType];
                            }
                        }
                    }
                }
            }
        }
    }

    scoreWithinRadius(backFlag = null) {
        const [x, y] = this.pos;
        const pType = this.typeGrid[x][y];
        this.bestIdx = this.pos;
        let best = -Infinity;
        let tiebreakSet = [[x, y]];

        if (backFlag) {
            let score = null;

            for (const pos of Array.from({ length: 3 }, (_, j) =>
                Array.from({ length: 3 }, (_, i) => [i + x - 1, j + y - 1])
                    .filter(([i, j]) => this.typeGrid[i][j] === 0)
            ).flat()) {
                const [i, j] = pos;
                score = this.distance[i][j];

                if (score > best) {
                    best = score;
                    tiebreakSet = [[i, j]];
                } else if (score === best) {
                    tiebreakSet.push([i, j]);
                }
            }

            if (score !== null && score === 0) {
                if (x > 16) {
                    tiebreakSet = [[x - 1, y - 1], [x, y - 1]];
                } else {
                    tiebreakSet = [[x + 1, y - 1], [x, y - 1]];
                }

                if (this.typeGrid[tiebreakSet[0][0]][tiebreakSet[0][1]] !== 0) {
                    if (this.typeGrid[tiebreakSet[1][0]][tiebreakSet[1][1]] !== 0) {
                        tiebreakSet = [[x, y]];
                    } else {
                        tiebreakSet = [tiebreakSet[1]];
                    }
                }
            }
        } else {
            for (const row of Array.from({ length: 3 }, (_, j) =>
                Array.from({ length: 3 }, (_, i) => [i + x - 1, j + y - 1])
                    .filter(([i, j]) => this.typeGrid[i][j] === 0)
            ).flat()) {
                const [i, j] = row;
                let score = 0;
                let cellCount = 0;

                for (const row2 of Array.from({ length: 2 * this.radius + 1 }, (_, l) =>
                    Array.from({ length: 2 * this.radius + 1 }, (_, k) => [k + i - this.radius, l + j - this.radius, this.typeGrid[k + i - this.radius][l + j - this.radius]])
                ).flat()) {
                    for (const [k, l, cellType] of row2) {
                        cellCount += 1;

                        if (cellType !== 0) {
                            if (this.affinity[pType][cellType] === 1) {
                                score += 1;
                            } else {
                                score -= 1;
                            }
                        }
                    }
                }

                score = score / cellCount;

                if (score > best) {
                    best = score;
                    tiebreakSet = [[i, j]];
                } else if (score === best) {
                    tiebreakSet.push([i, j]);
                }
            }
        }

        const bestCell = Math.floor(Math.random() * tiebreakSet.length);
        this.bestIdx = tiebreakSet[bestCell];
    }

    moveParticle(backFlag = null) {
        const [x, y] = this.pos;
        const pType = this.typeGrid[x][y];

        this.scoreWithinRadius(backFlag);
        const [bestX, bestY] = this.bestIdx;

        if (x === bestX && y === bestY) {
            // The particle didn't find a better adjacent cell to move to
        } else {
            // Move particle
            this.typeGrid[bestX][bestY] = pType;
            this.typeGrid[x][y] = 0;
        }
    }

    step(clickLocation, clickIndex, backFlag = null) {
        if (clickIndex) {
            this.affinity[clickIndex + 1] = 1 - this.affinity[clickIndex + 1];
            this.copyType[clickIndex + 1] = this.getRandomChoice([...Array(this.numTypes + 1).keys()].filter(i => i !== clickIndex + 1));
            this.replaceType[clickIndex + 1] = this.getRandomChoice([...Array(this.numTypes).keys()].filter(i => i !== clickIndex + 1 && i !== this.copyType[clickIndex + 1]));
        }

        let x = clickLocation.x;
        let y = clickLocation.y;
        x = Math.min(Math.floor(x / 6), 31);
        y = Math.min(Math.floor(y / 6), 31);

        if (!(x === 0 && y === 0)) {
            for (let rangeI = 0; rangeI < 5; rangeI++) {
                for (let rangeJ = 0; rangeJ < 5; rangeJ++) {
                    const yRow = Math.max(Math.min(rangeJ + y - 2, 31), 0);
                    const xCol = Math.min(Math.max(rangeI + x - 2, 0), 31);
                    this.typeGrid[yRow][xCol] = 0;
                }
            }
        }

        for (let t = 0; t < 0.2 * this.density * (this.length ** 2); t++) {
            const particles = [];

            for (let x = 0; x < this.length; x++) {
                for (let y = 0; y < this.length; y++) {
                    if (this.typeGrid[x][y] !== 0) {
                        particles.push([x, y]);
                    }
                }
            }

            const randParticleIdx = Math.floor(Math.random() * particles.length);
            this.pos = particles[randParticleIdx];
            this.tryReplaceParticle();
            this.moveParticle(backFlag);
        }

        const img32x32 = this.typeGrid.map(row =>
            row.map(value => (value / this.numTypes) * 255 * this.colorShift)
        );

        const mappedArray = Array.from({ length: 32 }, (_, i) =>
            Array.from({ length: 32 }, (_, j) => {
                const pixelValue = img32x32[i][j];
                const color = [
                    pixelValue % 256,
                    (2 * pixelValue + 100) % 256,
                    (3 * pixelValue + 200) % 256
                ];

                return [...color, pixelValue !== 0 ? 255 : 0];
            })
        ).flat();

        return mappedArray;
    }

    reset() {
        const params = {
            length: 32,
            numTypes: Math.floor(Math.random() * 6) + 3,
            density: 1,
            radius: Math.random() < 0.5 ? 1 : 2,
            pos: [0, 0],
            bestIdx: [0, 0],
            colorShift: Math.random() * (0.88 - 0.33) + 0.33,
            counter: 0,
            llmMessage: "",
            state: "GROWING",
        };

        const paramsDict = this.dictCreator(params);
        Object.assign(this, paramsDict);
    }

    corruptibleDialogue() {
        const loss = Math.max(300 - 2 ** (this.counter * 0.1), 0);
        const flipN = [];
        const listOfTextResponse = [this.llmMessage];

        for (const line of listOfTextResponse) {
            const lengthToFlip = Math.min(loss, line.length);
            flipN.push(lengthToFlip);
        }

        const tempDialogue = [...listOfTextResponse];

        for (let i = 0; i < tempDialogue.length; i++) {
            for (let charIdx = 0; charIdx < flipN[i]; charIdx += 2) {
                tempDialogue[i] = tempDialogue[i].substring(0, charIdx) + "?" + tempDialogue[i].substring(charIdx + 1);
            }
        }

        return tempDialogue;
    }

    dictCreator(params) {
        const mask = Array.from({ length: 32 }, (_, j) =>
            Array.from({ length: 32 }, (_, i) => this.getRandomChoice([
                this.getRandomChoice([...Array(params.numTypes + 1).keys()].filter(i => i !== 0)),
                0
            ], [params.density, 1 - params.density]))
        );

        const affinity = Array.from({ length: params.numTypes + 1 }, () =>
            Array.from({ length: params.numTypes + 1 }, () => this.getRandomChoice([0, 1], [0.35, 0.65]))
        );

        const copyType = Array.from({ length: params.numTypes + 1 }, typeIdx =>
            this.getRandomChoice([...Array(params.numTypes + 1).keys()].filter(i => i !== typeIdx && i !== 0))
        );

        const replaceType = Array.from({ length: params.numTypes + 1 }, typeIdx =>
            this.getRandomChoice([...Array(params.numTypes).keys()].filter(i => i !== typeIdx && i !== copyType[typeIdx]))
        );

        const distance = this.minDistanceToZero(mask);

        return {
            typeGrid: mask,
            affinity: affinity,
            copyType: copyType,
            replaceType: replaceType,
            distance: distance
        };
    }

    minDistanceToZero(binaryArray) {
        // # there will be a State in the game where each On/particle cell will be incentivized to move towards the inner most portion of the shape
        // # or should each particle have encoded (in the dictionary defining the state of the game) it's birth origin (i, j at step 0) that it must return to?
        // # Suppose that we had a matrix where each cell was label 0 through n. 0 would be outside the shape. 
        // # 1 would be cells on the inside of the shape, but at the perimeter. Cells one cell away from the internal boundary would be 2, and so on. 
        // # Cell n would be the inner most cells of the shape. Sort of like a Q-value of a trained grid world RL agent or something.
        // #  whether any of the adjacent cells are higher than it and moving toward that cell... and if it surrounded by all 0s, moves towards the center of the cells.
        const rows = binaryArray.length;
        const cols = binaryArray[0].length;
        const maxDistance = rows + cols;
        const minDistances = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => maxDistance)
        );
    
        // Find the positions of zero elements; iterable of {i, j}
        const zeroPositions = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (binaryArray[i][j] === 0) {
                    zeroPositions.push({ i, j });
                }
            }
        }
    
        for (const zeroPosition of zeroPositions) {
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    const distance = Math.abs(i - zeroPosition.i) + Math.abs(j - zeroPosition.j);
                    minDistances[i][j] = Math.min(minDistances[i][j], distance);
                }
            }
        }
    
        return minDistances;
    }

    getRandomChoice(array, probabilities = null, size = null) {
        if (size !== null) {
            // If size is provided, create an object of that dimensions
            const result = Array.from({ length: size[0] }, () =>
                Array.from({ length: size[1] }, () => getRandomChoice(array, probabilities))
            );
            return result;
        }
    
        if (probabilities !== null) {
            // If probabilities are provided, use them for weighted random choice
            const totalProb = probabilities.reduce((acc, prob) => acc + prob, 0);
            const randomValue = Math.random() * totalProb;
            let cumulativeProb = 0;
    
            for (let i = 0; i < array.length; i++) {
                cumulativeProb += probabilities[i];
                if (randomValue <= cumulativeProb) {
                    return array[i];
                }
            }
        }
    
        // If no probabilities or size provided, perform a simple random choice
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }
}

export { ParticleGridRoom };
 
// function create() {
//     const params = {
//         length: 32,
//         numTypes: 6,
//         density: 1,
//         radius: Math.random() < 0.5 ? 1 : 2,
//         pos: [0, 0],
//         bestIdx: [0, 0],
//         colorShift: 0.5,
//         counter: 0,
//         llmMessage: ""
//     };

//     const particleGridRoom = new ParticleGridRoom(params);
//     particleGridRoom.reset();
//     return particleGridRoom;
// }

// Example usage:
// const particleGridRoom = create();
// particleGridRoom.step({ x: 10, y: 20 }, 2, true);
// Continue using the particleGridRoom object as needed