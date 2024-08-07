export function chunkArray<T>(array: readonly T[], chunkSize: number): T[][] {
    const result = [];

    for (let index = 0; index < array.length; index += chunkSize) {
        const chunk = array.slice(index, index + chunkSize);
        result.push(chunk);
    }

    return result;
}

export function randomEntry<T>(array: readonly T[]): T {
    return array[(array.length * Math.random()) | 0];
}

export type WeightedElement = {
    weight: number;
};

export function randomEntryWeighted<T extends WeightedElement>(
    array: readonly Readonly<T>[],
): Readonly<T> {
    if (array.length === 0) {
        throw new Error("Cannot select random entry from empty array");
    }

    const prefixSum = [0];
    for (let i = 1; i < array.length; ++i) {
        prefixSum[i] = array[i].weight + prefixSum[i - 1];
    }

    const offset = Math.random() * prefixSum[prefixSum.length - 1];

    for (let i = 0; i < array.length; ++i) {
        if (prefixSum[i] > offset) {
            return array[i];
        }
    }
    return array[array.length - 1];
}

export function shuffleArray<T>(array: readonly T[], biasFn: (item: T) => number): T[] {
    return array
        .map((value, _idx) => ({ value, bias: biasFn(value) }))
        .sort((a, b) => a.bias - b.bias)
        .map(({ value }) => value);
}
