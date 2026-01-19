<template lang="pug">
GenericForm(v-on:submit.prevent="submitForm")
    WelcomeSubheading(:text="$t('welcome.Log in with Motus ID')")
    fieldset
        FormInputField(
            ref="emailField"
            v-model="passwordForm.email"
            type="email"
            size="large"
            :label="$t('welcome.fields.E-mail')"
            :errors="emailErrors"
        )
        FormInputField(
            ref="passwordField"
            v-model="passwordForm.password"
            type="password"
            size="large"
            :label="$t('welcome.fields.Password')"
            :errors="passwordErrors"
        )
    FormErrors(:errors="formErrors")
    GenericButton(name="submit" button-type="submit" size="large" icon="enter") {{ $t('welcome.actions.Log in') }}
    GenericButton(name="forgot-password" to="/admin/password-reset/request" size="large" type="ghost" :external="true") {{ $t('welcome.actions.Forgot password?') }}
</template>
<script setup lang="ts">


const store = useAuthenticationStore();
store.clearPasswordForm();

const { passwordForm } = storeToRefs(store);

const errorsExist = computed(() => passwordForm.value.errors.length > 0);

const emailErrors = computed(() => passwordForm.value.errors.forField("email"));
const passwordErrors = computed(() => passwordForm.value.errors.forField("password"));

const formErrors = computed(() => {
    return passwordForm.value.errors.exceptForFields(["email", "password"]);
});


const emailField = useTemplateRef("emailField");
const passwordField = useTemplateRef("passwordField");

const submitForm = async () => {
    if (passwordForm.value.email === "" && passwordForm.value.password === "") {
        // do not attempt to submit a completely blank form
        if (emailField.value) {
            emailField.value.focus();
        }
        return;
    }

    const result = await store.performPasswordSignIn();
    if (result !== true && errorsExist.value) {
        if (emailErrors.value.length > 0 || formErrors.value.length > 0) {
            if (emailField.value) {
                emailField.value.focus();
            }
        } else if (passwordField.value) {
            passwordField.value.focus();
        }
    }
};

</script>
<style scoped lang="scss">
form {
    width: 100%;
    padding-bottom: steps(5);
    display: flex;
    flex-direction: column;

    fieldset {
        margin-bottom: steps(0.5);
    }

    .field {
        margin-bottom: steps(2);
    }

    .button[data-name="submit"] {
        width: 100%;
        margin-bottom: steps(1);
    }

    .button[data-name="forgot-password"] {
        align-self: center;
    }
}
</style>
