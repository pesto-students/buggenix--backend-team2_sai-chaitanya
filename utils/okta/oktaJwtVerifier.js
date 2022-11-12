import OktaJwtVerifier from '@okta/jwt-verifier';

export const oktaJwtVerifier = new OktaJwtVerifier({
    issuer: "https://dev-02087076.okta.com/oauth2/default" // required
});