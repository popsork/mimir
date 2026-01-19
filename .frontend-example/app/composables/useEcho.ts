import Echo from "laravel-echo";
import Pusher from "pusher-js";

export const useEcho = () => {
    const configuration = useConfiguration();

    const echo = ref(new Echo({
        Pusher,
        broadcaster: "reverb",
        key: configuration.reverbAppKey,
        wsHost: configuration.reverbHost,
        wsPort: parseInt(configuration.reverbPort as any) || 80,
        wssPort: parseInt(configuration.reverbPort as any) || 443,
        forceTLS: (configuration.reverbScheme ?? "https") === "https",
        enabledTransports: ["ws", "wss"],
        authEndpoint: `${configuration.reverbAuthOrigin}/broadcasting/auth`
    }));

    return {
        echo
    };
};
