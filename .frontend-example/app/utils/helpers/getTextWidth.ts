let canvas = null as HTMLCanvasElement | null;

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
export const getTextWidth = function(text: string, font: string): number {
    if (!canvas) {
        canvas = document.createElement("canvas");
    }

    const context = canvas.getContext("2d")!;
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
};
