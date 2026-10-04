---
title: "Building a Type-Safe Mobile App: AdonisJS API with Tuyau and TanStack Query in React Native Expo"
slug: "adonisjs-api-tuyau-tanstack-query-react-native-expo"
excerpt: Building a type-safe mobile app with AdonisJS API, Tuyau, and TanStack Query in React Native Expo.
publishedAt: "2026-10-04"
tags: ["guide"]
---

# Building a Type-Safe Mobile App: AdonisJS API with Tuyau and TanStack Query in React Native Expo

**TL;DR:** In this post, you will learn how to connect a React Native Expo app to an AdonisJS v7 API using three tools that work very well together:

- **AdonisJS v7** for the backend API
- **Tuyau** to generate a type-safe API client (no manual types to maintain)
- **TanStack Query** to fetch, cache, and refresh data in the mobile app

At the end, renaming a field in your API will break your mobile app at compile time — not in production. That is the promise of this stack, and we will set it up step by step.

---

## Why this stack works well for mobile apps

If you build mobile apps with React Native and a backend API, you know the classic problems:

- You write the same types twice: once on the server, once in the app.
- A small change in the API breaks the app silently, and you discover it late.
- Managing loading states, errors, caching, and pull-to-refresh by hand is painful.

This stack solves each problem:

