# Pants Attack - Server

This is a WebSocket Server for [Pants Attack - UI](https://github.com/GreyloreNetwork/PantsAttack-UI) and must be its sibling in order to host its static build.

Both projects are currently in development, targetting this [Design Specification](https://docs.google.com/document/d/1W4HN9tZU0Rr-BptcWVyNttY190e8BYvuhWDftgLVyx4).

## Server Setup

Ensure that the **Pants Attack - UI** project is a sibling to this project folder and that its static asset bundles have been built. Then run the following:

`deno run -A app.ts`

## Third-Party Dependencies
- [Servest](https://servestjs.org/) - A progressive http server for Deno