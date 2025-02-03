export function kgToPounds(weight: number): number {
    weight = weight * 2.20462;
    return parseFloat(weight.toFixed(1));
}

export function poundsToKg(weight: number): number {
    weight = weight / 2.20462;
    return parseFloat(weight.toFixed(1));
}
