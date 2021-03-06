# FormKiQ Module Google Sheets
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Google Sheets Module for [FormKiQ](https://github.com/formkiq/formkiq-core)

# Configuring Google Permissions

The plugin require permissions to Google Sheets.

## Generate Google Private Key Authorization

- Visit [Google Cloud Platform](https://console.cloud.google.com/)

- Click IAM & Admin and then Service Accounts

- Click **Create Service Account**

- Under **Service account details**, enter a `Service account name` and click **DONE**.

![Service Account Details](https://github.com/formkiq/formkiq-module-google-sheets/raw/master/docs/service-account-details.jpg)

- Click the `Create key` to generate a private key

![Service Accounts](https://github.com/formkiq/formkiq-module-google-sheets/raw/master/docs/service-accounts.png)

- Click `Create` and save private key to file

![Private Key](https://github.com/formkiq/formkiq-module-google-sheets/raw/master/docs/service-privatekey.jpg)

- Visit [Google Drive](https://drive.google.com/) and create a new `Google Sheets`

![Share Google Sheet](https://github.com/formkiq/formkiq-module-google-sheets/raw/master/docs/share-google-sheet.png)

- Click `Share` and enter the `gserviceaccount.com` email address from the **Service account details**

## Store Private Key in Parameter Store

To keep the privatekey secret. The plugin uses the [AWS Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) to the private key.

Save your private key to a file named `privateKey.json` and use the [AWS CLI](https://aws.amazon.com/cli/) command below to store the privatekey in the parameter store.

**NOTE:** replace <AppEnvironment> with the value used in your FormKiQ installation.

```
aws ssm put-parameter --overwrite --type SecureString --name '/formkiq/<AppEnvironment>/auth/google/spreadsheets' --value "$(cat privateKey.json)"
```
