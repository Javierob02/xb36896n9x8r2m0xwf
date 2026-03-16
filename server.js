import log from 'book';
import Koa from 'koa';
import tldjs from 'tldjs';
import Debug from 'debug';
import http from 'http';
import { hri } from 'human-readable-ids';
import Router from 'koa-router';

import ClientManager from './lib/ClientManager/index.js';

const debug = Debug('localtunnel:server');

export default function(opt = {}) {

    const validHosts = (opt.domain) ? [opt.domain] : undefined;
    const myTldjs = tldjs.fromUserSettings({ validHosts });

    function GetClientIdFromHostname(hostname) {
        return myTldjs.getSubdomain(hostname);
    }

    const manager = new ClientManager(opt);

    const schema = opt.secure ? 'https' : 'http';

    const app = new Koa();
    const router = new Router();

    router.get('/api/status', async (ctx) => {
        const stats = manager.stats;
        ctx.body = {
            tunnels: stats.tunnels,
            mem: process.memoryUsage(),
        };
    });

    app.use(router.routes());
    app.use(router.allowedMethods());

    app.use(async (ctx, next) => {
        const path = ctx.request.path;

        if (path !== '/') {
            await next();
            return;
        }

        const isNewClientRequest = ctx.query['new'] !== undefined;

        if (isNewClientRequest) {

            const reqId = hri.random();
            debug('creating new client %s', reqId);

            const info = await manager.newClient(reqId);

            const url = schema + '://' + info.id + '.' + ctx.request.host;

            info.url = url;

            ctx.body = info;
            return;
        }

        ctx.body = 'LocalTunnel Server Running';
    });

    const server = http.createServer();

    const appCallback = app.callback();

    server.on('request', (req, res) => {

        const hostname = req.headers.host;

        if (!hostname) {
            res.statusCode = 400;
            res.end('Host header required');
            return;
        }

        const clientId = GetClientIdFromHostname(hostname);

        if (!clientId) {
            appCallback(req, res);
            return;
        }

        const client = manager.getClient(clientId);

        if (!client) {
            res.statusCode = 404;
            res.end('Tunnel not found');
            return;
        }

        client.handleRequest(req, res);
    });

    server.on('upgrade', (req, socket) => {

        const hostname = req.headers.host;

        if (!hostname) {
            socket.destroy();
            return;
        }

        const clientId = GetClientIdFromHostname(hostname);

        if (!clientId) {
            socket.destroy();
            return;
        }

        const client = manager.getClient(clientId);

        if (!client) {
            socket.destroy();
            return;
        }

        client.handleUpgrade(req, socket);
    });

    return server;
}
