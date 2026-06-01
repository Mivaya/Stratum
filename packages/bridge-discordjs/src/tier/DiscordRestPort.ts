import type { RestPort, RestRequest } from "@stratum/core";
import { REST } from "discord.js";

function toRequestOptions(req: RestRequest): { body?: unknown; query?: URLSearchParams } {
  const options: { body?: unknown; query?: URLSearchParams } = {};
  if (req.body !== undefined) options.body = req.body;
  if (req.query !== undefined) {
    options.query = new URLSearchParams(req.query);
  }
  return options;
}

/** Local Discord REST client implementing {@link RestPort}. */
export class DiscordRestPort implements RestPort {
  constructor(private readonly rest: REST) {}

  async request<T = unknown>(req: RestRequest): Promise<T> {
    const options = toRequestOptions(req);
    const route = req.route as `/${string}`;

    switch (req.method) {
      case "GET":
        return (await this.rest.get(route, options)) as T;
      case "POST":
        return (await this.rest.post(route, options)) as T;
      case "PATCH":
        return (await this.rest.patch(route, options)) as T;
      case "PUT":
        return (await this.rest.put(route, options)) as T;
      case "DELETE":
        return (await this.rest.delete(route, options)) as T;
    }
  }
}

export function createDiscordRest(token: string): REST {
  return new REST({ version: "10" }).setToken(token);
}
