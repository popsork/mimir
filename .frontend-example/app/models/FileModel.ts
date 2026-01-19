import { BaseModel } from "~/models/BaseModel";

export type FileApiResourceIdentifier = { type: "files", id: string };

type FileApiResourceAttributes = {
    name: string,
    url: string,
    mime: string,
    size: number,
};

export type FileApiResponseResource = FileApiResourceIdentifier & FileApiResourceAttributes;

// using FileModel as name since File is used by the browser's File API
export class FileModel extends BaseModel<FileApiResourceIdentifier> {
    static override entity = "orm-files";
    static override apiResourceType = "files" as const;

    static override fields() {
        return {
            id: this.string(null),

            name: this.string(null),
            url: this.string(null),

            mime: this.string(null),
            size: this.number(null),
        };
    }

    declare id: string;

    declare name: string | null;
    declare url: string | null;

    declare mime: string | null;
    declare size: number | null;

    declare file: File | null;

    isImage() {
        if (!this.mime) {
            return false;
        }
        return this.mime.startsWith("image/");
    }

    static fromApiResponse(resource: FileApiResponseResource) {

        return new FileModel({
            id: resource.id,

            name: resource.name,
            url: resource.url,

            mime: resource.mime,
            size: resource.size,
        });
    }


    toApiRequestFormData(): FormData {
        const formData = new FormData();

        const fileName = this.name || (this.file ? this.file.name : null);

        formData.append("data[type]", FileModel.apiResourceType);
        if (fileName) {
            formData.append("data[attributes][name]", fileName);
        }
        if (this.file) {
            formData.append("file", this.file);
        }

        return formData;
    }
}
