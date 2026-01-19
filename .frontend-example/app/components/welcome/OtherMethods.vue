<template lang="pug">
.other-methods
    WelcomeSubheading(:text="$t('welcome.Or')")
    GenericForm(v-on:submit.prevent="submitForm")
        GenericButton(
            type="secondary"
            size="large"
            button-type="submit"
        ) {{ $t('welcome.actions.Log in with Entra ID') }}
        FormErrors(:errors="externalAuthenticationForm.errors")
</template>
<script setup lang="ts">

const store = useAuthenticationStore();
// store.clearExternalAuthenticationForm() is intentionally NOT called here
// because, unlike in the password form, this form should show any errors from the previous attempt if it failed.
// this is due to how the external callback url works. the user lands at /authentication-callback/?code=xxx
// and if there are any errors with the code, the errors collection gets set on the external form.
// the user then gets redirected back to this view, where the error message should be displayed under the button.

const { externalAuthenticationForm } = storeToRefs(store);

const router = useRouter();

const callbackUrl = computed(() => {
    const path = router.resolve({ name: "authentication-callback" }).href;
    const { siteOrigin } = useConfiguration();
    return `${siteOrigin}${path}`;
});

const submitForm = async () => {
    const session = await store.initiateExternalAuthenticationSession({
        authority: ExternalAuthenticationAuthority.EntraId,
        callbackUrl: callbackUrl.value
    });
    if (session && session.authenticationUrl) {
        window.location.href = session.authenticationUrl;
    }
};

</script>
<style scoped lang="scss">
.other-methods {
    display: flex;
    width: 100%;
    flex-direction: column;

    border-top: 1px solid $color-border-normal;

    .button {
        width: 100%;
    }

    .errors {
        text-align: center;
    }
}
</style>
