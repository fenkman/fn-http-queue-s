const crypto = require('crypto');

function verifyMessage(model) {
    return process.env["slack_channel_id"] && model.event && model.event.channel === process.env["slack_channel_id"];
}

function verifySender(context, req) {
    const secret = process.env["slack_signing_secret"];
    const signature = req.headers["X-Slack-Signature"];
    const timestamp = req.headers["X-Slack-Request-Timestamp"];
    context.log("secret: %s, signature: %s, timestamp: %s", secret, signature, timestamp);
    if (secret && signature && timestamp) {

        const requestBody = req.rawBody;
        const concat = `v0:${timestamp}:${requestBody}`;
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(concat);
        const digest = hmac.digest();
        
        if (!digest === signature) {
            context.error("computed digest %s != signature %s. Digested value was %s", digest, signature, concat);
        }
        return digest === signature;
    }
    return false;
}

module.exports = function (context, req) {

    let model = (typeof req.body != 'undefined' && typeof req.body == 'object') ? req.body : null;

    let error;
    let challenge;

    if (!model) {
        error = "no data; or invalid payload in body";
    }

    if (!verifySender(context, req)) {
        error = "unauthorized access. failed to verify sender signature."
    } else {
        challenge = model ? model.challenge : null;
    }

    context.res = {
        status: error ? 500 : 200,
        body: error ? error : challenge
    };

    if (!error && verifyMessage(model)) {
        context.bindings.out = model;
    }

    context.done(error);
};
