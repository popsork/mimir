import { ERROR_404_MESSAGE } from "~/constants/errors";

export function build404() {
    return createError({
        statusCode: HttpStatus.NotFound,
        message: ERROR_404_MESSAGE,
        fatal: true
    });
}
