<script>
  import { stores } from "@sapper/app";
  const { session } = stores();
</script>

{#if $session.authenticated}
  <slot />
{:else}
  <p>u need a friend camp acct to view this page</p>
  <p><a href="/picramp/login">click here to log in</a></p>
{/if}
