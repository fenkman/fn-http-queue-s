function verifyMessage(model) {
    return process.env["slack_channel_id"] && model.event && model.event.channel === process.env["slack_channel_id"];
}

module.exports = function (context, req) {

    let model = (typeof req.body != 'undefined' && typeof req.body == 'object') ? req.body : null;
    let error = !model ? "no data; or invalid payload in body" : null;
    let challenge = model ? model.challenge : null;

    context.res = {
        status: error ? 500 : 200,
        body: error ? error : challenge
    };

    if (verifyMessage(model)) {
        context.bindings.out = model;
    }
    context.done(error);
};
