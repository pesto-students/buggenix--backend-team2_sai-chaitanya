import { oktaJwtVerifier } from "./oktaJwtVerifier.js";

export const oktaAuthRequired = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/Bearer (.+)/);
  
    if (!match) {
      res.status(401);
      return next('Unauthorized');
    }
  
    const idToken = match[1];
    const audience = 'api://default';
    let expectedClientId = "0oa76x7zuelWnRbbu5d7"
    // nonce is expected to send from headers
    let expectedNonce = "6My9STOaBXinKD6zpvoMuyPLnH276SPzVabctwWWMr7z6uDYlrBNVPY4yz4WoWi5"
    return (
      oktaJwtVerifier.verifyIdToken(idToken, expectedClientId, expectedNonce)
        .then(jwt => {
        // the token is valid (per definition of 'valid' above)
          console.log('jwt',jwt);
          req.email = jwt.claims.email;
          next()
        })
        .catch(err => {
        // a validation failed, inspect the error
          next(err)
        })
        .catch((err) => {
            res.status(401).send(err.message);
        })
    );
};