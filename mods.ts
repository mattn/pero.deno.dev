import { Buffer } from "https://deno.land/std/io/mod.ts";
import { Application, Context } from "https://deno.land/x/oak/mod.ts";
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

await new Application()
  .use(async (ctx: Context) => {
    if (ctx.request.method === "GET") {
      const name = ctx.request.url.pathname;
      ctx.response.type = "text/html; charset=utf-8";
      ctx.response.body = page;
      return;
    } else if (ctx.request.method === "POST") {
      //const username !== Deno.env.get("XXX");
      const event = (await ctx.request.body().value) as nostr.Event;
      console.log(event);
      ctx.response.type = "application/json; charset=utf-8";
      ctx.response.body = JSON.stringify(event);
    }
  }).listen({ port: 8000 });
