import { v7 as uuidv7 } from "uuid";

export function generateNewUuid(): string {
    return uuidv7();
}

