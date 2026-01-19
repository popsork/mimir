import { mount, type MountResult } from "mount-vue-component";

export const useComponentMounting = (container: Ref<HTMLElement | null>) => {
    // this composable provides a way to mount Vue components from setup scripts
    // so that the mounted components automatically get linked to the nuxt app instance
    // and also get safely cleaned up via the destroy() method
    // when the mounted node is removed from the DOM.
    // cleanup is triggered both when the node itself is removed (as detected by the mutation observer),
    // and also when the containing component itself gets unmounted.

    // use WeakMap instead of Map so DOM node keys don’t keep objects alive: entries will auto-GC when nodes are detached.
    // a regular Map holds strong references and would leak unless everything gets manually removed
    let destructors = new WeakMap<HTMLElement, () => void>();

    const clearDestructors = () => {
        // WeakMap doesn't have a clear() method, so just recreate it
        destructors = new WeakMap<HTMLElement, () => void>();
    };

    let containerMutationObserver: MutationObserver | null = null;

    const startMutationObserver = (root: HTMLElement | null) => {
        if (!root || containerMutationObserver) {
            return;
        }
        containerMutationObserver = new MutationObserver((mutations) => {
            // whenever a node within the container is removed from DOM,
            // check if it or any of its descendants are mounted Vue components
            // and if so, call their destroy() method to clean them up properly
            for (const mutation of mutations) {
                mutation.removedNodes.forEach((node) => {
                    if (!(node instanceof HTMLElement)) return;
                    cleanupMountedDescendantNodes(node);
                });
            }
        });
        containerMutationObserver.observe(root, { childList: true, subtree: true });
    };

    const stopMutationObserver = () => {
        containerMutationObserver?.disconnect();
        containerMutationObserver = null;
    };

    const cleanupMountedNode = (el: HTMLElement) => {
        const destroy = destructors.get(el);
        if (!destroy) {
            return;
        }
        destructors.delete(el);
        destroy();
    };

    const cleanupMountedDescendantNodes = (el: HTMLElement) => {
        const treeWalker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT);
        cleanupMountedNode(el);
        for (
            let currentNode = treeWalker.nextNode() as HTMLElement | null;
            currentNode;
            currentNode = treeWalker.nextNode() as HTMLElement | null
        ) {
            cleanupMountedNode(currentNode);
        }
    };

    const nuxtApp = useNuxtApp();

    type MountFunction = <TProps>(
        component: Component,
        options?: {
            props?: TProps,
            children?: unknown,
            element?: HTMLElement,
        }
    ) => MountResult;

    const once = <T extends (...args: any[]) => any>(fn: T) => {
        // a wrapper to ensure a function is only called once,
        // in case destroy() gets called multiple times for the same node
        // and the destructor function is not idempotent
        let done = false;
        return (...args: Parameters<T>) => {
            if (!done) {
                done = true;
                return fn(...args);
            }
        };
    };

    const mountComponent: MountFunction = (component, options = {}) => {
        const result = mount(component, { ...options, app: nuxtApp.vueApp });

        const { el, destroy } = result;
        destructors.set(el, once(destroy as () => void));

        return result;
    };

    onMounted(() => {
        startMutationObserver(container.value);
    });

    watch(container, (containerNode) => {
        // if container appears later after mounting or changes, rebind the observer.
        // normally, the container should not change.
        stopMutationObserver();
        startMutationObserver(containerNode);
    });

    onBeforeUnmount(() => {
        containerMutationObserver?.disconnect();
        containerMutationObserver = null;

        if (!container.value) {
            return;
        }

        // when unmounting the whole container, clean up all mounted nodes within it and clear the destructor registry
        cleanupMountedDescendantNodes(container.value);
        clearDestructors();
    });

    return {
        mountComponent
    };

};
