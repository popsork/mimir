import { FileModel, type FileApiResponseResource } from "~/models/FileModel";

export const useFilesUploadStore = defineStore("files-upload", () => {
    const waitStore = useWaitStore();
    const waiterName = WaitingFor.FileUpload;
    const apiClient = useApi();

    const getDefaultValues = () => {
        return {
            fileRecordsByUploadIdentifier: new Map<string, FileModel>(),
        };
    };

    const defaults = getDefaultValues();
    const fileRecordsByUploadIdentifier = ref(defaults.fileRecordsByUploadIdentifier);

    const performUpload = wrapFunctionInApiErrorHandler(async (
        { uploadIdentifier, file, progressCallback } :
        {
            uploadIdentifier: string,
            file: File,
            progressCallback?: ({ percent }: { percent: number }) => void,
        }
    ) => {
        startWaitingForUpload(uploadIdentifier);

        const fileRecord = new FileModel();
        fileRecord.file = file;

        const formData = fileRecord.toApiRequestFormData();
        const onUploadProgress = (progressEvent: ApiUploadProgressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            progressCallback?.({ percent: percentCompleted });
        };

        try {
            const apiResponse = await apiClient.createFile({ formData, onUploadProgress });
            const fileRecord = FileModel.fromApiResponse(apiResponse.data as FileApiResponseResource);
            if (!waitingForUpload(uploadIdentifier)) {
                // upload was cancelled in the meantime
                return false;
            }

            fileRecordsByUploadIdentifier.value.set(uploadIdentifier, fileRecord);
            return true;
        } finally {
            endWaitingForUpload(uploadIdentifier);
        }
    });

    const startWaitingForUpload = (uploadIdentifier: string) => {
        waitStore.start(waiterName, uploadIdentifier);
    };

    const endWaitingForUpload = (uploadIdentifier: string) => {
        waitStore.end(waiterName, uploadIdentifier);
    };

    const waitingForUpload = (uploadIdentifier: string) => {
        return waitStore.isWaitingFor(waiterName, uploadIdentifier);
    };

    const waitingForAnyUpload = computed(() => {
        return waitStore.isWaitingFor(waiterName);
    });

    const cancelUploadIfInProgress = (uploadIdentifier: string) => {
        endWaitingForUpload(uploadIdentifier);
    };

    const cancelAllRunningUploads = () => {
        waitStore.endAll(waiterName);
    };

    const reset = () => {
        cancelAllRunningUploads();
        const defaults = getDefaultValues();
        fileRecordsByUploadIdentifier.value = defaults.fileRecordsByUploadIdentifier;
    };

    return {
        performUpload,
        cancelUploadIfInProgress,
        waitingForAnyUpload,

        fileRecordsByUploadIdentifier,
        reset,
    };
});
