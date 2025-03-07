export function genRanHex(size: Number) {
     return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}