- **AdonisJS v7** ships with end-to-end type safety. When you define a route with validation, the types flow to any frontend that consumes the API through [Tuyau](https://adonisjs.com/blog/introducing-tuyau), its type-safe client built on top of fetch.
- **Tuyau** reads your routes, validators, and controllers, and generates a client where route parameters, request bodies, and response shapes are all type-checked.
- **TanStack Query** is designed to work out of the box with React Native. It handles caching, retries, background refetching, and loading/error states for you.

In short: the backend owns the types, Tuyau transports them, and TanStack Query manages the server state in your app. You write almost no data-fetching code yourself.

---

## What you need before starting

- **Node.js 24 or above** — AdonisJS v7 requires it ([source](https://adonisjs.com/blog/v7))
- Basic knowledge of TypeScript
- An Android or iOS emulator, or a physical device with the Expo Go app
- About 30 minutes

---

## Part 1: Create the AdonisJS API

First, create an AdonisJS v7 project with the API starter kit:

```bash
npm init adonisjs@latest blog-api -- -K=api
```

The initializer will create a new directory and set up an API server that responds with JSON ([installation guide](https://docs.adonisjs.com/installation)).

Then install the Tuyau core package and start the dev server:

```bash
cd blog-api
npm install @tuyau/core
node ace serve --watch
```

Your API now runs on `http://localhost:3333`.

### Define the routes

We will build a small "posts" resource. Open `start/routes.ts`:

```ts
import router from "@adonisjs/core/services/router";

const PostsController = () => import("#controllers/posts_controller");

router.get("/posts", [PostsController, "index"]).as("posts.index");
router.get("/posts/:id", [PostsController, "show"]).as("posts.show");
router.post("/posts", [PostsController, "store"]).as("posts.store");
```

### Add a validator

In AdonisJS, you validate input with VineJS. Create `app/validators/post.ts`:

```ts
import vine from "@vinejs/vine";

export const createPostValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3),
    body: vine.string().minLength(10),
  }),
);
```

### Write the controller

Create `app/controllers/posts_controller.ts`:

```ts
import { HttpContext } from "@adonisjs/core/http_server";
import { createPostValidator } from "#validators/post";

// Pretend this is your database for now
const posts = [
  { id: 1, title: "Hello AdonisJS", body: "My first post from the API." },
  { id: 2, title: "Hello Tuyau", body: "Types are flowing to my app!" },
];

export default class PostsController {
  async index({ request }: HttpContext) {
    const page = request.input("page", 1);
    return posts.slice((page - 1) * 10, page * 10);
  }

  async show({ params }: HttpContext) {
    return posts.find((post) => post.id === Number(params.id));
  }

  async store({ request }: HttpContext) {
    const payload = await request.validateUsing(createPostValidator);
    const post = { id: posts.length + 1, ...payload };
    posts.push(post);
    return post;
  }
}
```

### Generate the Tuyau client types

This is the key step. Run:

```bash
node ace tuyau:generate
```

This command generates a `.adonisjs` folder at the root of your AdonisJS project, containing the definition of your API and the exported types ([Tuyau installation docs](https://tuyau.julr.dev/docs/installation)). This folder is what your Expo app will import. You never edit it by hand — you just regenerate it when your API changes.

---

## Part 2: Set up the React Native Expo app

Create a new Expo app:

```bash
npx create-expo-app@latest blog-mobile
cd blog-mobile
```

Install the client packages:

```bash
npm install @tuyau/client @tuyau/react-query @tanstack/react-query
npx expo install expo-network
```

- `@tuyau/client` — the type-safe HTTP client
- `@tuyau/react-query` — the official TanStack Query integration for Tuyau
- `expo-network` — lets TanStack Query know when the device is online or offline ([TanStack Query React Native docs](https://tanstack.com/query/v5/docs/framework/react/react-native))

### Connect the generated types to the app

The `.adonisjs` folder generated in Part 1 is the bridge between your API and your app. Two common setups:

**Option A — Copy the folder (simplest).** Copy the `.adonisjs` folder from `blog-api` into the root of `blog-mobile`. Whenever you change your API, run `node ace tuyau:generate` again and copy it again. Simple and works for small projects.

**Option B — Monorepo.** Put both projects in one repository with npm workspaces, and import the API definition directly from the backend workspace. This is the cleaner long-term setup, but it takes more initial configuration.

For this guide, we go with Option A. Your Expo project should now look like this:

```text
blog-mobile/
├── .adonisjs/
│   ├── api.ts
│   └── index.ts
├── app/
└── package.json
```

### Create the Tuyau client

Create `lib/api.ts` in your Expo project:

```ts
import { createTuyau } from "@tuyau/client";
import { createTuyauReactQueryClient } from "@tuyau/react-query";
import { api } from "../.adonisjs/api";

// Important: on a real device, localhost points to the phone itself,
// not your computer. Use your computer's LAN IP instead.
const tuyauClient = createTuyau({
  api,
  baseUrl: "http://192.168.1.10:3333",
});

export const tuyau = createTuyauReactQueryClient({ client: tuyauClient });
export { tuyauClient };
```

`createTuyauReactQueryClient` wraps your Tuyau client and gives every route a `queryOptions` method that plugs directly into `useQuery`.

> **Device networking tip:** find your computer's local IP (`ipconfig` on Windows, `ifconfig`/`ip addr` on Linux and macOS) and make sure the phone is on the same Wi-Fi. If your network blocks local connections, run `npx expo start --tunnel` and use the tunnel URL as your `baseUrl`.

---

## Part 3: Wire TanStack Query into the app

If you use Expo Router, open `app/_layout.tsx` and wrap your app with the query client provider:

```tsx
import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
} from "@tanstack/react-query";
import * as Network from "expo-network";
import { Stack } from "expo-router";

// Let TanStack Query follow the device network state
onlineManager.setEventListener((setOnline) => {
  const eventSubscription = Network.addNetworkStateListener((state) => {
    setOnline(!!state.isConnected);
  });

  Network.getNetworkStateAsync()
    .then((state) => setOnline(!!state.isConnected))
    .catch(() => {
      // getNetworkStateAsync can reject on some platforms/SDK versions
    });

  return eventSubscription.remove;
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // data is fresh for 1 minute
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
```

The `onlineManager` part matters on mobile: when the phone loses the connection, TanStack Query pauses queries instead of failing them, and resumes when the network comes back.

---

## Part 4: Fetch data with full type safety

Now the fun part. Create `app/index.tsx` and display the list of posts:

```tsx
import { useQuery } from "@tanstack/react-query";
import { FlatList, Text, View } from "react-native";
import { tuyau } from "../lib/api";

export default function PostsScreen() {
  const { data, isPending, error } = useQuery(
    tuyau.posts.$get.queryOptions({ page: 1 }),
  );

  if (isPending) return <Text>Loading…</Text>;
  if (error) return <Text>Could not load posts.</Text>;

  return (
    <FlatList
      data={data}
      keyExtractor={(post) => String(post.id)}
      renderItem={({ item }) => (
        <View style={{ padding: 16 }}>
          <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
          <Text>{item.body}</Text>
        </View>
      )}
    />
  );
}
```

Look at what is happening here:

- `tuyau.posts.$get` — the route, the query parameters, and the response are all typed from your AdonisJS routes and controller. TypeScript knows `data` is an array of posts with `id`, `title`, and `body`.
- If you rename `title` to `heading` in your controller and regenerate the client, `item.title` becomes a compile error in your app. That is end-to-end type safety doing its job ([AdonisJS v7 announcement](https://adonisjs.com/blog/v7)).

### Query a single post

For a route with a parameter like `/posts/:id`, pass it directly:

```tsx
const { data: post } = useQuery(
  tuyau.posts({ id: postId }).$get.queryOptions(),
);
```

### Add pull-to-refresh

Pull-to-refresh is a natural pattern on mobile, and TanStack Query makes it a two-liner:

```tsx
const { data, refetch, isRefetching } = useQuery(
  tuyau.posts.$get.queryOptions({ page: 1 })
)

<FlatList
  data={data}
  refreshing={isRefetching}
  onRefresh={() => refetch()}
  // ...keyExtractor, renderItem
/>
```

### Refetch when the screen regains focus

With React Navigation or Expo Router, you can refetch stale data when the user comes back to a screen:

```tsx
import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

export function useRefetchOnFocus() {
  const queryClient = useQueryClient();
  const firstTime = React.useRef(true);

  useFocusEffect(
    React.useCallback(() => {
      if (firstTime.current) {
        firstTime.current = false;
        return;
      }
      queryClient.refetchQueries({ stale: true, type: "active" });
    }, [queryClient]),
  );
}
```

---

## Part 5: Mutations and cache invalidation

Fetching is only half the job. Here is how to create a post from the app and refresh the list afterwards:

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tuyau, tuyauClient } from "../lib/api";

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { title: string; body: string }) =>
      tuyauClient.posts.$post({ body: input }),
    onSuccess: () => {
      // Refetch the posts list after creating a post
      queryClient.invalidateQueries();
    },
  });
}
```

Two things to notice:

1. The mutation input is typed from your Vine validator on the backend. Forget the `body` field and TypeScript tells you before you even run the app. If validation fails on the server, the response error is also typed.
2. Tuyau also offers built-in invalidation helpers with different levels of granularity, so you can invalidate exactly one route instead of everything ([TanStack Query guide on AdonisJS docs](https://docs.adonisjs.com/guides/frontend/tanstack-query)):

```ts
// Invalidate just the posts list
tuyau.posts.$get.invalidate();
```

Use it in `onSuccess` instead of the broad `invalidateQueries()` when your app grows.

---

## Common problems and fixes

**My device cannot reach the API.** `localhost` does not work on a real device — it points to the phone itself. Use your computer's LAN IP, or start Expo with `npx expo start --tunnel`.

**Types are out of date after I changed the API.** Run `node ace tuyau:generate` in the API project and copy the `.adonisjs` folder to the Expo project again (unless you are in a monorepo, where the import picks up changes directly).

**I get version mismatch errors.** Make sure `@tuyau/react-query` and `@tuyau/core` are on compatible versions — keep them updated together in both projects ([AdonisJS docs](https://docs.adonisjs.com/guides/frontend/tanstack-query)).

**Queries stay in "loading" forever on Android.** Check that cleartext HTTP traffic is allowed for your dev IP. With Expo Go this works out of the box; for development builds you may need to review your network security config.

---

## FAQ

**Is Tuyau only for AdonisJS?**  
Yes, Tuyau is built specifically for AdonisJS. It reads your routes, validators, and controllers to generate the client. For other backends, look at tRPC or ts-rest for a similar experience.

**Do I need TanStack Query if I have Tuyau?**  
They solve different problems. Tuyau is the transport layer (typed HTTP calls). TanStack Query is the state manager (caching, retries, background updates). You can use Tuyau alone, but on mobile you really want both.

**Does this work with Expo Router?**  
Yes. Wrap your root layout with `QueryClientProvider` as shown in Part 3, and everything works in any screen.

**Does it work with authentication?**  
Yes. The Tuyau client is built on fetch/Ky, so you can add headers, tokens, and refresh logic in one place when creating the client. AdonisJS API starter kit also supports access tokens out of the box.

---

## Conclusion

With this setup, your mobile app and your API share one source of truth for types. The backend defines the routes and validation once, Tuyau transports the types to Expo, and TanStack Query handles all the server state: caching, retries, offline behavior, pull-to-refresh, and focus refetching.

The stack we covered — AdonisJS v7, Tuyau, TanStack Query, React Native Expo — is the one I use to build mobile products for clients. If you need a type-safe API and mobile app built on this foundation, [get in touch](/contact) — I would be happy to help.

**Further reading:**

- [Type-safe API Client — AdonisJS Documentation](https://docs.adonisjs.com/guides/frontend/api-client)
- [Introducing Tuyau — AdonisJS Blog](https://adonisjs.com/blog/introducing-tuyau)
- [AdonisJS v7 announcement](https://adonisjs.com/blog/v7)
- [TanStack Query with React Native](https://tanstack.com/query/v5/docs/framework/react/react-native)
- [Tuyau installation](https://tuyau.julr.dev/docs/installation)
