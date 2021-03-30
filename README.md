# Gentlestudent Firebase Cloud Functions

## Documentation

### Run locally

In `dev` mode, use the Cloud Functions emulator to execute the functions. You can achieve by running the following (make sure to first configure the project, see next subsection):

```
yarn serve
```

/!\ If not already done, do not forget to configure the app to use the functions emulator. [Run functions locally](https://firebase.google.com/docs/functions/local-emulator?hl=en#instrument_your_app_for_callable_functions).

#### Configuration
Create `.runtimeconfig.json` with the same structure as `.runtimeconfig.example.json`. This specifies the configuration for the mailing server.
You need to provide your own SMTP service. You may want to use a service such as [Mailcatcher](https://mailcatcher.me/) or similar to fake an SMTP server.
