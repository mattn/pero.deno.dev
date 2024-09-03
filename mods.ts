import { Buffer } from "https://deno.land/std/io/mod.ts";
import { Application, Context } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { nostr } from "./deps.ts";

const page = `
<!doctype html>
<link href="//fonts.bunny.net/css?family=sigmar-one:400" rel="stylesheet" />
<meta charset="utf-8" />
<title>Cloudflare Gyazo</title>
<style>
body {
  font-size: 40px;
  text-align: center;
}
h1,h2,h3 {
  font-family: 'Sigmar One', serif;
  font-style: normal;
  text-shadow: none;
  text-decoration: none;
  text-transform: none;
  letter-spacing: -0.05em;
  word-spacing: 0em;
  line-height: 1.15;
}
</style>
<body>
	<h1>ぺろぺろ</h1>
	2024 (C) <a href="http://mattn.kaoriya.net/">mattn</a>, code is <a href="https://github.com/mattn/pero.deno.dev">here</a>
</body>
`;

function createReplyWithTags(
  env: Deno.Env,
  mention: nostr.Event,
  message: string,
  tags: string[][],
  notice: boolean = true,
): nostr.Event {
  const decoded = nostr.nip19.decode(env.get("NULLPOGA_NSEC"));
  const sk = decoded.data as string;
  const pk = nostr.getPublicKey(sk);
  if (mention.pubkey === pk) throw new Error("Self reply not acceptable");
  const tt = [];
  if (notice) tt.push(["e", mention.id], ["p", mention.pubkey]);
  else tt.push(["e", mention.id]);
  if (mention.kind === 42) {
    for (const tag of mention.tags.filter((x: any[]) => x[0] === "e")) {
      tt.push(tag);
    }
  }
  for (const tag of tags) {
    tt.push(tag);
  }
  const created_at = mention.created_at + 1;
  const event = {
    id: "",
    kind: mention.kind,
    pubkey: pk,
    created_at: created_at, // Math.floor(Date.now() / 1000),
    tags: tt,
    content: message,
    sig: "",
  };
  event.id = nostr.getEventHash(event);
  event.sig = nostr.signEvent(event, sk);
  return event;
}

await new Application()
  .use(async (ctx: Context) => {
    if (ctx.request.method === "GET") {
      const name = ctx.request.url.pathname;
      ctx.response.type = "text/html; charset=utf-8";
      ctx.response.body = page;
      return;
    } else if (ctx.request.method === "POST") {
      const mention: nostr.Event =
        (await ctx.request.body.json()) as nostr.Event;
      const m = mention.content.match(/^(\d)ぺろ$/);
      if (m && m.length === 2) {
        ctx.response.type = "application/json; charset=utf-8";
        const ee = createReplyWithTags(
          Deno.env,
          mention,
          "ぺろ".repeat(Number(m[1])),
          [],
        );
        ctx.response.body = JSON.stringify(ee);
      }
    }
  }).listen({ port: 8000 });
