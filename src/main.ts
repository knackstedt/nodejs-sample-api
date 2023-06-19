import express from 'express';
import helmet from 'helmet';

import { environment } from './environment';
import { ErrorHandler } from './errors';
import { FilesystemApi } from "./api/files";
// import { XOrgApi } from './api/xorg';
// import { RestApi } from './api/rest';
import { MusicApi } from './api/music';
import { DataApi } from './db';

(async () => {
    const app = express();

    app.use(helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            "default-src": ["'self'",],
            "frame-ancestors": ["'self'"],
            "frame-src": ["'self'"],
            "font-src": ["'self'", "data:"],
            "form-action": ["'self'"],
            "img-src": ["*", "data:"],
            "media-src": ["'self'", "blob:" ],
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            "script-src-attr": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            "style-src": ["'self'", "'unsafe-inline'"],
            // "report-uri": ["/api/Security/Violation"],
            "worker-src": ["'self'", "blob:"]
        }
    }));
    app.use(helmet.dnsPrefetchControl({ allow: false }));
    app.use(helmet.frameguard({ action: "sameorigin" }));
    app.use(helmet.hidePoweredBy());
    app.use(helmet.permittedCrossDomainPolicies());
    app.use(helmet.referrerPolicy());
    app.use(helmet.xssFilter());

    app.use("/api/filesystem", FilesystemApi);
    // app.use("/api/xorg", XOrgApi);
    // app.use("/api/rest", RestApi);
    app.use("/api/music", MusicApi);
    app.use("/api/data", DataApi);

    // new TerminalSocketService(httpserver);
    // new MetricSocketService(httpserver);

    app.use((req, res, next) => next(404));
    app.use(ErrorHandler);

        // Listen on the specified port.
    await app.listen(environment.port);

})();
