import { Board } from "./entities/Board";

export class BoardBuilder {
    private board: Board;
    
    constructor() {
        this.board = {
            size: 10,
            elements: []
        }
        const map = this.createMap();
        for(let i = 0; i < this.board.size; i++)
            for(let j = 0; j < this.board.size; j++)
                if(map[i][j] != 0) {
                    this.board.elements.push({x : i, y : j, type : map[i][j]});
                }
    }

    private createMap(): number[][] {
        const map: number[][] = Array(10).fill(0).map(() => Array(10).fill(0));
        let count = 0;
        
        const corners = [
            [0, 0],     
            [0, 9],     
            [9, 0],     
            [9, 9]      
        ];

        const selectedCorners = corners
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);

        map[selectedCorners[0][0]][selectedCorners[0][1]] = 6;
        map[selectedCorners[1][0]][selectedCorners[1][1]] = 6;

        while (count < 8) {
            const x = Math.floor(Math.random() * 8) + 1;
            const y = Math.floor(Math.random() * 8) + 1;
            
            if (this.isValidPosition(map, x, y)) {
                map[x][y] = 5;
                count++;
            }
        }
        
        return map;
    }

    private isValidPosition(map: number[][], x: number, y: number): boolean {
        if (map[x][y] !== 0) return false;
        
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (map[x + i]?.[y + j] === 5 || map[x + i]?.[y + j] === 6) return false;
            }
        }
        return true;
    }

    public getBoard(): Board {
        return this.board;
    }
}