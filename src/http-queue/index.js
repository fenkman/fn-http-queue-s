const crypto = require('crypto');

function verifyMessage(model) {
    return !process.env["slack_channel_id"] || process.env["slack_channel_id"] && model.event && model.event.channel === process.env["slack_channel_id"];
}

function verifySender(context, req) {
    const secret = process.env["slack_signing_secret"];
    const signature = req.headers["x-slack-signature"];
    const timestamp = req.headers["x-slack-request-timestamp"];
    context.log("secret: %s, signature: %s, timestamp: %s", secret, signature, timestamp);

    if (secret && signature && timestamp) {

        const requestBody = req.rawBody;
        const concat = `v0:${timestamp}:${requestBody}`;
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(concat);
        const digest = hmac.digest('hex');
        
        const valid = ("v0=" + digest === signature)
        if (!valid) {
            context.log.error("computed digest %s != signature %s. Digested value was %s", digest, signature, concat);
        }
        return valid;
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
        challenge = model && model.type && model.type === "url_verification" ? model.challenge : null;
    }

    context.res = {
        status: error ? 500 : 200,
        body: error ? error : challenge || { "status": "ok" }
    };

    if (!error && verifyMessage(model)) {
        context.bindings.out = model;
    }

    context.done(error);
};
