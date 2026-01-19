import { View, type ViewApiResponseResource, type ViewConfig } from "~/models/View";
import { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";

type TemporaryViewArgs = {
    context: ViewContext,
    config: Record<string, any>,
    replace?: boolean,
};

export const useViewsStore = defineStore("views", () => {
    const model = View;
    const repo = useRepo(model);
    const waiterName = WaitingFor.Views;
    const waitStore = useWaitStore();
    const currentUserPermissions = useCurrentUserPermissionStore();

    const viewsLoaded = ref(false);
    const waitingForViews = computed(() => waitStore.isWaitingFor(waiterName));

    const formErrors = ref(new JsonApiErrorCollection());
    const clearFormErrors = () => {
        formErrors.value = new JsonApiErrorCollection();
    };

    const views = computed(() => {
        return repo.orderBy("userId").orderBy("sequenceNumber").get();
    });

    const fetchViews = wrapFunctionInApiErrorHandler(async () => {
        const apiResponse: { data: ViewApiResponseResource[] } = await useApi().getViews();

        //
        // Temporary fix for handling when multiple views have the same user_id + order_by combination
        // which makes the sorting of views arbitrary in frontend and makes the tabs "jump around" when
        // switching. Backend bug registered as TMS-2553.
        const sequenceNumberByUserId = {} as Record<string, number>;
        return apiResponse.data.map((resource) => {
            const record = model.fromApiResponse(resource);
            const userIdString = record.userId + ""; // this will resolve to "null" (string) for system views that have no user
            if (!(userIdString in sequenceNumberByUserId)) {
                sequenceNumberByUserId[userIdString] = 0;
            }

            record.sequenceNumber = sequenceNumberByUserId[userIdString]!++;
            return record;
        });
    });

    const fetchView = wrapFunctionInApiErrorHandler(async (viewId: string) => {
        const apiResponse: { data: ViewApiResponseResource } = await useApi().getView(viewId);
        return model.fromApiResponse(apiResponse.data);
    });

    const getViewsByContext = (context: ViewContext) => {
        return repo.where("context", context).orderBy("userId", "desc").orderBy("sequenceNumber").get();
    };

    const getDefaultView = (context: ViewContext) => {
        return repo.where("context", context).where("type", ViewType.Default).first();
    };

    const createTemporaryView = ({ context, config, replace }: TemporaryViewArgs) => {
        const defaultView = getDefaultView(context);
        if (!defaultView) {
            return null;
        }

        const temporaryView = defaultView.clone();
        temporaryView.id = generateNewUuid();
        temporaryView.type = ViewType.Temporary;
        temporaryView.config = replace ? config : { ...defaultView.config, ...config };
        temporaryView.name = "Temporary " + context;
        temporaryView.isReadonly = true;

        repo.save(temporaryView);
        return temporaryView;
    };

    const getOrCreateTemporaryView = ({ context, config, replace = false }: TemporaryViewArgs) => {
        if (!viewsLoaded.value) {
            return null;
        }

        const temporaryView = repo.where("context", context).where("type", ViewType.Temporary).first();
        if (!temporaryView) {
            return createTemporaryView({ context, config, replace });
        }

        temporaryView.config = replace ? config : { ...temporaryView.config, ...config };
        return temporaryView;
    };

    const loadViews = async () => {
        waitStore.start(waiterName);
        try {
            const views = await fetchViews();

            repo.flush();
            repo.save(views);

            viewsLoaded.value = true;
        } finally {
            waitStore.end(waiterName);
        }
    };

    const saveViewAsNew = wrapFunctionInApiErrorHandler(async <T extends View<ViewConfig>>(view: T, viewName: string) => {
        waitStore.start(WaitingFor.ViewSaveAsNew);
        try {
            const sequenceNumbers = repo.where("context", view.context).get().map(v => v.sequenceNumber);
            const highestSequenceNumber = sequenceNumbers.length > 0 ? Math.max(...sequenceNumbers) : 0;

            const newView = view.clone();
            newView.name = viewName;
            newView.sequenceNumber = highestSequenceNumber + 1;
            newView.shortcut = null;

            newView.enforceNoShortcutOnSystemViews();

            //
            // If the current user is not admin, force is_default and is_system to false.
            // This should probably be implemented in backend (TMS-1109).
            if (!currentUserPermissions.isAdmin()) {
                newView.type = ViewType.Default;
                newView.isSticky = false;
            }

            const viewBody = newView.toRequestBody();
            viewBody.id = null;

            const apiResponse: {
                data: ViewApiResponseResource,
            } = await useApi().createView({ view: viewBody });

            const apiView = model.fromApiResponse(apiResponse.data);
            repo.save(apiView);

            clearFormErrors();
            return apiView as T;
        } catch (error) {
            const displayableErrors = extractDisplayableJsonApiErrors({ error });
            if (displayableErrors) {
                formErrors.value = displayableErrors;
            } else {
                clearFormErrors();
                throw error;
            }

            return null;
        } finally {
            waitStore.end(WaitingFor.ViewSaveAsNew);
        }
    });

    const saveView = wrapFunctionInApiErrorHandler(async (view: View<ViewConfig>) => {
        waitStore.start(WaitingFor.ViewSave);
        try {
            const newView = view.clone();

            // Enforce shortcut rules
            newView.enforceNoShortcutOnSystemViews();

            const apiResponse: {
                data: ViewApiResponseResource,
            } = await useApi().updateView({ view: newView.toRequestBody() });

            const apiView = model.fromApiResponse(apiResponse.data);
            repo.save(apiView);

            clearFormErrors();
            return true;
        } catch (error) {
            const displayableErrors = extractDisplayableJsonApiErrors({ error });
            if (displayableErrors) {
                formErrors.value = displayableErrors;
            } else {
                clearFormErrors();
                throw error;
            }

            return false;
        } finally {
            waitStore.end(WaitingFor.ViewSave);
        }
    });

    const upsertView = wrapFunctionInApiErrorHandler(async (view: View<ViewConfig>) => {
        waitStore.start(WaitingFor.ViewUpsert);
        try {
            const newView = view.clone();

            // Enforce shortcut rules
            newView.enforceNoShortcutOnSystemViews();

            const apiResponse: {
                data: ViewApiResponseResource,
            } = await useApi().upsertView({ view: newView.toRequestBody() });

            const apiView = model.fromApiResponse(apiResponse.data);
            repo.save(apiView);

            clearFormErrors();
            return true;
        } catch (error) {
            const displayableErrors = extractDisplayableJsonApiErrors({ error });
            if (displayableErrors) {
                formErrors.value = displayableErrors;
            } else {
                clearFormErrors();
                throw error;
            }

            return false;
        } finally {
            waitStore.end(WaitingFor.ViewUpsert);
        }
    });

    const revertView = async (viewId: string) => {
        waitStore.start(WaitingFor.ViewRevert);
        try {
            const view = await fetchView(viewId);
            return repo.save(view);
        } finally {
            waitStore.end(WaitingFor.ViewRevert);
        }
    };

    const deleteView = wrapFunctionInApiErrorHandler(async (viewId: string) => {
        waitStore.start(WaitingFor.ViewDelete);
        try {
            await useApi().deleteView(viewId);
            repo.destroy(viewId);
            return true;
        } catch (error) {
            const displayableErrors = extractDisplayableJsonApiErrors({ error });
            if (displayableErrors) {
                formErrors.value = displayableErrors;
            } else {
                clearFormErrors();
                throw error;
            }

            return false;
        } finally {
            waitStore.end(WaitingFor.ViewDelete);
        }
    });

    const loadViewsIfNeeded = () => {
        if (viewsLoaded.value || waitingForViews.value) {
            return;
        }

        loadViews();
    };

    const updateLocal = (view: View<ViewConfig>) => {
        repo.destroy(view.id);
        repo.save(view);
    };

    return {
        loadViewsIfNeeded,
        viewsLoaded,
        waitingForViews,
        views,
        updateLocal,
        getViewsByContext,
        formErrors,
        clearFormErrors,
        getOrCreateTemporaryView,
        getDefaultView,

        revertView,
        saveView,
        saveViewAsNew,
        upsertView,
        deleteView,
    };
});
