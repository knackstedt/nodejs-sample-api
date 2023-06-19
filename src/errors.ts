import * as express from "express";

export const router = express.Router();

const isProduction = process.env["NODE_ENV"]?.toLowerCase() == "production";


// Catch-all error handler.
export const ErrorHandler = (err, req, res, next) => {
    let jsonResult: any = {};

    switch (true) {
        case typeof err == 'number': {
            let message = {
                200: "Ok",
                201: "Created",
                202: "Accepted",
                204: "No Content",
                400: "Malformed Request",
                401: "Not Authorized",
                403: "Forbidden",
                404: "Not Found",
                405: "Method Not Allowed",
                408: "Request Timeout",
                422: "Unprocessable Entity"
            }[err];
            jsonResult = {
                status: err,
                message,
                name: "HTTP Error"
            }
            break;
        }
        case (typeof err == 'string'): {
            jsonResult = {
                name: "The server returned the following error",
                status: 500,
                message: err
            }
            break;
        }
        case (typeof err == 'object' && err.hasOwnProperty("isAxiosError")): {
            // let resBuf = err.response.data?.read();
            // let resText = resBuf?.toString();
            // let resJson = safeJsonParse(resText);
            let jsonError = err.toJSON();

            jsonResult = {
                name: err.statusText || "Axios Request Failed",
                title: err.response.statusText?.toString(),
                message: jsonError.message?.toString() || jsonError.body?.toString() || jsonError.content?.toString(),
                status:
                    (typeof jsonError.status == "number" && jsonError.status) ||
                    (typeof jsonError.code == "number" && jsonError.code) ||
                    (typeof err.response.status == "number" && err.response.status) ||
                    (typeof err.status == "number" && err.status) ||
                    (typeof err.code == "number" && err.code) ||
                    502,
                stack: jsonError.stack?.toString(),
                url: jsonError.config.url?.toString(),
                method: jsonError.config.method?.toString()
            }
            break;
        }
        case (typeof err == 'object'): {
            // General error handling
            jsonResult = {
                name: err.name?.toString() || "Request Failed",
                title: err.title?.toString() || "Failed to handle request",
                message: err.message?.toString() || (!err.stack && err.toString()) || "General Error",
                status:
                    (typeof err.response?.status == "number" && err.response?.status) ||
                    (typeof err.status == "number" && err.status) ||
                    (typeof err.code == "number" && err.code) ||
                    500,
                stack: err.stack?.toString()
            }
        }
    }

    // This shouldn't happen unless a really badly formatted error comes through.
    if (!jsonResult.status) {
        jsonResult.status = 500;
        console.error("SEVERE: jsonResult status was never defined")
    }

    if (jsonResult.status >= 405) {
        if (jsonResult.constructor.name.endsWith("Error"))
            console.error(jsonResult);
        else
            console.error(`${jsonResult.name}\n${jsonResult.message}\n${jsonResult.stack}`);
    }

    // Remove stacktrace information from the reported error in higher environments
    // Higher-level environments should not have code or stacktraces exposed.
    if (!req.session?.profile?.isAdmin && isProduction) {
        delete jsonResult.stack;  // Stacktrace includes code.
        delete jsonResult.url;    // Omit axios url from error.
        delete jsonResult.method; // Omit axios method from error.
    }

    res.status(jsonResult.status);
    res.send(jsonResult);
};
