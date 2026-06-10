#!/usr/bin/env python3
"""Phase 0 — proxy de réécriture du header Host pour le CDP (côté VPS, optionnel).

Chrome applique une protection anti DNS-rebinding : ses endpoints CDP (HTTP /json et
upgrade WebSocket) renvoient 403 si le header `Host` est un nom de domaine. `localhost`
et une IP littérale sont acceptés.

Chemin nominal : viser directement http://localhost:9222 (Host = localhost → OK), aucun
proxy requis. Ce proxy ne sert que si un client CDP vise un hostname : il écoute en local,
forwarde vers le Chrome tunnelé (127.0.0.1:9222) et réécrit la ligne `Host:` de la première
requête HTTP de chaque connexion en `localhost:<port>` avant de laisser passer les octets
verbatim (vaut pour le polling /json comme pour l'upgrade WebSocket).

Usage (VPS) :
    python3 vps-cdp-proxy.py --listen 127.0.0.1:9223 --upstream 127.0.0.1:9222
puis pointer l'endpoint CDP d'Hermes sur http://localhost:9223
"""
import argparse
import asyncio


async def _pipe(reader: asyncio.StreamReader, writer: asyncio.StreamWriter) -> None:
    try:
        while True:
            data = await reader.read(65536)
            if not data:
                break
            writer.write(data)
            await writer.drain()
    except (ConnectionResetError, BrokenPipeError, asyncio.IncompleteReadError):
        pass
    finally:
        if not writer.is_closing():
            writer.close()


def _rewrite_host(head: bytes, host_value: str) -> bytes:
    """Remplace (ou insère) la ligne Host: dans les en-têtes d'une requête HTTP."""
    lines = head.split(b"\r\n")
    new_host = b"Host: " + host_value.encode()
    replaced = False
    for i, line in enumerate(lines):
        if line.lower().startswith(b"host:"):
            lines[i] = new_host
            replaced = True
            break
    if not replaced and len(lines) >= 1:
        lines.insert(1, new_host)  # juste après la request-line
    return b"\r\n".join(lines)


async def _handle(client_reader, client_writer, up_host, up_port, host_value):
    try:
        up_reader, up_writer = await asyncio.open_connection(up_host, up_port)
    except OSError:
        client_writer.close()
        return

    # Lit les en-têtes de la requête initiale, réécrit Host, puis relaie tout le flux.
    buf = b""
    while b"\r\n\r\n" not in buf:
        chunk = await client_reader.read(65536)
        if not chunk:
            break
        buf += chunk

    if buf:
        head, sep, rest = buf.partition(b"\r\n\r\n")
        up_writer.write(_rewrite_host(head, host_value) + sep + rest)
        await up_writer.drain()

    await asyncio.gather(
        _pipe(client_reader, up_writer),
        _pipe(up_reader, client_writer),
    )


def _split_hostport(value: str) -> tuple[str, int]:
    host, _, port = value.rpartition(":")
    return host, int(port)


async def _main() -> None:
    ap = argparse.ArgumentParser(description="CDP Host-header rewrite proxy")
    ap.add_argument("--listen", default="127.0.0.1:9223")
    ap.add_argument("--upstream", default="127.0.0.1:9222")
    args = ap.parse_args()

    listen_host, listen_port = _split_hostport(args.listen)
    up_host, up_port = _split_hostport(args.upstream)
    host_value = "localhost:%d" % up_port

    server = await asyncio.start_server(
        lambda r, w: _handle(r, w, up_host, up_port, host_value),
        listen_host,
        listen_port,
    )
    print("CDP proxy: %s -> %s  (Host réécrit en %s)" % (args.listen, args.upstream, host_value))
    async with server:
        await server.serve_forever()


if __name__ == "__main__":
    try:
        asyncio.run(_main())
    except KeyboardInterrupt:
        pass
