export const getRealAmount = ({ amount, precision }: { amount: number | null, precision: number | null }): number | null => {
    if (amount === null) {
        return null;
    }
    return (precision) ? amount / (10 ** precision) : amount;
};
