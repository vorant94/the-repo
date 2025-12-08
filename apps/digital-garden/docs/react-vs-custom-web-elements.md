# React vs Custom Web Elements

Talking about UI interactivity in Astro there are generaly two options:

1. connect framework adapter and use React/Vue/Angular
2. wrap component template with custom tag and define custom web element for it

Then with either of these approaches you'll have option to dynamically fetch data, modify DOM etc. client-side with JS.

While second approach may look more clean as it requires the least amount of JS bloat it is strictly a one-way solution. Meaning you can't conveniently reuse ui components like Button in client-side code if Button is an Astro component.

On the other side if Button is a React component (meaning we went with first solution) we can use it both in any Astro component as well as in interactive smart React components.

And all of it is caused by Astro philosophy on Server Islands, that generally aren't meant to be re-rendered once page is loaded. So we cannot easily offload all the re-renders of comments (once new comment added) to the server like we would do in RSC with `router.refresh()`

But i'm too tired to once again re-write these components to/from Astro. Lets try keep it with the technology of the choice at the current moment of time and see where we end up. Anyway the same reuse problem also happens in post content, that is rendered directly HTML without accounting for custom ui compoents like Text
