# Local secrets (gitignored)

Place your Firebase Admin service account JSON here:

`firebase-service-account.json`

Download from: Firebase Console → Project settings → Service accounts → Generate new private key

Then run:

```bash
npm run guests -- import data/guests.sample.csv
```
