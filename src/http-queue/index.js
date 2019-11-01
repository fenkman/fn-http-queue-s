module.exports = function (context, req) {

    let model = (typeof req.body != 'undefined' && typeof req.body == 'object') ? req.body : null;
    let error = !model ? "no data; or invalid payload in body" : null;
    let challenge = model ? model.challenge : null;

    context.res = {
        status: error ? 500 : 200,
        body: error ? error : challenge
    };

    context.bindings.out = model;
    context.done(error);
};
