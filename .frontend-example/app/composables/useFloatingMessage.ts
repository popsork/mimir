import type { MessageRenderMessage, MessageReactive } from "naive-ui";
import { FloatingMessage } from "#components";

export const useFloatingMessage = () => {
    const message = useMessage();
    const messageInstaces: Record<string, MessageReactive> = {};

    const showMessage = ({ type, text, autoClose }: { type: FloatingMessageType, text: string, autoClose?: boolean }) => {
        const method = getMessageMethod(type);

        const manualClose = autoClose === false; // undefined autoClose defaults to true

        const messageId = generateNewUuid();

        messageInstaces[messageId] = method(text, {
            type,
            render: buildRenderFunction(messageId),
            duration: (manualClose) ? 0 : 5000,
            closable: manualClose,
            onLeave: () => {
                Reflect.deleteProperty(messageInstaces, messageId);
            }
        });
    };

    const buildRenderFunction = (messageId: string): MessageRenderMessage => {
        return (props) => h(
            FloatingMessage,
            {
                type: props.type as FloatingMessageType,
                text: props.content as string,
                closable: props.closable,
                onClose: () => {
                    closeMessage(messageId);
                }
            }
        );
    };

    const getMessageMethod = (type: FloatingMessageType) => {
        switch (type) {
            case FloatingMessageType.Success:
                return message.success;
            case FloatingMessageType.Warning:
                return message.warning;
            case FloatingMessageType.Error:
                return message.error;
            case FloatingMessageType.Loading:
                return message.loading;
            default:
                return message.info;
        }
    };

    const closeMessage = (messageId: string) => {
        if (messageInstaces[messageId]) {
            messageInstaces[messageId].destroy();
        }
    };

    const closeMessages = () => {
        const messageIds = Object.keys(messageInstaces);
        messageIds.forEach(id => closeMessage(id));
    };


    return {
        showMessage,
        closeMessages,
    };
};
